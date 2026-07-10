import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large backup payloads
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
    } catch (error) {
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
    } catch (error) {
      console.error("Backup read error:", error);
      res.status(500).json({ success: false, error: error?.message || "Erreur lecture disque" });
    }
  });

  // 3. Endpoint pour telecharger le manuel de formation au format MS Word (.doc)
  app.get("/api/download-guide", (req, res) => {
    try {
      const guideHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Manuel de Formation GMAO - STA Chery Tunisie</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #222222; margin: 40px; }
  h1 { font-family: 'Segoe UI', Arial, sans-serif; color: #D32F2F; border-bottom: 3px solid #D32F2F; padding-bottom: 8px; margin-top: 40px; margin-bottom: 15px; }
  h2 { font-family: 'Segoe UI', Arial, sans-serif; color: #1976D2; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; }
  h3 { font-family: 'Segoe UI', Arial, sans-serif; color: #388E3C; margin-top: 25px; margin-bottom: 10px; }
  p, li { font-size: 11pt; text-align: justify; }
  ul, ol { margin-top: 5px; margin-bottom: 15px; }
  li { margin-bottom: 6px; }
  .cover { text-align: center; margin-top: 100px; margin-bottom: 150px; page-break-after: always; }
  .cover-title { font-size: 26pt; font-weight: bold; color: #D32F2F; margin-top: 20px; margin-bottom: 10px; }
  .cover-subtitle { font-size: 16pt; color: #555555; margin-bottom: 80px; }
  .cover-meta { font-size: 11pt; color: #666666; margin-top: 150px; line-height: 1.8; }
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
    <div style="font-size: 36pt; font-weight: 900; color: #D32F2F; margin-bottom: 10px;">STA</div>
    <div style="font-size: 24pt; font-weight: bold; tracking-wide: 3px; color: #333333; margin-bottom: 50px;">CHERY TUNISIE</div>
    
    <div class="cover-title">MANUEL DE FORMATION GMAO</div>
    <div class="cover-subtitle">Guide d'Utilisation Pratique pour les Chefs d'Atelier</div>
    
    <div class="note" style="max-width: 500px; margin: 0 auto; text-align: left;">
      <strong>🔑 Nouveauté Majeure :</strong> Chaque Chef d'Atelier dispose désormais de son propre profil sécurisé avec un code d'accès PIN unique, configurable par l'Administrateur dans les Paramètres.
    </div>

    <div class="cover-meta">
      <strong>Auteur :</strong> Ahmed Amine Ben Salah • Responsable Maintenance & Parc<br>
      <strong>Application :</strong> Gestion de Maintenance Assistée par Ordinateur (GMAO STA)<br>
      <strong>Date de publication :</strong> Juillet 2026 • Version 1.1<br>
      <strong>Statut :</strong> Approuvé pour diffusion interne
    </div>
  </div>

  <!-- TABLE DES MATIERES / SOMMAIRE -->
  <h2>Sommaire de la Formation</h2>
  <ol>
    <li><strong>Introduction & Objectifs Stratégiques</strong> (Pourquoi cette GMAO ?)</li>
    <li><strong>Comment accéder à l'application ?</strong> (Réseau Local et Partage)</li>
    <li><strong>Sécurité & Connexion par Code PIN Personnel</strong> (Votre Profil Sécurisé)</li>
    <li><strong>Le Tableau de Bord et la règle de "Disponibilité"</strong> (Indicateurs clés)</li>
    <li><strong>La Gestion du Parc d'Équipements</strong> (Suivi des machines actives)</li>
    <li><strong>La Fiche d'Intervention de A à Z</strong> (Déclarer, traiter et clôturer une panne)</li>
    <li><strong>Créer un Nouvel Équipement Étape par Étape</strong> (Tutoriel Pratique)</li>
    <li><strong>Formuler une Demande d'Achat (DA) Étape par Étape</strong> (Tutoriel Pratique)</li>
    <li><strong>Le Stock Magasin et l'Impact Budgétaire de l'Atelier</strong> (Sortie automatique des pièces)</li>
    <li><strong>Rapports & Exports d'Ingénierie de Maintenance</strong> (Le lien avec l'équipe Direction)</li>
    <li><strong>Fiches Pratiques d'Entraînement</strong> (Exercices types pour les chefs d'atelier)</li>
  </ol>
  
  <div class="page-break"></div>

  <!-- CHAPITRE 1 -->
  <h1>1. Introduction & Objectifs Stratégiques</h1>
  <p>
    La <strong>Société Tunisienne d'Automobiles (STA)</strong>, concessionnaire officiel de la marque <strong>Chery en Tunisie</strong>, s'engage dans la modernisation de ses processus après-vente et maintenance technique. Ce portail de <strong>GMAO (Gestion de Maintenance Assistée par Ordinateur)</strong> a été spécialement conçu pour répondre aux exigences réelles de nos ateliers de Tunis.
  </p>
  <h3>Pourquoi numériser la maintenance ?</h3>
  <ul>
    <li><strong>Éradiquer le papier :</strong> Fini les fiches de travaux perdues, illisibles ou griffonnées à la hâte. Chaque intervention is documentée de façon numérique, traçable et pérenne.</li>
    <li><strong>Maximiser le taux de marche (Disponibilité) :</strong> Permettre de savoir instantanément quels équipements (ponts élévateurs, cabine de peinture, compresseurs) sont fonctionnels, dégradés ou en panne totale.</li>
    <li><strong>Suivi analytique des coûts :</strong> Relier chaque intervention de maintenance à sa consommation de pièces de rechange réelles et au temps de main d'œuvre pour obtenir le coût de revient exact d'une machine.</li>
  </ul>
  <div class="note">
    <strong>💡 Note d'Ahmed Amine :</strong> Cet outil n'est pas une contrainte administrative, mais un facilitateur de travail au quotidien. Il vous permet de justifier auprès de la direction le besoin de renouvellement de vos équipements ou d'achat de pièces de rechange sur la base de données réelles et quantifiables.
  </div>

  <!-- CHAPITRE 2 -->
  <h1>2. Accès à l'Application sur le Réseau</h1>
  <p>
    L'application s'exécute de manière ultra-rapide et est hébergée directement sur le PC central de l'atelier ou sur un serveur local. Elle ne nécessite pas d'accès Internet externe pour fonctionner.
  </p>
  <h3>Deux façons d'accéder à la GMAO :</h3>
  <table style="width: 100%;">
    <tr>
      <th>Sur l'ordinateur serveur (PC de lancement)</th>
      <th>Depuis les autres PC ou Tablettes du réseau STA</th>
    </tr>
    <tr>
      <td>
        Ouvrez simplement votre navigateur Internet habituel et saisissez le lien suivant :<br>
        <span class="badge badge-blue">http://localhost:3000</span>
      </td>
      <td>
        Vos collègues et chefs d'atelier peuvent s'y connecter directement depuis leurs terminaux connectés au réseau Wi-Fi ou Ethernet Chery en utilisant l'adresse IP locale du serveur. Par exemple :<br>
        <span class="badge badge-green">http://192.168.1.50:3000</span>
      </td>
    </tr>
  </table>
  <p>
    <em>Astuce de déploiement :</em> Vous pouvez créer un raccourci sur le bureau des chefs d'atelier pour ouvrir directement l'adresse correspondante en un double-clic.
  </p>

  <div class="page-break"></div>

  <!-- CHAPITRE 3 -->
  <h1>3. Profils d'Accès & Sécurité par Code PIN</h1>
  <p>
    Pour simuler fidèlement le flux opérationnel et garantir la sécurité des données, l'application est compartimentée en profils professionnels. <strong>Chaque collaborateur dispose d'un rôle adapté à son périmètre d'action.</strong>
  </p>
  
  <h3>Les Profils disponibles et leurs privilèges :</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Profil</th>
        <th style="width: 20%;">Accès Recommandé</th>
        <th>Description des Droits Opérationnels</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>🔑 M. Ahmed Amine (Admin)</strong></td>
        <td><span class="badge badge-red">Admin</span></td>
        <td>Contrôle absolu : configuration globale, modification du budget annuel de tous les ateliers, ajout/suppression d'équipements, mise à jour des codes d'accès PIN, et réinitialisation de la base.</td>
      </tr>
      <tr>
        <td><strong>👁️ Superviseur (Direction)</strong></td>
        <td><span class="badge">Lecture seule</span></td>
        <td>Idéal pour la direction générale ou les réunions après-vente : consultation complète des tableaux de bord, rapports, KPIs et graphiques, sans possibilité d'altérer ou de supprimer les données.</td>
      </tr>
      <tr>
        <td><strong>📦 Magasinier (Pièces)</strong></td>
        <td><span class="badge badge-blue">Magasin</span></td>
        <td>Saisie des pièces de rechange, gestion des réapprovisionnements (DAs), suivi des seuils d'alerte de stock minimum et réception des livraisons fournisseurs.</td>
      </tr>
      <tr>
        <td><strong>⚙️ Chefs d'Atelier (6 ateliers)</strong></td>
        <td><span class="badge badge-purple">Atelier Restreint</span></td>
        <td>Service Rapide, Mécanique, Diagnostic, Carrosserie, Lavage, Bâtiment. <strong>Saisie directe des pannes et interventions.</strong> Ils ne peuvent modifier que les équipements et interventions affectés à leur propre atelier.</td>
      </tr>
    </tbody>
  </table>

  <div class="alert">
    <strong>🛑 Sécurité Renforcée - Nouveauté :</strong> Pour éviter qu'un chef d'atelier ne modifie ou ne valide des interventions d'un autre atelier, chaque chef possède désormais un mot de passe (PIN) qui lui est propre. Les mots de passe par défaut sont configurés à <span class="badge">0000</span> ou personnalisés par l'Admin dans l'onglet "Paramètres".
  </div>

  <!-- CHAPITRE 4 -->
  <h1>4. Indicateurs Clés & Règle de Disponibilité</h1>
  <p>
    Le Tableau de Bord principal synthétise la santé technique globale de la STA Chery Tunisie. En tant que Chef d'Atelier, vous devez surveiller quotidiennement ces trois indicateurs fondamentaux :
  </p>
  <ol>
    <li><strong>Le Taux de Disponibilité globale :</strong> Exprimé en %, il indique la proportion d'équipements pleinement opérationnels par rapport au parc total actif. Une machine opérationnelle vaut 100%, une machine en mode "dégradé" vaut 90%, une machine en cours de maintenance préventive vaut 30%, et une machine en panne totale vaut 0%.</li>
    <li><strong>Le MTTR (Mean Time To Repair) :</strong> Le temps moyen de réparation. Plus ce chiffre est bas, plus vos techniciens sont réactifs et efficaces pour remettre en marche les équipements en panne.</li>
    <li><strong>Le MTBF (Mean Time Between Failures) :</strong> Le temps moyen entre deux pannes. Plus ce chiffre est élevé, plus vos équipements sont fiables, indiquant une bonne exécution de vos maintenances préventives.</li>
  </ol>

  <div class="note">
    <strong>⚠️ Règle Métier Incontournable (Équipements Obsolètes) :</strong><br>
    Si un équipement est définitivement arrêté, démonté ou déclaré obsolète, ne le laissez pas à l'état "En Panne", car cela va fausser dramatiquement le taux de disponibilité globale de votre atelier. Remplacez son état par <strong>"Hors Service"</strong>. La GMAO l'exclura alors automatiquement de tous les calculs statistiques et d'ingénierie de maintenance !
  </div>

  <div class="page-break"></div>

  <!-- CHAPITRE 5 -->
  <h1>5. Gestion du Parc d'Équipements</h1>
  <p>
    Chaque machine critique de la STA Chery Tunisie possède une carte d'identité numérique unique dans la GMAO.
  </p>
  <h3>Comment consulter et mettre à jour vos machines :</h3>
  <ul>
    <li>Allez dans l'onglet <strong>"Parc Équipements"</strong>.</li>
    <li>Filtrez par votre atelier pour afficher uniquement vos équipements.</li>
    <li>Pour chaque équipement, vous visualisez sa fiche complète : Code unique (ex: <span class="badge">EQ-SR-01</span> pour le Pont Ciseaux 01), date d'achat, fin de garantie, et criticité.</li>
    <li><strong>En cas de dysfonctionnement :</strong> Cliquez sur le bouton "Mettre à jour l'état" pour basculer rapidement la machine de "Opérationnel" à "Dégradé" ou "En Panne". Ce changement mettra à jour en temps réel les voyants de couleur du tableau de bord d'Ahmed Amine.</li>
  </ul>

  <!-- CHAPITRE 6 -->
  <h1>6. Déclaration et Clôture d'une Intervention</h1>
  <p>
    C'est le cœur opérationnel des Chefs d'Atelier. Lorsqu'un problème survient ou qu'une opération de maintenance préventive planifiée arrive à échéance, vous devez documenter l'opération.
  </p>
  
  <h3>Le Cycle Opérationnel en 5 étapes simples :</h3>
  <ol>
    <li>
      <span class="step-title">Déclarer la panne :</span><br>
      Cliquez sur <strong>"+ Nouvelle Intervention"</strong>. Donnez un titre explicite (ex : <em>"Remplacement flexibles hydrauliques"</em>), sélectionnez l'équipement en panne, déterminez le niveau de priorité (Basse, Moyenne, Haute, Critique) et indiquez s'il s'agit d'un correctif ou d'un préventif.
    </li>
    <li>
      <span class="step-title">Affecter les techniciens :</span><br>
      Sélectionnez les techniciens de maintenance désignés pour l'intervention.
    </li>
    <li>
      <span class="step-title">Ajouter les pièces de rechange (Liaison Magasin) :</span><br>
      Si l'opération nécessite le changement d'une pièce en stock (ex : filtre, huile, joint, carte électronique), ajoutez-la à la fiche de travaux en indiquant la quantité requise. Le système vous alerte si le stock magasinier est insuffisant.
    </li>
    <li>
      <span class="step-title">Exécuter les travaux :</span><br>
      Mettez l'état de l'intervention à <strong>"En cours"</strong>. L'équipement passe automatiquement en mode "En Maintenance" pour informer l'équipe d'Ahmed Amine que les techniciens travaillent dessus.
    </li>
    <li>
      <span class="step-title">Clôturer et valoriser :</span><br>
      Une fois la réparation terminée, passez le statut à <strong>"Terminé"</strong>. Renseignez la durée réelle des travaux et rédigez un résumé succinct dans la zone "Notes de clôture".
    </li>
  </ol>

  <div class="page-break"></div>

  <!-- NEW CHAPITRE 7 -->
  <h1>7. Tutoriel : Créer un Nouvel Équipement (Étape par Étape)</h1>
  <p>
    L'enregistrement d'une nouvelle machine (par exemple, un nouveau pont élévateur ou un outil de diagnostic de haute technologie) s'effectue facilement. Suivez scrupuleusement ces étapes :
  </p>
  <div class="exercise" style="background-color: #E3F2FD; border-left: 5px solid #1976D2;">
    <strong>📝 Guide pas-à-pas de Création d'Équipement :</strong>
    <ol>
      <li><strong>Sélectionnez le Rôle Admin :</strong> Seul le profil de M. Ahmed Amine (Admin) ou un utilisateur avec droits d'écriture complets peut ajouter un équipement. Assurez-vous d'avoir saisi votre PIN administrateur.</li>
      <li><strong>Allez dans l'onglet "Parc Équipements" :</strong> Cliquez sur l'onglet correspondant dans le menu de gauche.</li>
      <li><strong>Cliquez sur le bouton bleu "+ Ajouter un Équipement" :</strong> Ce bouton est situé en haut à droite de l'écran. Un formulaire s'ouvre à l'écran.</li>
      <li><strong>Remplissez les informations obligatoires :</strong>
        <ul>
          <li><strong>Nom de l'équipement :</strong> Donnez un nom clair (ex : <em>"Équilibreuse de roues numérique N°3"</em>).</li>
          <li><strong>Code unique (ID) :</strong> Saisissez un identifiant court et standardisé (ex : <span class="badge font-mono">EQ-SR-03</span>).</li>
          <li><strong>Atelier d'affectation :</strong> Choisissez l'atelier de destination (ex : <em>"Service Rapide"</em>) dans le menu déroulant.</li>
          <li><strong>Catégorie :</strong> Sélectionnez la nature de l'appareil (ex : <em>"Levage"</em>, <em>"Outillage"</em>, <em>"Électrique"</em>).</li>
          <li><strong>Criticité :</strong> Définissez l'importance stratégique (ex : <em>"Haute"</em> si l'arrêt bloque tout l'atelier).</li>
        </ul>
      </li>
      <li><strong>Renseignez les données d'achat et de garantie :</strong> Indiquez la date de mise en service et la date d'expiration de la garantie constructeur pour être alerté en cas de panne sous couverture.</li>
      <li><strong>Enregistrez l'équipement :</strong> Cliquez sur <strong>"Créer l'équipement"</strong>. L'équipement est instantanément ajouté à la base de données de la STA et synchronisé de manière sécurisée sur votre disque dur.</li>
    </ol>
  </div>

  <div class="page-break"></div>

  <!-- NEW CHAPITRE 8 -->
  <h1>8. Tutoriel : Formuler une Demande d'Achat (DA) (Étape par Étape)</h1>
  <p>
    Lorsqu'une pièce de rechange critique est en rupture ou qu'un équipement nécessite des pièces non disponibles en magasin, le chef d'atelier ou le magasinier doit lancer une Demande d'Achat (DA).
  </p>
  <div class="exercise" style="background-color: #F3E5F5; border-left: 5px solid #8E24AA;">
    <strong>🛒 Guide pas-à-pas pour une Demande d'Achat (DA) :</strong>
    <ol>
      <li><strong>Ouvrez l'onglet "Achats & DAs" :</strong> Cet onglet centralise toutes les commandes en cours de traitement de la STA Chery.</li>
      <li><strong>Cliquez sur "+ Nouvelle Demande d'Achat (DA)" :</strong> Un volet d'édition complet apparaît.</li>
      <li><strong>Sélectionnez la pièce de rechange concernée :</strong> Choisissez dans l'inventaire la pièce nécessaire (ex : <em>"Flexible hydraulique"</em>). Si elle n'existe pas encore, vous pouvez d'abord la créer dans l'onglet "Inventaire".</li>
      <li><strong>Définissez les détails de la commande :</strong>
        <ul>
          <li><strong>Quantité requise :</strong> Saisissez le nombre exact d'unités à commander.</li>
          <li><strong>Fournisseur :</strong> Sélectionnez le partenaire agréé par la STA dans la liste déroulante (ex : <em>"Hydrautech Tunisie"</em>).</li>
          <li><strong>Atelier émetteur :</strong> Spécifiez quel atelier bénéficiera de cette pièce pour l'imputation budgétaire.</li>
          <li><strong>Urgence :</strong> Définissez la priorité (ex : <em>"Urgent - Machine en panne"</em>).</li>
        </ul>
      </li>
      <li><strong>Validez la création de la DA :</strong> Elle passe automatiquement au statut <span class="badge badge-purple">Brouillon</span> ou <span class="badge">En Attente de Validation</span>.</li>
      <li><strong>Étape de Validation (Admin) :</strong> M. Ahmed Amine (Admin) reçoit une notification visuelle. Il lui suffit de cliquer sur le bouton <strong>"Valider"</strong>. La DA passe au statut <span class="badge badge-blue">Commandé</span>.</li>
      <li><strong>Étape de Réception (Magasinier) :</strong> Une fois le colis physiquement réceptionné dans les ateliers de Tunis, le magasinier ouvre la DA correspondante et clique sur <strong>"Réceptionner les Pièces"</strong>. Le stock informatique de la pièce augmente automatiquement de la quantité commandée, et la DA est marquée comme <span class="badge badge-green">Livré & Clôturé</span> !</li>
    </ol>
  </div>

  <div class="page-break"></div>

  <!-- CHAPITRE 9 -->
  <h1>9. Magasin & Suivi Budgétaire des Ateliers</h1>
  <p>
    Le Magasinier utilise l'onglet <strong>"Inventaire Magasin"</strong> pour s'assurer que les pièces critiques pour vos machines ne tombent jamais en rupture.
  </p>
  <h3>Le cycle de réapprovisionnement automatique :</h3>
  <ul>
    <li>Chaque article dispose d'un <strong>Seuil de réapprovisionnement (Seuil d'alerte)</strong>.</li>
    <li>Si le stock physique d'une pièce (ex : Flexible hydraulique) descend sous ce seuil, la GMAO l'affiche immédiatement en surbrillance rouge pour alerter l'équipe.</li>
    <li>Le magasinier ou le chef d'atelier formule une <strong>Demande d'Achat (DA)</strong> dans l'onglet "Achats" auprès d'un fournisseur agréé de la STA.</li>
    <li>M. Ahmed Amine (Admin) examine et approuve la DA d'un clic.</li>
    <li>Une fois les pièces livrées physiquement à la STA Chery par le fournisseur, le magasinier clique sur <strong>"Réceptionner"</strong> dans l'application. Le stock physique est instantanément crédité et remis à niveau.</li>
  </ul>

  <!-- CHAPITRE 10 -->
  <h1>10. Rapports & Liaisons Excel de la Direction</h1>
  <p>
    Cette application GMAO n'est pas fermée. Elle communique de façon transparente avec les outils bureautiques traditionnels de la direction (Microsoft Excel).
  </p>
  <h3>Comment générer vos rapports mensuels :</h3>
  <ul>
    <li>Rendez-vous dans l'onglet <strong>"Rapports & Export"</strong> (ou "Excel").</li>
    <li>Cliquez sur <strong>"Exporter les Données (.xlsx)"</strong>. Un fichier Excel complet s'enregistre sur votre PC.</li>
    <li>Ce fichier Excel contient toutes vos fiches techniques d'équipements à jour, l'historique complet de vos bons de travaux terminés et les coûts financiers associés par atelier.</li>
    <li>Utilisez ce fichier pour l'envoyer par e-mail à votre direction lors de vos rapports d'activité mensuels ou trimestriels.</li>
  </ul>

  <div class="page-break"></div>

  <!-- EXERCICES DE TRAVAUX PRATIQUES -->
  <h1>11. Travaux Pratiques d'Entraînement</h1>
  <p>
    Pour vous familiariser avec l'outil GMAO de la STA Chery, voici trois exercices pratiques que vous pouvez réaliser de manière fictive pour maîtriser l'outil :
  </p>

  <div class="exercise">
    <strong>🏋️ EXERCICE 1 : Déclarer un Pont en Panne (Correctif)</strong><br>
    <em>Scénario : Le Pont Ciseaux N°1 du Service Rapide présente une fuite hydraulique majeure et ne monte plus.</em><br><br>
    <strong>Étapes à suivre :</strong>
    <ol>
      <li>Connectez-vous avec votre profil Chef d'Atelier (ex: Service Rapide, PIN par défaut <span class="badge">0000</span>).</li>
      <li>Allez dans l'onglet <strong>"Parc Équipements"</strong>, trouvez le Pont Ciseaux 01 (EQ-SR-01) et modifiez son état en <strong>"En Panne"</strong>.</li>
      <li>Allez dans l'onglet <strong>"Interventions"</strong> et cliquez sur <strong>"+ Nouvelle Intervention"</strong>.</li>
      <li>Nommez-la : <em>"Fuite raccord hydraulique vérin gauche - Pont Ciseaux N°1"</em>.</li>
      <li>Sélectionnez l'équipement <span class="badge font-mono">EQ-SR-01</span>, mettez le type sur <strong>"Correctif"</strong>, Urgence <strong>"Haute"</strong> et affectez un technicien. Rédigez une brève description du problème.</li>
      <li>Enregistrez la fiche. Un nouveau bon de travail de couleur rouge s'ajoute à votre liste.</li>
    </ol>
  </div>

  <div class="exercise">
    <strong>🏋️ EXERCICE 2 : Planifier une Maintenance Préventive Mensuelle</strong><br>
    <em>Scénario : C'est le début du mois, vous devez planifier le contrôle réglementaire trimestriel de la Cabine de Peinture.</em><br><br>
    <strong>Étapes à suivre :</strong>
    <ol>
      <li>Allez dans l'onglet <strong>"Interventions"</strong> et cliquez sur <strong>"+ Nouvelle Intervention"</strong>.</li>
      <li>Nommez-la : <em>"Contrôle trimestriel filtres d'extraction & étanchéité joints - Cabine Peinture"</em>.</li>
      <li>Sélectionnez l'équipement de Carrosserie correspondant.</li>
      <li>Mettez le type sur <strong>"Préventif"</strong> et l'état sur <strong>"Planifié"</strong> (couleur bleue).</li>
      <li>Précisez la date prévue de réalisation. Enregistrez la fiche de travaux pour que l'équipe sache que cette tâche est à effectuer ce mois-ci.</li>
    </ol>
  </div>

  <div class="exercise">
    <strong>🏋️ EXERCICE 3 : Clôturer une Panne avec Utilisation de Pièces de Rechange</strong><br>
    <em>Scénario : Vous venez de réparer la fuite du Pont Ciseaux 01. Vous avez utilisé 2 litres d'Huile Hydraulique ISO 46 provenant du magasin.</em><br><br>
    <strong>Étapes à suivre :</strong>
    <ol>
      <li>Ouvrez la fiche d'intervention créée lors de l'Exercice 1.</li>
      <li>Passez l'état de l'intervention de "Planifié" à <strong>"En cours"</strong> (travail en cours), puis cliquez sur modifier.</li>
      <li>Dans la section des pièces utilisées, sélectionnez <strong>"Huile Hydraulique ISO 46"</strong> dans le menu déroulant et indiquez une quantité de <span class="badge">2</span>.</li>
      <li>Passez enfin l'état à <strong>"Terminé"</strong>.</li>
      <li>Saisissez la durée réelle des travaux (ex : 1.5 heures), indiquez dans le champ "Notes de clôture" : <em>"Remplacement du joint défectueux du raccord de vérin gauche + appoint d'huile hydraulique effectué. Test de levée sous charge OK."</em></li>
      <li>Cliquez sur <strong>"Enregistrer"</strong>.</li>
      <li><strong>Vérification :</strong> Allez dans l'onglet "Inventaire Magasin" et constatez que le stock d'huile a bien diminué de 2 litres. Allez dans "Tableau de bord" et constatez que le budget de votre atelier s'est ajusté avec le coût des travaux et que l'équipement est repassé au vert "Opérationnel".</li>
    </ol>
  </div>

  <!-- CONCLUSION -->
  <div style="margin-top: 50px; border-top: 2px solid #dddddd; padding-top: 20px; text-align: center;">
    <p style="font-weight: bold; color: #D32F2F;">FIN DU MANUEL DE FORMATION</p>
    <p style="font-size: 9pt; color: #777777;">Pour toute question, demande d'amélioration de la plateforme ou besoin de réinitialisation de code d'accès PIN, veuillez contacter M. Ahmed Amine Ben Salah, administrateur de la GMAO STA.</p>
  </div>

</body>
</html>
      `;

      res.setHeader("Content-Type", "application/msword");
      res.setHeader("Content-Disposition", "attachment; filename=Manuel_Formation_GMAO_STA_Chery.doc");
      res.send(guideHtml);
    } catch (err) {
      console.error("Guide download error:", err);
      res.status(500).send("Erreur lors de la génération du manuel.");
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
