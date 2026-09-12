import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { 
  getFullPortfolio, 
  saveProfile, 
  saveProjects, 
  saveExperience, 
  saveSkills, 
  saveAwards, 
  resetAllToDefaults 
} from "./src/db/portfolio.ts";

dotenv.config();

const ADMIN_PASSWORD = "6767";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", db: "cloud_sql_postgres" });
  });

  // Verify Admin Password
  app.post("/api/auth/verify", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      return res.json({ success: true, message: "Authorized" });
    }
    return res.status(401).json({ success: false, error: "ACCESS_DENIED" });
  });

  // Password-protect middleware for modifications
  const checkAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers["x-admin-password"];
    if (authHeader === ADMIN_PASSWORD) {
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: Invalid admin password" });
  };

  // Get full portfolio from database
  app.get("/api/portfolio", async (_req, res) => {
    try {
      const data = await getFullPortfolio();
      res.json(data);
    } catch (error: any) {
      console.error("Failed to retrieve portfolio data:", error);
      res.status(500).json({ error: error.message || "Database query failed" });
    }
  });

  // Save profile
  app.put("/api/portfolio/profile", checkAdminAuth, async (req, res) => {
    try {
      const result = await saveProfile(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save projects
  app.put("/api/portfolio/projects", checkAdminAuth, async (req, res) => {
    try {
      const result = await saveProjects(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Failed to save projects:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save experience
  app.put("/api/portfolio/experience", checkAdminAuth, async (req, res) => {
    try {
      const result = await saveExperience(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Failed to save experience:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save skills
  app.put("/api/portfolio/skills", checkAdminAuth, async (req, res) => {
    try {
      const result = await saveSkills(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Failed to save skills:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save awards
  app.put("/api/portfolio/awards", checkAdminAuth, async (req, res) => {
    try {
      const result = await saveAwards(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Failed to save awards:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Reset to default
  app.post("/api/portfolio/reset", checkAdminAuth, async (_req, res) => {
    try {
      const result = await resetAllToDefaults();
      res.json(result);
    } catch (error: any) {
      console.error("Failed to reset portfolio:", error);
      res.status(500).json({ error: error.message || "Database reset failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
