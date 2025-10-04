import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runWaidBotCycle } from "./runners/waidBotEngineRunner";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // DISABLED: Duplicate WebSocket broadcaster on /ws causing code 1006 errors
  // The konsMeshManager in server/routes.ts handles /ws instead
  // try {
  //   const { getKonsAiMeshWebSocketBroadcaster } = await import('./services/konsaiMeshWebSocketBroadcaster.js');
  //   const webSocketBroadcaster = getKonsAiMeshWebSocketBroadcaster();
  //   webSocketBroadcaster.initialize(server);
  //   log('🔌 KonsMesh WebSocket Broadcaster initialized');
  // } catch (error) {
  //   console.error('❌ Failed to initialize KonsMesh WebSocket Broadcaster:', error);
  // }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // ⏱️ WaidBot auto-cycle: every 2 minutes to reduce database load
  setInterval(() => {
    runWaidBotCycle().catch(error => {
      console.error('WaidBot cycle error caught in main:', error);
    });
  }, 120 * 1000); // 2 minutes to reduce API rate limiting
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
