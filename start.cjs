const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');

// Fonction utilitaire pour vérifier si un port est libre
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

// Fonction utilitaire pour trouver un port libre à partir de 3000
async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port < startPort + 50; port++) {
    const available = await checkPortAvailable(port);
    if (available) return port;
  }
  return startPort;
}

async function main() {
  // 1. Installation et vérification automatique des dépendances
  const requiredPackages = ['jspdf', 'lucide-react', 'vite', 'react', 'recharts'];
  const missingPackages = requiredPackages.filter(
    pkg => !fs.existsSync(path.join(__dirname, 'node_modules', pkg))
  );

  if (!fs.existsSync(path.join(__dirname, 'node_modules')) || missingPackages.length > 0) {
    console.log("======================================================================");
    console.log("[INFO] Verification et installation des composants necessaires...");
    console.log("======================================================================");
    if (missingPackages.length > 0 && fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log(`[INFO] Module(s) manquant(s) detecte(s) (${missingPackages.join(', ')}). Mise a jour des composants...\n`);
    } else {
      console.log("Premier lancement detecte ! Cette etape ne se produit qu'une seule fois. Veuillez patienter...\n");
    }
    try {
      let npmCmd = 'npm';
      const nodeDir = path.dirname(process.execPath);
      const portableNpmCmd = path.join(nodeDir, 'npm.cmd');
      const portableNpmCli = path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js');

      if (fs.existsSync(portableNpmCmd)) {
        npmCmd = `"${portableNpmCmd}"`;
      } else if (fs.existsSync(portableNpmCli)) {
        npmCmd = `"${process.execPath}" "${portableNpmCli}"`;
      }

      execSync(`${npmCmd} install`, { stdio: 'inherit' });
      console.log("\n[SUCCES] Installation et verification terminees !\n");
    } catch (err) {
      console.error("\n[ERREUR] L'installation des composants a echoue.");
      console.error("Vérifiez votre connexion Internet et reessayez.\n");
      process.exit(1);
    }
  }

  // 2. Libération du port 3000 s'il est occupé par un ancien serveur GMAO (Windows)
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
      // Échec silencieux
    }
  }

  // 3. Recherche dynamique d'un port disponible (3000, 3001, 3002...) si 3000 reste réservé/occupé
  const activePort = await findAvailablePort(3000);
  if (activePort !== 3000) {
    console.log(`[INFO] Le port 3000 etant reserve par le systeme ou une autre application, utilisation automatique du port alternatif ${activePort}.\n`);
  }

  // 4. Détermination de l'IP locale pour le partage réseau
  let localIp = 'localhost';
  try {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
      for (const net of interfaces[interfaceName]) {
        if (net.family === 'IPv4' && !net.internal) {
          localIp = net.address;
          break;
        }
      }
      if (localIp !== 'localhost') break;
    }
  } catch (err) {
    // Ignorer
  }

  // 5. Affichage de l'interface d'accueil
  console.clear();
  console.log("======================================================================");
  console.log("🚀 DEMARRAGE DE LA GMAO STA CHERY TUNISIE");
  console.log("======================================================================");
  console.log("");
  console.log("L'application démarre...");
  console.log("");
  console.log("----------------------------------------------------------------------");
  console.log("💻 SUR VOTRE ORDINATEUR (Local) :");
  console.log(`   Ouvrez ce lien : http://localhost:${activePort}`);
  console.log("");
  console.log("🔌 PARTAGE SUR VOTRE RESEAU LOCAL (LAN) :");
  console.log("   Vos collegues peuvent s'y connecter DIRECTEMENT depuis leurs PC,");
  console.log("   tablettes ou smartphones connectes au meme reseau Wi-Fi / Ethernet :");
  console.log(`   --> http://${localIp}:${activePort}`);
  console.log("----------------------------------------------------------------------");
  console.log("");
  console.log("Pour arreter le serveur, fermez simplement cette fenetre noire.");
  console.log("======================================================================");
  console.log("");

  // 6. Ouverture automatique du navigateur sur le port actif
  setTimeout(() => {
    try {
      const url = `http://localhost:${activePort}`;
      if (process.platform === 'win32') {
        execSync(`start "" "${url}"`);
      } else if (process.platform === 'darwin') {
        execSync(`open "${url}"`);
      } else {
        execSync(`xdg-open "${url}"`);
      }
    } catch (e) {
      // Ignorer
    }
  }, 1500);

  // 7. Lancement du serveur Vite de développement sur le port sélectionné
  const viteBinPath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
  let devServer;

  if (fs.existsSync(viteBinPath)) {
    devServer = spawn(process.execPath, [viteBinPath, '--host', '0.0.0.0', '--port', String(activePort)], { stdio: 'inherit' });
  } else {
    devServer = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', String(activePort)], { stdio: 'inherit', shell: true });
  }

  devServer.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error("[ERREUR] Un probleme est survenu lors du lancement :", err);
  process.exit(1);
});
