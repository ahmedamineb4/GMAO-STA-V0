import nodemailer from "nodemailer";
import { checkNeonConnection, loadAllDataFromNeon, saveAllDataToNeon } from "../server/db.js";

// Vercel Serverless Function Handler for GMAO STA Chery
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Parse path from URL
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = url.pathname;

  // Normalize path if rewrites stripped /api
  if (!pathname.startsWith("/api")) {
    pathname = "/api" + pathname;
  }

  try {
    // 1. Statut de connexion Neon DB
    if (pathname === "/api/db/status" && req.method === "GET") {
      const status = await checkNeonConnection();
      return res.status(200).json(status);
    }

    // 2. Charger les données depuis Neon DB
    if ((pathname === "/api/db/data" || pathname === "/api/backup") && req.method === "GET") {
      if (process.env.DATABASE_URL) {
        const neonData = await loadAllDataFromNeon();
        if (neonData && Object.keys(neonData).length > 0) {
          return res.status(200).json({
            success: true,
            source: "neon",
            data: neonData
          });
        }
      }
      return res.status(200).json({
        success: false,
        source: "none",
        message: "Aucune donnée trouvée dans Neon PostgreSQL."
      });
    }

    // 3. Sauvegarder / Synchroniser les données dans Neon DB
    if ((pathname === "/api/db/sync" || pathname === "/api/backup") && req.method === "POST") {
      const data = req.body || {};
      let neonSaved = false;
      let neonError = null;

      if (process.env.DATABASE_URL) {
        try {
          neonSaved = await saveAllDataToNeon(data);
        } catch (e) {
          console.warn("[VERCEL NEON DB] Erreur de sauvegarde :", e);
          neonError = e?.message;
        }
      }

      return res.status(200).json({
        success: true,
        neonSaved,
        neonError,
        message: neonSaved
          ? "Données synchronisées avec succès sur Neon PostgreSQL !"
          : "Données reçues (DATABASE_URL non configurée dans Vercel)."
      });
    }

    // 4. Envoi d'emails réels via SMTP
    if (pathname === "/api/send-email" && req.method === "POST") {
      const { recipient, subject, message, details, smtpConfig } = req.body || {};

      let user = smtpConfig?.user || process.env.SMTP_USER;
      let rawPass = smtpConfig?.pass || process.env.SMTP_PASS;
      let host = smtpConfig?.host || process.env.SMTP_HOST || "smtp.office365.com";
      let port = parseInt(smtpConfig?.port || process.env.SMTP_PORT || "587", 10);

      const pass = rawPass ? String(rawPass).trim().replace(/\s+/g, "") : "";

      if (user && user.toLowerCase().includes("@gmail.com")) {
        if (!smtpConfig?.host || host === "smtp.office365.com" || host.includes("office365") || host.includes("outlook")) {
          host = "smtp.gmail.com";
          port = 587;
        }
      }

      let from = smtpConfig?.from || process.env.SMTP_FROM || user;

      if (!user || !pass) {
        return res.status(200).json({
          success: false,
          mode: "simulated",
          error: `Serveur SMTP non configuré. Renseignez SMTP_USER et SMTP_PASS dans les variables d'environnement Vercel ou dans Paramètres.`,
          message: "Mode simulation : Aucun envoi SMTP effectué."
        });
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #D32F2F; padding: 12px 20px; border-radius: 6px 6px 0 0; color: white;">
            <h2 style="margin: 0; font-size: 18px;">STA CHERY TUNISIE - Notification GMAO</h2>
          </div>
          <div style="padding: 20px; background-color: #fafafa;">
            <h3 style="color: #111827; margin-top: 0;">${subject}</h3>
            <p style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${message}</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: `GMAO STA Chery <${from}>`,
        to: recipient,
        subject,
        text: message,
        html: htmlBody
      });

      return res.status(200).json({
        success: true,
        mode: "real",
        messageId: info.messageId,
        message: `Email réel envoyé avec succès à ${recipient} !`
      });
    }

    // Default fallback
    return res.status(200).json({
      status: "online",
      service: "GMAO STA Chery API",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[VERCEL API ERROR]", error);
    return res.status(500).json({
      error: error?.message || "Erreur interne du serveur"
    });
  }
}
