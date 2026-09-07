#!/usr/bin/env python3
"""
Sentix Sentiment API
--------------------
FastAPI service for the RNN sentiment model trained in
Sentiment_analysis_with_RNN.ipynb.

Model pipeline intentionally matches the notebook:
lowercase -> remove non [a-z0-9 whitespace] -> tokenizer -> pad to 200
-> Embedding(5000, 16) -> SimpleRNN(64) -> sigmoid.
"""

from __future__ import annotations

import json
import logging
import os
import re
import shutil
import tempfile
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List

import h5py
import numpy as np
import pickle
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("SENTIMENT_MODEL_PATH", BASE_DIR / "sentiment_model.h5"))
TOKENIZER_PATH = Path(os.getenv("SENTIMENT_TOKENIZER_PATH", BASE_DIR / "tokenizer.pkl"))

MAX_LENGTH = int(os.getenv("SENTIMENT_MAX_LENGTH", "200"))
MAX_REVIEW_LENGTH = int(os.getenv("MAX_REVIEW_LENGTH", "1000"))
MAX_BATCH_SIZE = int(os.getenv("MAX_BATCH_SIZE", "50"))
THRESHOLD = float(os.getenv("SENTIMENT_THRESHOLD", "0.5"))

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("jobtrunk-sentiment-api")

model = None
tokenizer = None
model_load_error = None

# Exact text normalization used in the training notebook.
CLEAN_RE = re.compile(r"[^a-z0-9\s]")


def preprocess_text(text: str) -> str:
    text = text.lower()
    return CLEAN_RE.sub("", text)


def load_artifacts() -> None:
    global model, tokenizer, model_load_error

    try:
        logger.info("Loading model: %s", MODEL_PATH)
        logger.info("Loading tokenizer: %s", TOKENIZER_PATH)

        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        if not TOKENIZER_PATH.exists():
            raise FileNotFoundError(f"Tokenizer file not found: {TOKENIZER_PATH}")

        try:
            model = load_model(MODEL_PATH, compile=False)
        except (ValueError, TypeError) as exc:
            # Older H5 models can contain Keras metadata such as
            # quantization_config=None that newer Keras rejects.
            # Remove only this optional metadata from a temporary copy;
            # weights and architecture remain unchanged.
            if MODEL_PATH.suffix.lower() != ".h5":
                raise
            logger.warning("Using H5 compatibility loader: %s", exc)
            with tempfile.TemporaryDirectory() as tmpdir:
                compat_path = Path(tmpdir) / MODEL_PATH.name
                shutil.copy2(MODEL_PATH, compat_path)
                with h5py.File(compat_path, "r+") as h5:
                    raw_config = h5.attrs.get("model_config")
                    if raw_config is None:
                        raise
                    if isinstance(raw_config, bytes):
                        raw_config = raw_config.decode("utf-8")
                    config = json.loads(raw_config)
                    removed = 0
                    for layer in config.get("config", {}).get("layers", []):
                        layer_config = layer.get("config", {})
                        if "quantization_config" in layer_config:
                            layer_config.pop("quantization_config", None)
                            removed += 1
                    h5.attrs.modify("model_config", json.dumps(config))
                    logger.info("Removed %d incompatible optional Keras metadata field(s)", removed)
                model = load_model(compat_path, compile=False)

        with TOKENIZER_PATH.open("rb") as f:
            tokenizer = pickle.load(f)

        model_load_error = None
        logger.info("Model and tokenizer loaded successfully")
    except Exception as exc:
        model = None
        tokenizer = None
        model_load_error = str(exc)
        logger.exception("Failed to load sentiment artifacts")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    yield


app = FastAPI(
    title="Sentix Sentiment API",
    description="RNN-based sentiment prediction API for the Sentix application.",
    version="1.0.0",
    lifespan=lifespan,
)

# The React/Node app normally calls this service through the Node proxy.
# CORS is still enabled for local development and direct API testing.
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Request-ID"],
)


