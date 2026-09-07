import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerSentimentProxy } from "../sentimentProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { attachUser } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";

// Import REST route modules
import authRoutes from "../routes/auth";
import skillsRoutes from "../routes/skills";
import opportunitiesRoutes from "../routes/opportunities";
import learningRoutes from "../routes/learning";
import profileRoutes from "../routes/profile";
import portfolioRoutes from "../routes/portfolio";
import facultyRoutes from "../routes/faculty";
import collaborationsRoutes from "../routes/collaborations";
import institutionRoutes from "../routes/institution";
import analyticsRoutes from "../routes/analytics";
import notificationsRoutes from "../routes/notifications";
import messagingRoutes from "../routes/messaging";
import adminRoutes from "../routes/admin";
import reportsRoutes from "../routes/reports";
import integrationsRoutes from "../routes/integrations";
import careerGuidanceRoutes from "../routes/careerGuidance";
import aiRoutes from "../routes/ai";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Global auth middleware — attaches user to req.user for all routes
  app.use(attachUser);

  // Register existing middleware
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerSentimentProxy(app);

  // Register all REST routes under /api — the client calls /api/... paths
  app.use("/api/auth", authRoutes);
  app.use("/api", skillsRoutes);
  app.use("/api", opportunitiesRoutes);
  app.use("/api", learningRoutes);
  app.use("/api", profileRoutes);
  app.use("/api", portfolioRoutes);
  app.use("/api", facultyRoutes);
  app.use("/api", collaborationsRoutes);
  app.use("/api", institutionRoutes);
  app.use("/api", analyticsRoutes);
  app.use("/api", notificationsRoutes);
  app.use("/api", messagingRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", reportsRoutes);
  app.use("/api", integrationsRoutes);
  app.use("/api", careerGuidanceRoutes);
  app.use("/api", aiRoutes);

  // tRPC API (kept for backward compatibility)
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Global error handler
  app.use(errorHandler);

  // Development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`API available at http://localhost:${port}/api/`);
  });
}

startServer().catch(console.error);
