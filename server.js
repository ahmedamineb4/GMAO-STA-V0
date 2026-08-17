import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { checkNeonConnection, loadAllDataFromNeon, saveAllDataToNeon } from "./server/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Support large backup payloads
  app.use(express.json({ limit: "50mb" }));

  // Dossier local pour stocker les sauvegardes de secours
  let backupFolder = path.join(process.cwd(), "sauvegardes");
  try {
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }
  } catch (err) {
    // Si process.cwd() est en lecture seule (ex: Program Files), utiliser AppData
    const appData = process.env.APPDATA || process.env.HOME || ".";
    backupFolder = path.join(appData, "GMAO-STA-Chery", "sauvegardes");
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }
  }

  // 0a. Endpoint pour vérifier le statut de connexion à la base de données Neon PostgreSQL
  app.get("/api/db/status", async (req, res) => {
    try {
      const status = await checkNeonConnection();
      res.json(status);
    } catch (error) {
      console.error("Neon status check error:", error);
      res.status(500).json({
        configured: !!process.env.DATABASE_URL,
        connected: false,
        error: error?.message || "Erreur lors de la vérification de la base Neon"
      });
    }
  });

  // 0b. Endpoint pour charger toutes les données depuis Neon (ou fallback disque)
  app.get("/api/db/data", async (req, res) => {
    try {
      if (process.env.DATABASE_URL) {
        const neonData = await loadAllDataFromNeon();
        if (neonData && Object.keys(neonData).length > 0) {
          return res.json({
            success: true,
            source: "neon",
            data: neonData
          });
        }
      }

      // Fallback sur la sauvegarde locale si Neon n'a pas encore de données ou non configuré
      const backupPath = path.join(backupFolder, "gmao_backup_auto.json");
      if (fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, "utf8");
        return res.json({
          success: true,
          source: "disk",
          data: JSON.parse(data)
        });
      }

      res.json({
        success: false,
        source: "none",
        message: "Aucune donnée trouvée."
      });
    } catch (error) {
      console.error("DB load error:", error);
      res.status(500).json({ success: false, error: error?.message || "Erreur de chargement" });
    }
  });

  // 0c. Endpoint pour synchroniser/sauvegarder toutes les données dans Neon & disque
  app.post("/api/db/sync", async (req, res) => {
    try {
      const data = req.body;
      let neonSaved = false;
      let neonError = null;

      if (process.env.DATABASE_URL) {
        try {
          neonSaved = await saveAllDataToNeon(data);
        } catch (e) {
          console.warn("[NEON DB] Échec de la sauvegarde Neon :", e);
          neonError = e?.message;
        }
      }

      // Sauvegarder également sur le disque local en copie de sécurité
      try {
        const backupPath = path.join(backupFolder, "gmao_backup_auto.json");
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), "utf8");
      } catch (e) {
        console.warn("Échec de la sauvegarde fichier local:", e);
      }

      res.json({
        success: true,
        neonSaved,
        neonError,
        message: neonSaved
          ? "Données synchronisées avec succès sur Neon PostgreSQL !"
          : "Données enregistrées en local (Neon non configuré ou hors ligne)."
      });
    } catch (error) {
      console.error("DB sync error:", error);
      res.status(500).json({ success: false, error: error?.message || "Erreur lors de la synchronisation" });
    }
  });

  // 1. Endpoint pour enregistrer la sauvegarde automatique sur le disque dur et Neon
  app.post("/api/backup", async (req, res) => {
    try {
      const data = req.body;
      let neonSaved = false;

      if (process.env.DATABASE_URL) {
        try {
          neonSaved = await saveAllDataToNeon(data);
        } catch (e) {
          console.warn("[NEON DB] Backup save error:", e);
        }
      }

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

      res.json({
        success: true,
        neonSaved,
        message: neonSaved
          ? "Sauvegarde enregistrée dans Neon PostgreSQL et sur disque !"
          : "Sauvegarde enregistrée sur le disque."
      });
    } catch (error) {
      console.error("Backup write error:", error);
      res.status(500).json({ success: false, error: error?.message || "Erreur disque" });
    }
  });

  // 2. Endpoint pour recuperer la derniere sauvegarde automatique du disque dur ou Neon
  app.get("/api/backup", async (req, res) => {
    try {
      if (process.env.DATABASE_URL) {
        try {
          const neonData = await loadAllDataFromNeon();
          if (neonData && Object.keys(neonData).length > 0) {
            return res.json({ success: true, source: "neon", data: neonData });
          }
        } catch (e) {
          console.warn("[NEON DB] Backup read error, fallback to disk:", e);
        }
      }

      const backupPath = path.join(backupFolder, "gmao_backup_auto.json");
      if (fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, "utf8");
        res.json({ success: true, source: "disk", data: JSON.parse(data) });
      } else {
        res.json({ success: false, message: "Aucune sauvegarde trouvee." });
      }
    } catch (error) {
      console.error("Backup read error:", error);
      res.status(500).json({ success: false, error: error?.message || "Erreur lecture disque" });
    }
  });

  // 2b. Endpoint pour l'envoi réel d'emails via SMTP (Outlook / Office 365 / Gmail)
  app.post("/api/send-email", async (req, res) => {
    let host = "smtp.office365.com";
    let port = 587;
    try {
      const { recipient, subject, message, details, smtpConfig } = req.body;

      // Determine SMTP host, user, pass
      let user = smtpConfig?.user || process.env.SMTP_USER;
      let rawPass = smtpConfig?.pass || process.env.SMTP_PASS;
      host = smtpConfig?.host || process.env.SMTP_HOST || "smtp.office365.com";
      port = parseInt(smtpConfig?.port || process.env.SMTP_PORT || "587", 10);

      // Clean password: strip spaces (e.g. "ikwu ayew klpu hwqr" -> "ikwuayewklpuhwqr")
      const pass = rawPass ? String(rawPass).trim().replace(/\s+/g, '') : '';

      // Auto-detect Gmail if user has @gmail.com
      if (user && user.toLowerCase().includes("@gmail.com")) {
        if (!smtpConfig?.host || host === "smtp.office365.com" || host.includes("office365") || host.includes("outlook")) {
          host = "smtp.gmail.com";
          port = 587;
        }
      }

      let from = smtpConfig?.from || process.env.SMTP_FROM;
      if (!from || (user && user.toLowerCase().includes("@gmail.com") && (from.includes("@sta-tunisie.com") || from.includes("@outlook.com")))) {
        from = user;
      }

      if (!user || !pass) {
        console.log(`[EMAIL NON ENVOYÉ] Destination: ${recipient} (Raison: Mot de passe SMTP non configuré)`);
        return res.json({
          success: false,
          mode: "simulated",
          error: `Attention : L'alerte a été enregistrée en GMAO, mais AUCUN EMAIL RÉEL n'a été transmis vers ${recipient} car le serveur SMTP n'est pas encore configuré. Allez dans Paramètres > Notifications & Email pour renseigner votre compte Gmail / Outlook et le mot de passe d'application.`,
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
            ${details ? `
              <div style="margin-top: 20px; background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <h4 style="margin: 0 0 10px 0; color: #374151;">Détails de l'alerte :</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563;">
                  ${details.equipmentCode ? `<li><strong>Équipement:</strong> ${details.equipmentCode} (${details.equipmentName || ''})</li>` : ''}
                  ${details.workshop ? `<li><strong>Atelier:</strong> ${details.workshop}</li>` : ''}
                  ${details.urgency ? `<li><strong>Urgence / Priorité:</strong> ${details.urgency}</li>` : ''}
                  ${details.author ? `<li><strong>Auteur / Technicien:</strong> ${details.author}</li>` : ''}
                </ul>
              </div>
            ` : ''}
          </div>
          <div style="padding: 12px 20px; background-color: #f3f4f6; text-align: center; font-size: 11px; color: #6b7280; border-radius: 0 0 6px 6px;">
            Cet email a été généré automatiquement par le système GMAO STA Chery Tunisie.
          </div>
        </div>
      `;

      const mailOptions = {
        from: `GMAO STA Chery <${from}>`,
        to: recipient,
        subject,
        text: message,
        html: htmlBody
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL RÉEL ENVOYÉ] Message ID: ${info.messageId} à ${recipient}`);

      return res.json({
        success: true,
        mode: "real",
        messageId: info.messageId,
        message: `Email réel envoyé avec succès à ${recipient} via ${host} !`
      });
    } catch (error) {
      const errMsg = error?.message || "Échec de l'envoi SMTP";
      console.warn("[SMTP HANDLED ERROR]", errMsg);

      let userFriendlyNotice = errMsg;
      if (errMsg.includes("535") || errMsg.includes("Authentication unsuccessful") || errMsg.includes("Invalid login") || errMsg.includes("Username and Password not accepted")) {
        if (host.includes("gmail")) {
          userFriendlyNotice = "Échec d'authentification Gmail (535) : Mot de passe ou adresse incorrect. Pour Gmail, vous DEVEZ utiliser un 'Mot de passe d'application' de 16 lettres (généré sur myaccount.google.com/apppasswords après activation de la validation en deux étapes), et NON votre mot de passe habituel.";
        } else {
          userFriendlyNotice = "Échec d'authentification SMTP (535 5.7.3) : Identifiants ou mot de passe incorrects. Si la validation en deux étapes est activée, utilisez un 'Mot de passe d'application' à 16 caractères.";
        }
      } else if (errMsg.includes("ECONNREFUSED") || errMsg.includes("ETIMEDOUT")) {
        userFriendlyNotice = `Impossible de se connecter au serveur SMTP sortant (${host}:${port}). Vérifiez l'hôte et le port.`;
      }

      return res.json({
        success: false,
        error: userFriendlyNotice,
        rawError: errMsg
      });
    }
  });

  // 3. Endpoint pour telecharger le manuel de formation au format MS Word (.doc) (Redirigé vers le guide des chefs d'atelier)
  app.get("/api/download-guide", (req, res) => {
    return res.redirect("/api/download-chef-guide");
  });

  // 3b. Endpoint pour télécharger la fiche de formation dédiée spécialement au Chef d'Atelier
  app.get("/api/download-chef-guide", (req, res) => {
    try {
      const chefGuideHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Fiche de Formation Dédiée - Chef d'Atelier GMAO STA Chery</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #222222; margin: 40px; }
  h1 { font-family: 'Segoe UI', Arial, sans-serif; color: #D32F2F; border-bottom: 3px solid #D32F2F; padding-bottom: 8px; margin-top: 40px; margin-bottom: 15px; }
  h2 { font-family: 'Segoe UI', Arial, sans-serif; color: #1976D2; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; }
  h3 { font-family: 'Segoe UI', Arial, sans-serif; color: #388E3C; margin-top: 25px; margin-bottom: 10px; }
  p, li { font-size: 11pt; text-align: justify; }
  ul, ol { margin-top: 5px; margin-bottom: 15px; }
  li { margin-bottom: 6px; }
  .cover { text-align: center; margin-top: 80px; margin-bottom: 50px; }
  .cover-title { font-size: 24pt; font-weight: bold; color: #D32F2F; margin-top: 20px; margin-bottom: 10px; }
  .cover-subtitle { font-size: 14pt; color: #555555; margin-bottom: 50px; }
  .cover-meta { font-size: 11pt; color: #666666; margin-top: 100px; line-height: 1.8; }
  .badge { background-color: #f5f5f5; border: 1px solid #cccccc; padding: 2px 6px; border-radius: 4px; font-family: Consolas, monospace; font-size: 10pt; font-weight: bold; }
  .badge-red { background-color: #FFEBEE; border-color: #FFCDD2; color: #C62828; }
  .badge-blue { background-color: #E3F2FD; border-color: #BBDEFB; color: #1565C0; }
  .badge-green { background-color: #E8F5E9; border-color: #C8E6C9; color: #2E7D32; }
  .badge-purple { background-color: #F3E5F5; border-color: #E1BEE7; color: #4A148C; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
  th, td { border: 1px solid #dddddd; padding: 10px; text-align: left; font-size: 10pt; vertical-align: top; }
  th { background-color: #F5F5F5; font-weight: bold; color: #333333; }
  .note { background-color: #FFFDE7; border-left: 5px solid #FBC02D; padding: 15px; margin: 15px 0; border-radius: 4px; }
  .alert { background-color: #FFEBEE; border-left: 5px solid #D32F2F; padding: 15px; margin: 15px 0; border-radius: 4px; }
  .exercise { background-color: #E8F5E9; border-left: 5px solid #2E7D32; padding: 15px; margin: 15px 0; border-radius: 4px; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

  <!-- PAGE DE COUVERTURE -->
  <div class="cover">
    <div style="font-size: 32pt; font-weight: 900; color: #D32F2F; margin-bottom: 10px;">STA CHERY TUNISIE</div>
    <div class="cover-title">FICHE DE FORMATION DÉDIÉE</div>
    <div class="cover-subtitle">Guide d'Utilisation Pratique pour le Chef d'Atelier (GMAO)</div>
    
    <div class="note" style="max-width: 600px; margin: 0 auto; text-align: left;">
      <strong>📘 Guide Opérationnel Spécialisé :</strong><br>
      Ce document a été spécifiquement conçu pour accompagner le Chef d'Atelier dans ses tâches de maintenance quotidiennes. Il résume l'accès par code PIN sécurisé, le contrôle du parc d'équipements, le cycle complet d'intervention (bons de travaux) et la formulation des demandes d'achat (DA).
    </div>
    
    <div class="cover-meta">
      <strong>Auteur :</strong> M. Ahmed Amine Ben Salah (Responsable GMAO & Maintenance)<br>
      <strong>STA Tunisie :</strong> Concessionnaire Officiel Chery<br>
      <strong>Version :</strong> 1.0 • 2026
    </div>
  </div>

  <div class="page-break"></div>

  <h2>Table des Matières du Guide</h2>
  <ol style="font-size: 11pt; line-height: 1.8;">
    <li><strong>Rôle & Accès de l'Atelier (Verrouillage par PIN)</strong></li>
    <li><strong>Suivi du Parc & Guide de Création d'un Équipement Étape par Étape</strong></li>
    <li><strong>Création, Exécution & Clôture d'une Fiche d'Intervention (Bons de travaux)</strong></li>
    <li><strong>Formuler une Demande d'Achat (DA) d'Équipement ou d'Infrastructure Étape par Étape</strong></li>
  </ol>

  <div class="page-break"></div>

  <h1>1. Rôle & Accès de l'Atelier (Sécurité par Code PIN)</h1>
  <p>
    Pour refléter l'organisation opérationnelle de la <strong>STA Chery Tunisie</strong>, l'application est compartimentée en ateliers. 
    Chaque Chef d'Atelier accède à l'application avec un <strong>code PIN sécurisé (par défaut : 0000)</strong> :
  </p>
  <ul>
    <li><strong>Service Rapide :</strong> Maintenance rapide de routine (ponts ciseaux, équilibreuses).</li>
    <li><strong>Atelier Mécanique / élec :</strong> Grosses réparations (ponts 2 et 4 colonnes, démonte-pneus).</li>
    <li><strong>Atelier Diagnostic :</strong> Analyse électrique et électronique (valises de diagnostic).</li>
    <li><strong>Carrosserie :</strong> Tôlerie, redressage et peinture (cabines de peinture, marbres).</li>
    <li><strong>Lavage :</strong> Nettoyage et préparation de livraison (portiques, karchers).</li>
    <li><strong>Maintenance Bâtiment :</strong> Gros œuvre, électricité bâtiment et showroom.</li>
  </ul>
  <div class="note">
    <strong>🔒 Règle de cloisonnement :</strong> Le Chef d'Atelier ne voit et ne gère que les équipements et bons de travaux appartenant strictement à son propre atelier. L'administrateur, M. Ahmed Amine, supervise l'intégralité du parc de Tunis.
  </div>

  <div class="page-break"></div>

  <h1>2. Suivi du Parc & Création d'un Équipement</h1>
  <p>
    Le parc de chaque atelier affiche le taux de disponibilité en temps réel de ses machines.
  </p>
  <div class="alert">
    <strong>💡 Règle Métier Majeure - Équipement "Hors Service" :</strong><br>
    Lorsqu'un équipement est déclassé, vendu ou définitivement arrêté, changez son état en <strong>"Hors Service"</strong>. La GMAO l'exclura alors automatiquement de tous les calculs de taux de disponibilité globale de l'atelier de Tunis pour éviter de fausser les indicateurs de performance.
  </div>
  <h3>Tutoriel pas-à-pas de création d'équipement (Admin) :</h3>
  <ol>
    <li>Connectez-vous avec le profil <strong>Admin</strong> et allez dans <strong>"Parc Équipements"</strong>.</li>
    <li>Cliquez sur le bouton bleu <strong>"+ Ajouter un Équipement"</strong>.</li>
    <li>Saisissez le <strong>Nom</strong> (ex: "Pont Ciseaux 03"), le <strong>Code Unique</strong> (ex: "EQ-SR-03"), sélectionnez l'<strong>Atelier</strong>, et attribuez la <strong>Criticité</strong> (A, B ou C).</li>
    <li>Renseignez le coût d'acquisition, la date d'installation et l'échéance de garantie, puis enregistrez.</li>
  </ol>

  <div class="page-break"></div>

  <h1>3. Cycle Complet des Interventions (Bons de travaux)</h1>
  <p>
    Les interventions de maintenance peuvent être effectuées en interne par nos techniciens, ou confiées à un prestataire extérieur qualifié :
  </p>
  <ol>
    <li>
      <strong>Création du ticket :</strong> Cliquez sur <strong>"+ Nouvelle Intervention"</strong> dans l'onglet "Interventions". Renseignez le titre, l'équipement concerné, l'urgence (Faible, Moyenne, Haute) et le type (Préventif, Correctif, Réglementaire).
    </li>
    <li>
      <strong>Choix de l'Exécutant (Interne ou Externe) :</strong>
      <ul>
        <li><strong>Interne :</strong> Sélectionnez ou entrez le nom de notre technicien STA chargé de l'intervention.</li>
        <li><strong>Externe (Prestataire) :</strong> Cochez l'option "Externe" et sélectionnez le fournisseur ou prestataire (ex: Sotradies, Challengers, etc.).</li>
      </ul>
    </li>
    <li>
      <strong>Consommation de pièces :</strong> Ajoutez les pièces détachées utilisées à partir de la liste magasinier. Le système vérifie en temps réel le stock et calcule automatiquement le coût global des fournitures.
    </li>
    <li>
      <strong>Exécution et Clôture :</strong> Basculez le statut à <strong>"En cours"</strong> au démarrage, puis à <strong>"Terminé"</strong> à la fin. Saisissez la durée réelle et un court compte-rendu dans les notes de clôture. L'équipement repasse automatiquement en vert ("Opérationnel").
    </li>
  </ol>

  <div class="page-break"></div>

  <h1>4. Formulation d'une Demande d'Achat (DA)</h1>
  <p>
    En cas de besoin de nouvel outillage, de travaux d'aménagement de l'atelier, ou de prestations externes, le Chef d'Atelier ou le Magasinier formule une Demande d'Achat (DA) numérique.
  </p>
  <div class="note">
    <strong>💡 Nouveautés majeures :</strong>
    <ul>
      <li><strong>Choix Catégorie :</strong> Vous devez spécifier s'il s'agit d'un <strong>Équipement</strong> (machines, outils), d'une <strong>Infrastructure</strong> (réseau d'air, électricité, bâtiment) ou d'un <strong>Service</strong> (prestations, contrats d'entretien, calibrations, contrôles réglementaires).</li>
      <li><strong>Fournisseur Optionnel :</strong> Le champ "Fournisseur Suggéré" est facultatif. Vous pouvez sélectionner <strong>"Non spécifié"</strong> si vous n'avez pas de devis. L'Admin, M. Ahmed Amine, se chargera d'associer le fournisseur agréé officiel lors de la validation technique.</li>
    </ul>
  </div>
  <h3>Procédure de soumission :</h3>
  <ol>
    <li>Dans l'onglet <strong>"Achats"</strong>, cliquez sur <strong>"+ Nouvelle Demande d'Achat (DA)"</strong>.</li>
    <li>Sélectionnez la catégorie (Équipement, Infrastructure ou Service).</li>
    <li>Saisissez l'intitulé, le motif précis du besoin, la quantité demandée, le coût estimé et le niveau d'urgence.</li>
    <li>Indiquez votre nom de demandeur et cliquez sur <strong>"Soumettre la Demande d'Achat"</strong>.</li>
  </ol>

  <div style="margin-top: 50px; border-top: 2px solid #dddddd; padding-top: 20px; text-align: center;">
    <p style="font-weight: bold; color: #D32F2F;">FIN DE LA FICHE DE FORMATION CHEF D'ATELIER</p>
    <p style="font-size: 9pt; color: #777777;">Pour toute assistance technique, contactez M. Ahmed Amine Ben Salah, administrateur de la GMAO STA.</p>
  </div>

</body>
</html>
      `;
      res.setHeader("Content-Type", "application/msword");
      res.setHeader("Content-Disposition", "attachment; filename=Fiche_Formation_Chef_Atelier_GMAO_STA.doc");
      res.send(chefGuideHtml);
    } catch (err) {
      console.error("Chef guide download error:", err);
      res.status(500).send("Erreur lors de la génération de la fiche de formation.");
    }
  });


  // Serveur de fichiers de production (dist) ou fallback Vite
  const possibleDistPaths = [
    path.join(__dirname, "dist"),
    path.join(process.cwd(), "dist"),
    path.join(__dirname, "../dist")
  ];

  const distPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, "index.html"))) || path.join(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (hasDist) {
    console.log("[GMAO SERVER] Mode Production : Fichiers compiles detectes dans", distPath);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    try {
      console.log("[GMAO SERVER] Mode Developpement : Chargement de Vite...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("[GMAO SERVER] Vite indisponible. Service du dossier dist par defaut.");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        if (fs.existsSync(path.join(distPath, "index.html"))) {
          res.sendFile(path.join(distPath, "index.html"));
        } else {
          res.status(404).send("<h1>Erreur : Fichier index.html introuvable</h1><p>Veuillez exécuter <code>npm run build</code> avant de démarrer l'application.</p>");
        }
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GMAO SERVER] Serveur demarre sur http://localhost:${PORT}`);
  });
}

startServer();