class ReviewRequest(BaseModel):
    review: str = Field(..., min_length=1, max_length=MAX_REVIEW_LENGTH)

    @field_validator("review")
    @classmethod
    def validate_review(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Review text cannot be empty.")
        return value


class BatchRequest(BaseModel):
    reviews: List[str] = Field(..., min_length=1, max_length=MAX_BATCH_SIZE)

    @field_validator("reviews")
    @classmethod
    def validate_reviews(cls, values: List[str]) -> List[str]:
        cleaned = []
        for value in values:
            value = value.strip()
            if not value:
                raise ValueError("Every review must contain text.")
            if len(value) > MAX_REVIEW_LENGTH:
                raise ValueError(
                    f"Each review must be at most {MAX_REVIEW_LENGTH} characters."
                )
            cleaned.append(value)
        return cleaned


class PredictionResponse(BaseModel):
    sentiment: str
    confidence: float
    raw_score: float
    request_id: str
    processing_ms: float


def ensure_model_ready() -> None:
    if model is None or tokenizer is None:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Sentiment model is unavailable.",
                "reason": model_load_error or "Model artifacts are not loaded.",
            },
        )


def predict_one(review: str, request_id: str, started: float) -> dict:
    ensure_model_ready()

    processed = preprocess_text(review)
    sequence = tokenizer.texts_to_sequences([processed])
    padded = pad_sequences(sequence, maxlen=MAX_LENGTH)

    # Model output is a sigmoid probability for class 1.
    raw_score = float(np.asarray(model.predict(padded, verbose=0)).reshape(-1)[0])

    sentiment = "Positive" if raw_score >= THRESHOLD else "Negative"
    confidence = raw_score if sentiment == "Positive" else 1.0 - raw_score

    return {
        "sentiment": sentiment,
        "confidence": round(confidence * 100, 2),
        "raw_score": round(raw_score, 6),
        "request_id": request_id,
        "processing_ms": round((time.perf_counter() - started) * 1000, 2),
    }


@app.middleware("http")
async def request_logging(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception("Unhandled API error [%s]", request_id)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal sentiment service error.", "request_id": request_id},
    )


@app.get("/api/health")
def health():
    ready = model is not None and tokenizer is not None
    return {
        "status": "ok" if ready else "degraded",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None,
        "model_ready": ready,
        "max_length": MAX_LENGTH,
        "threshold": THRESHOLD,
        "error": model_load_error,
    }


@app.get("/api/model-info")
def model_info():
    ensure_model_ready()
    return {
        "name": "Sentix RNN Sentiment Model",
        "architecture": "Embedding(5000, 16) → SimpleRNN(64, tanh) → Dense(1, sigmoid)",
        "max_features": 5000,
        "max_length": MAX_LENGTH,
        "threshold": THRESHOLD,
        "framework": "TensorFlow / Keras",
    }


@app.post("/api/predict", response_model=PredictionResponse)
def predict(payload: ReviewRequest, request: Request):
    request_id = request.state.request_id
    started = time.perf_counter()
    logger.info("Prediction request [%s], chars=%d", request_id, len(payload.review))

    result = predict_one(payload.review, request_id, started)
    return result


@app.post("/api/batch-predict")
def batch_predict(payload: BatchRequest, request: Request):
    ensure_model_ready()

    request_id = request.state.request_id
    started = time.perf_counter()

    # Batch tokenization/padding for much better throughput than N individual calls.
    processed = [preprocess_text(review) for review in payload.reviews]
    sequences = tokenizer.texts_to_sequences(processed)
    padded = pad_sequences(sequences, maxlen=MAX_LENGTH)
    raw_scores = np.asarray(model.predict(padded, verbose=0)).reshape(-1)

    results = []
    for review, raw_score in zip(payload.reviews, raw_scores):
        raw_score = float(raw_score)
        sentiment = "Positive" if raw_score >= THRESHOLD else "Negative"
        confidence = raw_score if sentiment == "Positive" else 1.0 - raw_score
        results.append(
            {
                "review": review,
                "sentiment": sentiment,
                "confidence": round(confidence * 100, 2),
                "raw_score": round(raw_score, 6),
            }
        )

    return {
        "results": results,
        "count": len(results),
        "request_id": request_id,
        "processing_ms": round((time.perf_counter() - started) * 1000, 2),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "sentiment_api:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("SENTIMENT_PORT", "5000")),
        reload=False,
    )
