# 🖥️ Guide de Génération du Fichier d'Installation .EXE (Windows)

Ce guide vous explique comment transformer l'application **GMAO STA Chery Tunisie** en un fichier d'installation Windows complet (`.exe`) exécutable sur n'importe quel ordinateur sans connexion internet obligatoire.

---

## 🚀 Option 1 : Génération Automatique de l'Installeur .EXE (Recommandé)

Un script automatique `CREER_APPLICATION_EXE.bat` a été préparé à la racine du projet.

### Étapes à suivre sur votre PC Windows :
1. **Téléchargez ou gérez le dossier du projet** sur votre ordinateur.
2. Assurez-vous d'avoir **Node.js** installé sur votre PC ([Télécharger Node.js gratuit](https://nodejs.org/)).
3. Double-cliquez sur le fichier :
   ```text
   CREER_APPLICATION_EXE.bat
   ```
4. Le script va automatiquement :
   - Installer les dépendances (`npm install`).
   - Compiler l'interface web (`npm run build`).
   - Générer le fichier d'installation Windows `.exe` dans le dossier **`dist-exe/`**.

5. **Résultat :** Dans le dossier `dist-exe/`, vous obtiendrez :
   - `GMAO STA Chery Tunisie Setup 1.0.0.exe` (Programme d'installation automatique avec raccourci sur le Bureau).
   - `GMAO STA Chery Tunisie 1.0.0.exe` (Version portable utilisable sur clé USB sans installation).

---

## ⚡ Option 2 : Exécution Directe Sans Compilation (Lancement Immédiat)

Si vous souhaitez exécuter l'application sur Windows rapidement sans générer de fichier `.exe` d'installation :

1. Double-cliquez sur le fichier :
   ```text
   DEMARRER_GMAO_PORTABLE.bat
   ```
2. Le serveur local va démarrer en arrière-plan et ouvrir automatiquement l'application dans votre navigateur à l'adresse `http://localhost:3000`.

---

## 🛠️ Commandes Manuelles pour Développeur

Si vous préférez exécuter les commandes à la main dans votre terminal :

```bash
# 1. Installer les dépendances
npm install

# 2. Installer Electron & Electron Builder
npm install --save-dev electron electron-builder

# 3. Générer l'installeur .exe Windows
npm run build:exe
```

---

### 📌 Fonctionnalités conservées dans la version .EXE :
- **Sauvegardes automatiques sur le disque dur local** (`sauvegardes/gmao_backup_auto.json`).
- **Mode 100% hors-ligne (Offline)**.
- **Alertes e-mail réelles via SMTP** configurables dans *Paramètres > Notifications*.
- **Impression des fiches de travaux et téléchargement du guide Word (.doc)*.
