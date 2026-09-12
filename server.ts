import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { 
  getSupabaseProfile, 
  saveSupabaseProfile, 
  getSupabaseProjects, 
  saveSupabaseProjects, 
  getSupabaseExperience, 
  saveSupabaseExperience, 
  getSupabaseSkills, 
  saveSupabaseSkills, 
  getSupabaseAwards, 
  saveSupabaseAwards,
  supabase
} from "./src/lib/supabase.ts";
import { DEFAULT_PROFILE_DATA, PROJECTS_DATA, EXPERIENCE_DATA, SKILLS_DATA, AWARDS_DATA } from "./src/data.ts";

dotenv.config();

const ADMIN_PASSWORD = "6767";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      provider: "supabase_postgresql",
      supabaseUrl: process.env.SUPABASE_URL || "https://hpqbkuufgsuyqleohdwl.supabase.co"
    });
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

  // Get full portfolio from Supabase (with fallback)
  app.get("/api/portfolio", async (_req, res) => {
    try {
      const [profile, projects, experience, skills, awards] = await Promise.all([
        getSupabaseProfile(),
        getSupabaseProjects(),
        getSupabaseExperience(),
        getSupabaseSkills(),
        getSupabaseAwards(),
      ]);

      res.json({
        profile: profile || DEFAULT_PROFILE_DATA,
        projects: projects || PROJECTS_DATA,
        experience: experience || EXPERIENCE_DATA,
        skills: skills || SKILLS_DATA,
        awards: awards || AWARDS_DATA,
      });
    } catch (error: any) {
      console.error("Failed to retrieve portfolio data from Supabase:", error);
      res.json({
        profile: DEFAULT_PROFILE_DATA,
        projects: PROJECTS_DATA,
        experience: EXPERIENCE_DATA,
        skills: SKILLS_DATA,
        awards: AWARDS_DATA,
      });
    }
  });

  // Save profile
  app.put("/api/portfolio/profile", checkAdminAuth, async (req, res) => {
    try {
      await saveSupabaseProfile(req.body);
      res.json(req.body);
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save projects
  app.put("/api/portfolio/projects", checkAdminAuth, async (req, res) => {
    try {
      await saveSupabaseProjects(req.body);
      res.json(req.body);
    } catch (error: any) {
      console.error("Failed to save projects:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save experience
  app.put("/api/portfolio/experience", checkAdminAuth, async (req, res) => {
    try {
      await saveSupabaseExperience(req.body);
      res.json(req.body);
    } catch (error: any) {
      console.error("Failed to save experience:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save skills
  app.put("/api/portfolio/skills", checkAdminAuth, async (req, res) => {
    try {
      await saveSupabaseSkills(req.body);
      res.json(req.body);
    } catch (error: any) {
      console.error("Failed to save skills:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Save awards
  app.put("/api/portfolio/awards", checkAdminAuth, async (req, res) => {
    try {
      await saveSupabaseAwards(req.body);
      res.json(req.body);
    } catch (error: any) {
      console.error("Failed to save awards:", error);
      res.status(500).json({ error: error.message || "Database update failed" });
    }
  });

  // Reset to default
  app.post("/api/portfolio/reset", checkAdminAuth, async (_req, res) => {
    try {
      await Promise.all([
        saveSupabaseProfile(DEFAULT_PROFILE_DATA),
        saveSupabaseProjects(PROJECTS_DATA),
        saveSupabaseExperience(EXPERIENCE_DATA),
        saveSupabaseSkills(SKILLS_DATA),
        saveSupabaseAwards(AWARDS_DATA),
      ]);
      res.json({
        profile: DEFAULT_PROFILE_DATA,
        projects: PROJECTS_DATA,
        experience: EXPERIENCE_DATA,
        skills: SKILLS_DATA,
        awards: AWARDS_DATA,
      });
    } catch (error: any) {
      console.error("Failed to reset portfolio:", error);
      res.status(500).json({ error: error.message || "Database reset failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
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
