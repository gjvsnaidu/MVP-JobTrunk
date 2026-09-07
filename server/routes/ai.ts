import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { getDb } from "../db/index";
import * as demo from "../demo";

const router = Router();

// POST /api/ai/ask — JobTrunk AI career copilot
// Mock logic referencing the user's real skills, gaps, readiness and matches.
// Architected so a real LLM API can be swapped in later (see demo.demoAskAI).
router.post("/ai/ask", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const question = String(req.body?.question ?? "").trim();
    if (!question) return res.status(400).json({ error: "Question is required" });

    let answer: string;
    if (!getDb()) {
      answer = await demo.demoAskAI(user.id, question);
    } else {
      answer =
        "I'm your JobTrunk career copilot. Connect a database or an LLM API to enable full responses — in the demo, try signing in with a demo account.";
    }

    res.json({ answer, timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;