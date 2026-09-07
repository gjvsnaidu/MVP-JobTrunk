import { Express } from "express";
import axios from "axios";

const SENTIMENT_API_URL =
  process.env.SENTIMENT_API_URL ||
  process.env.FLASK_API_URL ||
  "http://127.0.0.1:5000";

const MAX_REVIEW_LENGTH = 1000;
const MAX_BATCH_SIZE = 50;

function serviceUnavailable(res: any, message: string) {
  return res.status(503).json({
    error: message,
    service: "sentiment-api",
  });
}

export function registerSentimentProxy(app: Express) {
  app.get("/api/sentiment/health", async (_req, res) => {
    try {
      const response = await axios.get(`${SENTIMENT_API_URL}/api/health`, {
        timeout: 5000,
      });
      res.status(response.data?.model_ready ? 200 : 503).json(response.data);
    } catch (error) {
      console.error("Sentiment API health check failed:", error);
      return serviceUnavailable(
        res,
        "Sentiment API is unavailable. Start the Python API on port 5000."
      );
    }
  });

  app.get("/api/sentiment/model-info", async (_req, res) => {
    try {
      const response = await axios.get(`${SENTIMENT_API_URL}/api/model-info`, {
        timeout: 5000,
      });
      res.json(response.data);
    } catch (error) {
      console.error("Sentiment model info failed:", error);
      return serviceUnavailable(res, "Sentiment model is unavailable.");
    }
  });

  app.post("/api/predict", async (req, res) => {
    try {
      const review = req.body?.review;

      if (typeof review !== "string" || !review.trim()) {
        return res.status(400).json({
          error: "Review text is required.",
        });
      }

      const normalizedReview = review.trim();

      if (normalizedReview.length > MAX_REVIEW_LENGTH) {
        return res.status(400).json({
          error: `Review must be ${MAX_REVIEW_LENGTH} characters or fewer.`,
        });
      }

      const response = await axios.post(
        `${SENTIMENT_API_URL}/api/predict`,
        { review: normalizedReview },
        {
          timeout: 30000,
          headers: {
            "Content-Type": "application/json",
            ...(req.headers["x-request-id"]
              ? { "X-Request-ID": req.headers["x-request-id"] as string }
              : {}),
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("Sentiment prediction error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
        if (error.code === "ECONNREFUSED" || error.code === "ECONNABORTED") {
          return serviceUnavailable(
            res,
            "Sentiment API is unavailable. Start the Python backend first."
          );
        }
        if (error.code === "ETIMEDOUT") {
          return res.status(504).json({
            error: "Sentiment prediction timed out. Please try again.",
          });
        }
      }

      return res.status(500).json({
        error: "An error occurred while analyzing sentiment.",
      });
    }
  });

  app.post("/api/batch-predict", async (req, res) => {
    try {
      const reviews = req.body?.reviews;

      if (!Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({
          error: "Reviews must be a non-empty array.",
        });
      }

      if (reviews.length > MAX_BATCH_SIZE) {
        return res.status(400).json({
          error: `A maximum of ${MAX_BATCH_SIZE} reviews can be analyzed at once.`,
        });
      }

      if (
        reviews.some(
          (review) =>
            typeof review !== "string" ||
            !review.trim() ||
            review.length > MAX_REVIEW_LENGTH
        )
      ) {
        return res.status(400).json({
          error: `Each review must be a non-empty string of ${MAX_REVIEW_LENGTH} characters or fewer.`,
        });
      }

      const response = await axios.post(
        `${SENTIMENT_API_URL}/api/batch-predict`,
        { reviews: reviews.map((review) => review.trim()) },
        {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("Batch sentiment prediction error:", error);

      if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      return serviceUnavailable(
        res,
        "Unable to reach the sentiment API."
      );
    }
  });
}
