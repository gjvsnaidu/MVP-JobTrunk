import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";
import * as portfolioDb from "../db/portfolio";
import { storagePut } from "../storage";

const router = Router();

// =============================================================================
// Portfolio Items
// =============================================================================

// GET /api/portfolio — my portfolio
router.get("/portfolio", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const items = await portfolioDb.listPortfolioItems(user.id);
  res.json(items);
});

// GET /api/portfolio/:userId — public portfolio
router.get("/portfolio/:userId", requireAuth, async (req: Request, res: Response) => {
  const items = await portfolioDb.listPortfolioItems(Number(req.params.userId));
  res.json(items);
});

const portfolioItemSchema = z.object({
  type: z.enum(["certification", "project", "internship", "achievement", "skill", "education"]),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().optional(),
  issuedBy: z.string().optional(),
  date: z.string().optional(),
  endDate: z.string().optional(),
  documentUrl: z.string().optional(),
  metadata: z.any().optional(),
  sortOrder: z.number().optional(),
});

// POST /api/portfolio
router.post("/portfolio", requireAuth, validate(portfolioItemSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const id = await portfolioDb.createPortfolioItem({
      ...req.body,
      userId: user.id,
      date: req.body.date ? new Date(req.body.date) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    });
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/portfolio/:id
router.put("/portfolio/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const item = await portfolioDb.getPortfolioItemById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Not found" });
    if (item.userId !== user.id) return res.status(403).json({ error: "Not authorized" });

    await portfolioDb.updatePortfolioItem(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/portfolio/:id
router.delete("/portfolio/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await portfolioDb.deletePortfolioItem(Number(req.params.id), user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/portfolio/reorder
router.patch("/portfolio/reorder", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await portfolioDb.reorderPortfolioItems(user.id, req.body.itemIds);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/portfolio/:id/verify
router.post("/portfolio/:id/verify", requireRole("admin", "institution"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await portfolioDb.verifyPortfolioItem(Number(req.params.id), user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// Documents
// =============================================================================

// POST /api/documents/upload-url
router.post("/documents/upload-url", requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileName, mimeType } = req.body;
    const user = getUser(req);
    const key = `documents/${user.id}/${Date.now()}_${fileName}`;
    const { url } = await storagePut(key, Buffer.from(""), mimeType);
    res.json({ uploadUrl: url, key });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents — register a document after upload
const registerDocSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["resume", "certificate", "transcript", "report", "portfolio"]),
  fileUrl: z.string().min(1),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  metadata: z.any().optional(),
});

router.post("/documents", requireAuth, validate(registerDocSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const id = await portfolioDb.createDocument({ ...req.body, userId: user.id });
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents
router.get("/documents", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const docs = await portfolioDb.listDocuments(user.id);
  res.json(docs);
});

// DELETE /api/documents/:id
router.delete("/documents/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await portfolioDb.deleteDocument(Number(req.params.id), user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents/:id/verify
router.post("/documents/:id/verify", requireRole("admin", "institution"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await portfolioDb.verifyDocument(Number(req.params.id), user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
