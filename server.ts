import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large backup payloads if needed
  app.use(express.json({ limit: "50mb" }));

  // Dossier local pour stocker les sauvegardes de secours
  const backupFolder = path.join(process.cwd(), "sauvegardes");
  try {
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }
  } catch (err) {
    console.warn("[GMAO SERVER] Impossible de creer le dossier de sauvegarde:", err);
  }

  // 1. Endpoint pour enregistrer la sauvegarde automatique sur le disque dur
  app.post("/api/backup", (req, res) => {
    try {
      const data = req.body;
      const backupPath = path.join(backupFolder, "gmao_backup_auto.json");
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), "utf8");

      // Creer aussi une copie d'historique datee pour securite
      try {
        const dateStr = new Date().toISOString().replace(/:/g, "-").split(".")[0];
        const historicPath = path.join(backupFolder, `gmao_backup_${dateStr}.json`);
        fs.writeFileSync(historicPath, JSON.stringify(data, null, 2), "utf8");

        // Conserver uniquement les 10 dernieres sauvegardes historiques
        const files = fs.readdirSync(backupFolder)
          .filter(f => f.startsWith("gmao_backup_20") && f.endsWith(".json"))
          .map(f => ({ name: f, time: fs.statSync(path.join(backupFolder, f)).mtime.getTime() }))
          .sort((a, b) => b.time - a.time);

        if (files.length > 10) {
          for (let i = 10; i < files.length; i++) {
            fs.unlinkSync(path.join(backupFolder, files[i].name));
          }
        }
      } catch (e) {
        console.warn("Echec de la creation de la sauvegarde historique:", e);
      }

      res.json({ success: true, message: "Sauvegarde enregistree sur le disque." });
    } catch (error: any) {
      console.error("Backup write error:", error);
      res.status(500).json({ success: false, error: error?.message || "Erreur disque" });
    }
  });

  // 2. Endpoint pour recuperer la derniere sauvegarde automatique du disque dur
  app.get("/api/backup", (req, res) => {
    try {
      const backupPath = path.join(backupFolder, "gmao_backup_auto.json");
      if (fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, "utf8");
        res.json({ success: true, data: JSON.parse(data) });
      } else {
        res.json({ success: false, message: "Aucune sauvegarde trouvee." });
      }
    } catch (error: any) {
      console.error("Backup read error:", error);
      res.status(500).json({ success: false, error: error?.message || "Erreur lecture disque" });
    }
  });

  // Serveur de developpement Vite ou fichiers de production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GMAO SERVER] Serveur demarre sur http://localhost:${PORT}`);
  });
}

startServer();
