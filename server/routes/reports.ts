import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import * as reportService from "../services/reportService";

const router = Router();

// GET /api/reports/types
router.get("/reports/types", requireAuth, async (req: Request, res: Response) => {
  const types = reportService.getReportTypes();
  res.json(types);
});

// POST /api/reports/generate
router.post("/reports/generate", requireAuth, async (req: Request, res: Response) => {
  try {
    const { type, parameters, format } = req.body;

    const report = await reportService.generateReport(type, parameters);

    if (format === "csv") {
      const csvData = reportService.generateCSV(
        Array.isArray(report.data) ? report.data : [report.data]
      );
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${type}_report.csv"`);
      return res.send(csvData);
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/:id — in production this would fetch a stored report
router.get("/reports/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    // For now, return the report ID as pending
    res.json({
      id: req.params.id,
      status: "completed",
      downloadUrl: null,
      message: "Report generation is available via POST /api/reports/generate",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
