const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 1. Installation automatique des dépendances si absentes
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log("======================================================================");
  console.log("[INFO] Premier lancement detecte ! Installation des composants...");
  console.log("======================================================================");
  console.log("Cette etape ne se produit qu'une seule fois. Veuillez patienter...\n");
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log("\n[SUCCES] Installation terminee !\n");
  } catch (err) {
    console.error("\n[ERREUR] L'installation des composants a echoue.");
    console.error("Vérifiez votre connexion Internet et reessayez.\n");
    process.exit(1);
  }
}

// 2. Libération du port 3000 s'il est déjà occupé (Windows)
if (process.platform === 'win32') {
  try {
    const netstatOutput = execSync('netstat -ano', { encoding: 'utf8' });
    const lines = netstatOutput.split('\n');
    const pidsToKill = new Set();
    
    for (const line of lines) {
      if (line.includes(':3000') && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && pid !== '0') {
          pidsToKill.add(pid);
        }
      }
    }
    
    for (const pid of pidsToKill) {
      console.log(`[INFO] Liberation du port 3000 occupe par un ancien processus (PID: ${pid})...`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      } catch (e) {
        // Ignorer si déjà arrêté
      }
    }
  } catch (err) {
    // Échec silencieux si netstat n'est pas dispo
  }
}

// 3. Détermination de l'IP locale pour le partage réseau
let localIp = 'localhost';
try {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    for (const net of interfaces[interfaceName]) {
      // Ignorer les adresses de bouclage et non-IPv4
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
    if (localIp !== 'localhost') break;
  }
} catch (err) {
  // Ignorer en cas d'erreur réseau
}

// 4. Affichage de l'interface d'accueil chaleureuse
console.clear();
console.log("======================================================================");
console.log("🚀 DEMARRAGE DE LA GMAO STA CHERY TUNISIE");
console.log("======================================================================");
console.log("");
console.log("L'application démarre...");
console.log("");
console.log("----------------------------------------------------------------------");
console.log("💻 SUR VOTRE ORDINATEUR (Local) :");
console.log("   Ouvrez ce lien : http://localhost:3000");
console.log("");
console.log("🔌 PARTAGE SUR VOTRE RESEAU LOCAL (LAN) :");
console.log("   Vos collegues peuvent s'y connecter DIRECTEMENT depuis leurs PC,");
console.log("   tablettes ou smartphones connectes au meme reseau Wi-Fi / Ethernet :");
console.log(`   --> http://${localIp}:3000`);
console.log("----------------------------------------------------------------------");
console.log("");
console.log("Pour arreter le serveur, fermez simplement cette fenetre noire.");
console.log("======================================================================");
console.log("");

// 5. Ouverture automatique du navigateur
setTimeout(() => {
  try {
    if (process.platform === 'win32') {
      execSync('start "" "http://localhost:3000"');
    } else if (process.platform === 'darwin') {
      execSync('open http://localhost:3000');
    } else {
      execSync('xdg-open http://localhost:3000');
    }
  } catch (e) {
    // Ignorer si l'ouverture échoue
  }
}, 1500);

// 6. Lancement du serveur Vite de développement
const devServer = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });

devServer.on('exit', (code) => {
  process.exit(code || 0);
});
