# Documentation Technique Complète — GMAO STA Chery Tunisie
*Conçue pour les ingénieurs de maintenance et les développeurs chargés de l'exploitation et de l'évolution du système.*

Ce document détaille l'architecture, les choix technologiques, le processus de développement étape par étape, et les directives de maintenance pour l'application de **Gestion de Maintenance Assistée par Ordinateur (GMAO)** de la **Société Tunisienne d'Automobiles (STA)**, concessionnaire officiel de la marque **Chery** en Tunisie.

---

## Sommaire
1. [Vision Générale de l'Application](#1-vision-générale-de-lapplication)
2. [Technologies Utilisées & Rôles](#2-technologies-utilisées--rôles)
3. [Architecture Globale & Structure du Projet](#3-architecture-globale--structure-du-projet)
4. [Développement Étape par Étape](#4-développement-étape-par-étape)
5. [Anatomie d'un Flux Utilisateur : Création d'une Intervention](#5-anatomie-dun-flux-utilisateur--création-dune-intervention)
6. [Guide de Déploiement (Intranet STA)](#6-guide-de-déploiement-intranet-sta)
7. [Guide de Maintenance & Évolutions du Code](#7-guide-de-maintenance--évolutions-du-code)
8. [Limites Actuelles (Bêta) & Perspectives Industrielles](#8-limites-actuelles-bêta--perspectives-industrielles)

---

## 1. Vision Générale de l'Application

### Objectifs Stratégiques
L'application de GMAO a été conçue sur-mesure pour répondre aux besoins opérationnels des ateliers après-vente de la STA Chery Tunisie. Ses principaux objectifs sont :
* **Transition "Zéro Papier"** : Numérisation intégrale du cycle de vie des interventions (correctives, préventives et réglementaires).
* **Maintenance Proactive** : Suivi rigoureux des équipements de pointe de la STA (ponts élévateurs, valises de diagnostic, cabines de peinture) pour planifier les inspections et maximiser leur taux de disponibilité.
* **Maîtrise Budgétaire Fine** : Suivi analytique des coûts de maintenance (pièces de rechange et main-d'œuvre) avec comparaison en temps réel par rapport aux budgets alloués par atelier.
* **Pilotage par les KPIs** : Aide à la décision pour la direction générale à l'aide d'indicateurs de performance clés standardisés (MTBF, MTTR, Disponibilité).

### Modules Clés Développés
L'application s'articule autour de 8 modules fonctionnels intégrés au sein d'une interface unique à onglets :
1. **Tableau de Bord Directeur (Dashboard)** : Vue d'ensemble sur l'activité des ateliers, graphiques financiers interactifs, et indicateurs opérationnels clés.
2. **Gestion du Parc Équipement** : Registre exhaustif des actifs techniques, leur criticité, leur localisation précise et le suivi dynamique de leur statut de garantie.
3. **Gestion des Interventions** : Historique et création des fiches d'interventions avec saisie des pièces utilisées et du temps de main-d'œuvre.
4. **Gestion des Pièces de Rechange (Magasin)** : Suivi en temps réel des stocks du magasin avec seuils d'alerte pour le réapprovisionnement et valorisation financière globale du stock.
5. **Gestion des Achats & Commandes** : Processus d'approbation des demandes d'achat de pièces de rechange et de prestations de service extérieures.
6. **Contrats & Fournisseurs** : Base de données des prestataires externes agréés et suivi de l'état des abonnements contractuels de maintenance préventive.
7. **Contrôles Réglementaires** : Suivi des visites périodiques de sécurité obligatoires menées par des organismes de contrôle agréés tunisiens (ex : Apave, Veritas).
8. **Analyse Budgétaire** : Contrôle financier des dépenses par rapport aux budgets annuels alloués à chaque atelier de la STA.

---

## 2. Technologies Utilisées & Rôles

L'application repose sur un écosystème moderne basé sur l'écosystème **TypeScript / React / Vite**. Sa particularité réside dans sa légèreté et sa capacité à s'exécuter localement sans nécessiter de base de données relationnelle lourde dans sa phase de déploiement initial.

| Technologie / Bibliothèque | Version principale | Rôle clé dans l'application |
| :--- | :--- | :--- |
| **TypeScript** | `5.8.x` | Garanti la robustesse et la qualité du code par un typage strict des structures de données (Équipements, Interventions, Contrats, etc.), minimisant les bugs en cours d'exécution. |
| **React** | `19.x` | Bibliothèque centrale d'interface utilisateur. Permet un rendu hautement réactif basé sur des composants modulaires et un état synchrone partagé. |
| **Vite** | `6.x` | Serveur de développement ultrarapide et outil de compilation optimisé pour la production. |
| **Tailwind CSS** | `v4` | Framework CSS utilitaire utilisé pour concevoir une interface moderne, épurée et réactive (responsive mobile et tablette), avec une esthétique premium de style "Slate" (ardoise). |
| **Lucide React** | `0.546.0`| Set d'icônes vectoriels modernes utilisés pour illustrer de façon intuitive les menus, actions et statuts. |
| **Motion** (Framer Motion) | `12.x` | Moteur d'animation utilisé pour les transitions fluides entre les onglets, l'affichage des fenêtres modales et les animations d'entrée des cartes. |
| **Recharts** | `3.9.x` | Composants graphiques basés sur SVG. Utilisés pour dessiner les graphiques en secteurs (ateliers), en anneaux (stocks) et en barres (budgets). |
| **XLSX** (SheetJS) | `0.18.5` | Bibliothèque de manipulation de fichiers Excel. Utilisée pour générer un classeur multi-onglets haute-fidélité contenant l'intégralité des données de la GMAO pour l'archivage ou l'export. |
| **LocalStorage** (Navigateur) | *Natif* | Système de persistance de données. Assure la sauvegarde automatique de l'ensemble des données modifiées directement sur le poste de travail de l'utilisateur, même après fermeture du navigateur ou coupure réseau. |

---

## 3. Architecture Globale & Structure du Projet

L'architecture repose sur le paradigme d'une **Single Page Application (SPA)** autonome. Toutes les données sont structurées et typées, transitant par un composant racine (`App.tsx`) qui sert de contrôleur central et distribue l'état réactif aux sous-composants dédiés.

### Organisation des Dossiers et Fichiers Clés

```text
/ (Racine du Projet)
├── index.html                    # Point d'entrée HTML de l'application
├── package.json                  # Déclaration des dépendances npm et scripts de build
├── vite.config.ts                # Configuration du bundler Vite et intégration CSS Tailwind
├── tsconfig.json                 # Paramètres de compilation TypeScript
├── demarrer.bat                  # Script de démarrage rapide sous Windows pour les ateliers STA
├── public/                       # Dossier contenant les ressources statiques
│   └── presentation_captures.zip # Kit média contenant les captures d'écran et scripts de réunion
└── src/                          # Code source de l'application
    ├── main.tsx                  # Montage de l'application React dans le DOM
    ├── index.css                 # Fichier de styles global (Import de Tailwind v4 et polices Google)
    ├── types.ts                  # Modèle de données centralisé (Toutes les interfaces TypeScript)
    ├── data.ts                   # Jeux de données d'initialisation de la STA (Mode Démo)
    ├── App.tsx                   # Contrôleur racine de l'application (Gestion des états globaux)
    ├── components/               # Composants d'interface utilisateur modulaires
    │   ├── GmaoDashboard.tsx     # Tableau de bord principal avec graphiques Recharts
    │   ├── EquipmentsManager.tsx # Registre et fiches de détails des équipements
    │   ├── InterventionsManager.tsx # Gestion de l'historique et création des bons de travaux
    │   ├── InventoryManager.tsx  # Magasin des pièces de rechange et gestion des alertes
    │   ├── PurchasesManager.tsx  # Workflow d'approbation des demandes d'achat
    │   ├── ContractsManager.tsx  # Suivi des prestataires externes et des abonnements
    │   ├── SettingsManager.tsx   # Paramètres système (Changement de mode de base, remise à zéro)
    │   ├── ExcelBlueprint.tsx    # Section d'export et d'analyse des rapports
    │   └── UserGuide.tsx         # Guide d'utilisation intégré de l'application
    └── utils/                    # Fonctions utilitaires génériques
        └── excelGenerator.ts     # Moteur d'export de données au format XLSX (Excel professionnel)
```

### Fonctionnement entre l'Interface, le Contrôleur et le Stockage
```text
┌────────────────────────────────────────────────────────┐
│               Interface Utilisateur (UI)               │
│   (GmaoDashboard, EquipmentsManager, etc.)             │
└──────────────────────────┬─────────────────────────────┘
      ▲                    │
      │ Événements         │ Soumission / Modifications
      │ de Rendu           ▼
┌────────────────────────────────────────────────────────┐
│               Contrôler Central (App.tsx)              │
│       - Maintient l'état réactif (useState)            │
│       - Distribue les fonctions de modification        │
│       - Gère les filtres globaux                       │
└──────────────────────────┬─────────────────────────────┘
      ▲                    │
      │ Chargement         │ Écritures de sauvegarde
      │ initial            ▼ (JSON stringify)
┌────────────────────────────────────────────────────────┐
│             Stockage Local (LocalStorage)              │
│       - chery_gmao_equipments                          │
│       - chery_gmao_interventions                       │
│       - chery_gmao_spare_parts                         │
└────────────────────────────────────────────────────────┘
```

---

## 4. Développement Étape par Étape

Pour construire une application stable de cette envergure, le processus de développement a suivi une progression logique rigoureuse :

### Étape 1 : Initialisation et Configuration
* **Création de la structure** : Initialisation d'un projet standard Vite équipé du template React en TypeScript.
* **Configuration CSS** : Installation de Tailwind CSS v4. Intégration de la directive d'importation `@import "tailwindcss";` dans `src/index.css`.
* **Typage strict** : Écriture du fichier `src/types.ts` définissant la structure rigoureuse de chaque objet de données. C'est l'étape la plus critique car elle définit le contrat de données pour tous les composants de l'application.

### Étape 2 : Établissement du Jeu de Données Initiales (STA)
* Pour que l'application soit immédiatement opérationnelle pour un ingénieur de la STA, nous avons modélisé dans `src/data.ts` un parc de départ ultra-réaliste :
  * Ateliers : Service Rapide, Atelier Mécanique, Atelier Diagnostic, Carrosserie, Lavage, Magasin de rechange, etc.
  * Équipements de départ (Ponts élévateurs à vis, Compresseur d'air lubrifié, Cabines de peinture, Valises de diagnostic Chery, etc.).
  * Fiches d'interventions préexistantes et stocks réels de pièces de rechange (ex: Huile hydraulique ISO 46, bougies de rechange, filtres, etc.).

### Étape 3 : Structuration de l'Interface de Navigation
* **Conception du Layout Principal (`App.tsx`)** : Création d'une mise en page de type portail professionnel. Une barre de navigation latérale (sidebar) rétractable à gauche, contenant les menus hiérarchisés avec des icônes Lucide.
* **Module de "Double Base"** : Mise en place d'une bascule de base de données :
  1. **Mode Démo** : Remplit l'application avec les données d'exemples de la STA pour tester l'application.
  2. **Mode Vierge** : Nettoie l'intégralité du stockage pour démarrer une exploitation réelle dans les ateliers.

### Étape 4 : Développement des Modules Fonctionnels Réactifs
* Chaque module a été codé comme un composant React autonome, favorisant la séparation des responsabilités.
* Le composant `App.tsx` transmet l'état actuel (ex: `equipments`) et des fonctions de mutation (ex: `setEquipments`).
* **Mise en place de la persistance** : Chaque fois qu'une variable d'état est mise à jour, un bloc de code `useEffect` l'enregistre de manière asynchrone dans le `localStorage` sous forme de chaîne JSON.

### Étape 5 : Intégration de l'Intelligence de Calcul (KPI & Budgets)
* **Indicateurs clés** : Implémentation d'algorithmes de calcul à la volée. Par exemple, la *Disponibilité Globale* est obtenue en divisant le nombre d'équipements non-en panne par le nombre total d'équipements.
* **Liaison Budgétaire automatique** : À chaque création d'intervention, le montant cumulé de main-d'œuvre et de pièces est immédiatement sommé et débité du budget de l'atelier concerné, déclenchant des avertissements de dépassement visuels si nécessaire.

### Étape 6 : Moteur de Génération de Rapports Excel
* Développement de `src/utils/excelGenerator.ts`. À l'aide de la bibliothèque SheetJS (`xlsx`), ce fichier convertit de manière rigoureuse nos tableaux réactifs en un véritable fichier de tableur professionnel multi-onglets structuré. Le script calcule automatiquement la largeur de chaque colonne pour éviter les tronquages de textes et intègre des formules de calcul Excel natives (comme des sommes cumulées).

---

## 5. Anatomie d'un Flux Utilisateur : Création d'une Intervention

Pour bien comprendre le fonctionnement de l'application, suivons pas à pas le cheminement des données lorsqu'un technicien enregistre une intervention corrective sur le système :

```text
[ Technicien dans l'Atelier ]
              │
              ▼
1. FORMULAIRE : L'utilisateur ouvre l'onglet "Interventions", clique sur "Nouvelle intervention"
   et saisit les détails (Équipement ciblé, type, pièces utilisées, coût de main-d'œuvre).
              │
              ▼
2. VALIDATION : Le composant InterventionsManager vérifie la conformité des champs (durées positives,
   sélection obligatoire de l'équipement) et appelle la fonction globale `handleAddIntervention` (App.tsx).
              │
              ▼
3. MISE À JOUR DE L'ÉTAT REACT :
   - Un nouvel identifiant unique est généré (ex: `INT-2026-009`).
   - L'état `interventions` est recalculé de manière immuable : `setInterventions([...interventions, newIntervention])`.
              │
              ▼
4. RÉPERCUSSIONS RECONSTITUÉES (Effets de bord) :
   - Le stock des pièces utilisées est décrémenté automatiquement dans l'état `spareParts`.
   - Le budget de l'atelier concerné est imputé du coût total (Pièces + Main-d'œuvre).
   - Le statut de l'équipement ciblé passe automatiquement à "En Maintenance" ou "Opérationnel" selon le choix saisi.
              │
              ▼
5. PERSISTANCE (LocalStorage) :
   - Les déclencheurs `useEffect` dans `App.tsx` détectent les modifications de `interventions`, `spareParts` et `equipments`.
   - Les nouvelles structures de données sont sérialisées et écrites instantanément dans la mémoire du navigateur.
              │
              ▼
6. ACTUALISATION VISUELLE :
   - Le moteur réactif de React met à jour le DOM.
   - Les graphiques Recharts recalculent les dépenses de l'atelier.
   - Les jauges de disponibilité globale et les indicateurs MTBF/MTTR du Dashboard se rafraîchissent instantanément.
```

---

## 6. Guide de Déploiement (Intranet STA)

Puisque l'application GMAO a été construite sous la forme d'un projet **Vite SPA hautement optimisé**, elle ne requiert aucun serveur d'application lourd (ni Java, ni IIS, ni conteneurs Docker complexes) pour s'exécuter dans un premier temps. Elle peut être déployée en local ou sur l'intranet de la STA de deux manières simples :

### Option A : Déploiement Simple par Fichiers Partagés (Intranet local)
1. **Générer le dossier de production** : Sur votre poste de développement, exécutez la commande :
   ```bash
   npm run build
   ```
2. Un dossier nommé `dist/` est alors généré à la racine. Ce dossier contient l'intégralité de l'application compilée sous forme de fichiers HTML, CSS et JavaScript statiques ultralégers.
3. **Copier sur le serveur interne** : Copiez simplement le contenu de ce dossier `dist/` dans le répertoire de votre serveur web intranet STA existant (par exemple un serveur Apache, Nginx sous Linux, ou IIS sous Windows Server).
4. L'application est alors accessible par tous les techniciens des ateliers à l'adresse réseau configurée (ex : `http://gmao.sta.chery.tn` ou `http://192.168.1.100/gmao`).

### Option B : Lancement Autonome sur un Poste Technique Windows
Si vous souhaitez faire tourner l'application sur un poste dédié de l'atelier sans serveur web existant, un script batch nommé `demarrer.bat` a été préparé à la racine :
1. Installez **Node.js** (recommandé v18 ou v20 LTS) sur le poste Windows.
2. Double-cliquez sur le fichier `demarrer.bat` présent à la racine du dossier du projet.
3. Le script va automatiquement installer les dépendances (la première fois), lancer le serveur web embarqué ultra-léger et ouvrir automatiquement votre navigateur par défaut à l'adresse : `http://localhost:3000`.

---

## 7. Guide de Maintenance & Évolutions du Code

Pour maintenir l'application et la faire évoluer, voici les instructions de développement essentielles.

### Comment modifier une structure de données existante ?
*Exemple : Vous souhaitez ajouter un nouveau champ "Numéro de Facture" sur les fiches de pièces détachées ou les interventions.*
1. **Ouvrir `src/types.ts`** : Localisez l'interface concernée (par exemple `interface Intervention`).
2. Ajoutez votre propriété en respectant les conventions TypeScript :
   ```typescript
   export interface Intervention {
     // ... champs existants
     invoiceNumber?: string; // Ajout du champ optionnel de type texte
   }
   ```
3. **Mettre à jour l'interface utilisateur** : Ouvrez le composant d'interface correspondant (ex : `src/components/InterventionsManager.tsx`). Localisez le formulaire d'ajout et ajoutez une balise d'entrée `<input>` pour saisir cette valeur. Liez-la à un nouvel état local réactif (`useState`).
4. **Mettre à jour l'export Excel** : N'oubliez pas d'ouvrir `/src/utils/excelGenerator.ts` pour ajouter une colonne correspondante afin que ce nouveau champ apparaisse dans l'export automatique des rapports d'activité.

### Procédure de Sauvegarde (Backup) de la Base de Données
Dans sa version actuelle, les données résident sur le poste de l'utilisateur. Il est donc indispensable d'assurer la sécurité des données :
1. **Sauvegarde par Export Excel (Recommandé)** : Les utilisateurs de l'atelier sont invités à exporter de manière hebdomadaire le fichier de GMAO via le bouton **"Générer Rapport Global STA"** situé sur le Tableau de bord ou dans la section *Rapports*. Ce fichier contient l'intégralité absolue des bases de données de l'application sous forme structurée et peut être archivé sur les disques durs sécurisés de la STA.
2. **Sauvegarde Manuelle du Navigateur** : Les données du `localStorage` peuvent également être extraites manuellement à des fins d'assistance technique :
   * Sur le navigateur, faites un clic droit, puis sélectionnez **Inspecter**.
   * Ouvrez l'onglet **Application** (ou *Stockage*).
   * Sous la rubrique **Local Storage**, faites un clic droit sur les clés nommées `chery_gmao_equipments`, `chery_gmao_interventions`, etc., pour exporter ou copier leurs valeurs textuelles (au format JSON).

---

## 8. Limites Actuelles (Bêta) & Perspectives Industrielles

L'application livrée est fonctionnelle, réactive et dispose d'une ergonomie très soignée qui répond parfaitement au cahier des charges d'une phase de **Bêta de pré-production**. Elle permet une évaluation concrète et robuste des bénéfices opérationnels d'un outil GMAO au sein de la STA Chery.

Cependant, avant un déploiement industriel à grande échelle auprès d'une multitude d'utilisateurs simultanés, certaines évolutions techniques sont indispensables :

| Caractéristique | Statut Actuel (Bêta) | Exigence pour Production Industrielle |
| :--- | :--- | :--- |
| **Persistance des données** | Stockage local au niveau du navigateur (`localStorage`) sur un poste de travail unique. | **Migration vers une base de données relationnelle centralisée** (de type **PostgreSQL** ou **Firebase Firestore**). Cela permettra de partager et d'écrire des données en temps réel depuis plusieurs postes (ateliers mécaniques, comptabilité, bureau d'études) de manière centralisée. |
| **Gestion des Utilisateurs** | Un profil de connexion simulé de manière simple dans l'application. | **Mise en place d'un système d'authentification sécurisé** (de type OAuth 2.0, Active Directory de la STA, ou Firebase Authentication) avec gestion fine des rôles (Lecture seule, Technicien de maintenance, Magasinier de rechange, Directeur financier, Administrateur système). |
| **Sécurité des Données** | Les données résident côté client sans cryptage lourd. | **Stockage serveur sécurisé** avec protocoles HTTPS obligatoires, sauvegardes incrémentielles automatiques sur le Cloud ou sur des serveurs sécurisés locaux STA à intervalles réguliers. |
| **Automatisation du Réapprovisionnement**| Les alertes de stock sont calculées visuellement dans l'application. | **Connexion par API avec l'ERP de la STA Chery** (par exemple SAP, Sage ou un ERP interne) pour déclencher automatiquement des commandes de réapprovisionnement auprès de la centrale d'achats ou du constructeur Chery dès le franchissement d'un seuil critique. |

### Conclusion
La présente GMAO STA Chery Tunisie constitue un socle solide, léger et extrêmement complet. Elle a été construite pour être immédiatement prise en main par les ingénieurs grâce à son ergonomie moderne, sa rigueur de typage TypeScript et sa flexibilité technique. Elle servira de base de formation idéale pour initier les équipes de maintenance aux méthodologies numériques de l'industrie moderne.
