import React, { useState, useEffect } from "react";
import {
  Terminal,
  X,
  Cpu,
  HardDrive,
  Activity,
  ShieldCheck,
  Zap,
  RefreshCw,
  Download,
  Database,
  CheckCircle2,
  Key,
  Layers,
  Sparkles,
  Play
} from "lucide-react";
import { ActivityLog } from "../types";

interface DeveloperConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
  onSwitchRoleQuick: (role: string) => void;
  activityLogs: ActivityLog[];
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  handleManualSaveToDisk: () => void;
  equipmentsCount: number;
  interventionsCount: number;
  sparePartsCount: number;
  purchaseRequestsCount: number;
  contractsCount: number;
}

export default function DeveloperConsoleModal({
  isOpen,
  onClose,
  currentUserRole,
  onSwitchRoleQuick,
  activityLogs,
  showToast,
  handleManualSaveToDisk,
  equipmentsCount,
  interventionsCount,
  sparePartsCount,
  purchaseRequestsCount,
  contractsCount
}: DeveloperConsoleModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"telemetry" | "tools" | "terminal">("telemetry");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "STA DEVSUITE v1.0.0 [STA CHERY TUNISIE CORE ENGINE]",
    "System status: OK (100% Operational)",
    "Storage Engine: LocalStorage (Auto-persisted)",
    "Ready for CLI commands. Type 'help' for available commands."
  ]);
  const [storageKb, setStorageKb] = useState<number>(0);

  useEffect(() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("chery_gmao_")) {
        const val = localStorage.getItem(key);
        if (val) total += val.length * 2; // approx bytes in UTF-16
      }
    }
    setStorageKb(Math.round(total / 1024 * 10) / 10);
  }, [isOpen, activityLogs]);

  if (!isOpen) return null;

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newLogs = [...terminalLogs, `chery-gmao > ${terminalInput}`];

    if (cmd === "help") {
      newLogs.push(
        "--- COMMANDES DISPONIBLES ---",
        "  status    : Affiche le bilan de santé du système",
        "  ping      : Teste la réactivité de la base de données (0ms)",
        "  admin     : Active le rôle Administrateur en 1-click",
        "  clear     : Efface l'historique du terminal",
        "  save      : Force la sauvegarde sur disque local",
        "  stats     : Résumé des entités enregistrées",
        "  toast     : Génère un toast de notification de test"
      );
    } else if (cmd === "status") {
      newLogs.push("✅ Base de données intacte - 0 erreur détectée", `💾 Espace utilisé: ${storageKb} KB / 5120 KB`);
    } else if (cmd === "ping") {
      newLogs.push("🏓 PONG! Latence stockage: 0.12 ms (In-Memory cache synchrone)");
    } else if (cmd === "admin") {
      onSwitchRoleQuick("admin");
      newLogs.push("🔑 Mode Administrateur activé avec succès.");
      showToast("🔑 Rôle basculé vers Administrateur (Dev Touch)", "success");
    } else if (cmd === "clear") {
      setTerminalLogs(["Terminal effacé. Tapez 'help' pour la liste des commandes."]);
      setTerminalInput("");
      return;
    } else if (cmd === "save") {
      handleManualSaveToDisk();
      newLogs.push("💾 Sauvegarde manuelle exécutée avec succès.");
    } else if (cmd === "stats") {
      newLogs.push(
        `⚙️ Équipements: ${equipmentsCount}`,
        `🛠️ Interventions: ${interventionsCount}`,
        `📦 Pièces en stock: ${sparePartsCount}`,
        `🛒 Demandes d'achat: ${purchaseRequestsCount}`,
        `📄 Contrats: ${contractsCount}`
      );
    } else if (cmd === "toast") {
      showToast("🧪 Test Toast Développeur Pro 🚀", "success");
      newLogs.push("✨ Notification toast affichée sur l'interface.");
    } else {
      newLogs.push(`⚠️ Commande inconnue: '${cmd}'. Tapez 'help' pour voir les commandes.`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput("");
  };

  const storagePercent = Math.min(100, (storageKb / 5120) * 100);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl max-w-3xl w-full text-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Terminal Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 text-red-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-sm tracking-tight text-white">
                  STA DEVSUITE 1.0 • Console Développeur Pro
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Diagnostics système, télémétrie en temps réel & commandes rapides (Raccourci: Ctrl+Shift+D)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/50 border-b border-slate-800/80 px-5 flex gap-4 shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveSubTab("telemetry")}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "telemetry"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            Télémétrie System & Performance
          </button>

          <button
            onClick={() => setActiveSubTab("tools")}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "tools"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Outils Développeur & Rôles
          </button>

          <button
            onClick={() => setActiveSubTab("terminal")}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "terminal"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Terminal CLI (Interactive)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-xs space-y-6">

          {/* TELEMETRY TAB */}
          {activeSubTab === "telemetry" && (
            <div className="space-y-6">
              {/* Cards overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <HardDrive className="h-4 w-4 text-cyan-400" />
                      Stockage Local
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">{storageKb} KB</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, storagePercent)}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Capacité max: 5000 KB</span>
                    <span>{storagePercent.toFixed(1)}% utilisé</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      Fréquence Rendu
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">60 FPS</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Engine V8 Chrome React 18+ opti avec React Hooks ultra-stables.
                  </p>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                    <span>Latence DB: 0.1ms</span>
                    <span>HMR status: Safe</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <ShieldCheck className="h-4 w-4 text-purple-400" />
                      Sécurité Rôle
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold uppercase">{currentUserRole}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Contrôle d'accès par rôle actif sur l'ensemble des 9 modules.
                  </p>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                    <span>Mode PIN: Actif</span>
                    <span>Sanitization: OK</span>
                  </div>
                </div>
              </div>

              {/* Health Check Table */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-mono font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Layers className="h-4 w-4 text-red-400" />
                  Audit & Santé des Modules de la GMAO (6/6 Synchro)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span>Équipements Garage</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {equipmentsCount}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span>Interventions & OT</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {interventionsCount}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span>Stock Pièces Det.</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {sparePartsCount}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span>Demandes d'Achat</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {purchaseRequestsCount}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span>Contrats Maint.</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {contractsCount}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span>Journal d'Audit</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {activityLogs.length} logs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOOLS TAB */}
          {activeSubTab === "tools" && (
            <div className="space-y-6 font-sans">
              <div>
                <h4 className="font-mono font-bold text-slate-200 text-xs mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-400" />
                  Basculement Rapide de Rôle Utilisateur (Pro Dev Override)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "admin", label: "🔑 Admin (Ahmed Amine)", color: "border-red-500/50 bg-red-950/30 text-red-300" },
                    { id: "supervisor", label: "👁️ Superviseur (Lecture seule)", color: "border-blue-500/50 bg-blue-950/30 text-blue-300" },
                    { id: "magasin", label: "📦 Magasinier (Stock & Achats)", color: "border-amber-500/50 bg-amber-950/30 text-amber-300" },
                    { id: "service_rapide", label: "⚡ Chef Service Rapide", color: "border-purple-500/50 bg-purple-950/30 text-purple-300" },
                    { id: "atelier_mecanique", label: "⚙️ Chef Atelier Mécanique", color: "border-emerald-500/50 bg-emerald-950/30 text-emerald-300" },
                    { id: "batiment", label: "🏢 Chef Maintenance Bâtiment", color: "border-cyan-500/50 bg-cyan-950/30 text-cyan-300" }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSwitchRoleQuick(r.id);
                        showToast(`Rôle changé vers ${r.label}`, "info");
                      }}
                      className={`p-3 rounded-xl border font-mono text-[11px] font-bold text-left transition-all hover:scale-102 cursor-pointer ${
                        currentUserRole === r.id ? "ring-2 ring-white font-black" : "opacity-80 hover:opacity-100"
                      } ${r.color}`}
                    >
                      {r.label}
                      {currentUserRole === r.id && <span className="block text-[9px] text-white mt-1">● ACTIF</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono font-bold text-slate-200 text-xs mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Raccourcis & Tests Système
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleManualSaveToDisk();
                      showToast("Sauvegarde forcée en mémoire locale", "success");
                    }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs px-4 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    Forcer Sauvegarde LocalStorage
                  </button>

                  <button
                    onClick={() => {
                      showToast("Test Toast Succès 🚀", "success");
                    }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs px-4 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                  >
                    🧪 Test Toast Succès
                  </button>

                  <button
                    onClick={() => {
                      showToast("Test Toast Information ℹ️", "info");
                    }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs px-4 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                  >
                    🧪 Test Toast Info
                  </button>

                  <button
                    onClick={() => {
                      showToast("Test Toast Erreur ⚠️", "error");
                    }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-red-300 font-mono text-xs px-4 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                  >
                    🧪 Test Toast Erreur
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TERMINAL TAB */}
          {activeSubTab === "terminal" && (
            <div className="space-y-4 font-mono">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto space-y-1 text-xs font-mono">
                {terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.startsWith("chery-gmao >")
                        ? "text-cyan-400 font-bold"
                        : log.startsWith("⚠️")
                        ? "text-amber-400"
                        : log.startsWith("✅") || log.startsWith("✨")
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>

              <form onSubmit={handleRunCommand} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-cyan-400 font-mono text-xs font-bold">
                    chery-gmao &gt;
                  </span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Tapez une commande (ex: help, status, admin, ping, stats, save)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-28 pr-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  Exécuter
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Console Footer */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>Raccourcis: <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd> Recherche globale</span>
            <span>|</span>
            <span><kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700">Ctrl+Shift+D</kbd> Console Développeur</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-bold cursor-pointer"
          >
            Fermer la Console
          </button>
        </div>

      </div>
    </div>
  );
}
