import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import * as integrationService from "../services/integrationService";

const router = Router();

// GET /api/integrations — list available integrations
router.get("/integrations", requireAuth, async (req: Request, res: Response) => {
  try {
    const integrations = await integrationService.getConnectedIntegrations();
    const available = integrationService.getAvailableIntegrations();
    res.json({ connected: integrations, available });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/integrations — connect to a platform
router.post("/integrations", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { platform, apiUrl, apiKey } = req.body;
    const result = await integrationService.connectIntegration(platform, { apiUrl, apiKey });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/integrations/:platform
router.delete("/integrations/:platform", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const result = await integrationService.disconnectIntegration(req.params.platform as any);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/integrations/:platform/sync
router.post("/integrations/:platform/sync", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const result = await integrationService.syncIntegration(req.params.platform as any);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/integrations/:platform/status
router.get("/integrations/:platform/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const status = await integrationService.getSyncStatus(req.params.platform as any);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/integrations/webhook/:platform — receive webhook
router.post("/integrations/webhook/:platform", async (req: Request, res: Response) => {
  try {
    const result = await integrationService.handleWebhook(req.params.platform, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
