import React, { useState } from "react";
import {
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Leaf,
  Plus,
  Zap,
  TrendingUp,
  Image as ImageIcon,
  FileSpreadsheet,
  Gauge,
  ClipboardCheck,
  Eye,
  RotateCcw,
  Trash2,
  Edit,
  Building2,
  HardHat,
  Droplets,
  Activity,
  X
} from "lucide-react";
import {
  Audit5S,
  LeanItem,
  SafetyRecord,
  QualityRecord,
  EnvironmentLog,
  Workshop
} from "../types";
import { WORKSHOPS } from "../data";

interface ContinuousImprovementProps {
  audits5s: Audit5S[];
  leanItems: LeanItem[];
  safetyRecords: SafetyRecord[];
  qualityRecords: QualityRecord[];
  environmentLogs: EnvironmentLog[];
  onAddAudit5S: (audit: Audit5S) => void;
  onUpdateAudit5S?: (audit: Audit5S) => void;
  onDeleteAudit5S?: (auditId: string) => void;
  onAddLeanItem: (item: LeanItem) => void;
  onUpdateLeanItem?: (item: LeanItem) => void;
  onDeleteLeanItem?: (itemId: string) => void;
  onAddSafetyRecord: (record: SafetyRecord) => void;
  onUpdateSafetyRecord?: (record: SafetyRecord) => void;
  onDeleteSafetyRecord?: (recordId: string) => void;
  onAddQualityRecord: (record: QualityRecord) => void;
  onUpdateQualityRecord?: (record: QualityRecord) => void;
  onDeleteQualityRecord?: (recordId: string) => void;
  onAddEnvironmentLog: (log: EnvironmentLog) => void;
  onUpdateEnvironmentLog?: (log: EnvironmentLog) => void;
  onDeleteEnvironmentLog?: (logId: string) => void;
  isReadOnly?: boolean;
  currentUserRole: string;
}

export default function ContinuousImprovementManager({
  audits5s,
  leanItems,
  safetyRecords,
  qualityRecords,
  environmentLogs,
  onAddAudit5S,
  onUpdateAudit5S,
  onDeleteAudit5S,
  onAddLeanItem,
  onUpdateLeanItem,
  onDeleteLeanItem,
  onAddSafetyRecord,
  onUpdateSafetyRecord,
  onDeleteSafetyRecord,
  onAddQualityRecord,
  onUpdateQualityRecord,
  onDeleteQualityRecord,
  onAddEnvironmentLog,
  onUpdateEnvironmentLog,
  onDeleteEnvironmentLog,
  isReadOnly = false,
  currentUserRole
}: ContinuousImprovementProps) {
  const [activeSubModule, setActiveSubModule] = useState<"5s" | "lean" | "securite" | "qualite" | "environnement">("5s");

  // Create Modals
  const [show5sModal, setShow5sModal] = useState(false);
  const [showLeanModal, setShowLeanModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);

  // Edit Modals State
  const [editingAudit5S, setEditingAudit5S] = useState<Audit5S | null>(null);
  const [editingLeanItem, setEditingLeanItem] = useState<LeanItem | null>(null);
  const [editingSafetyRecord, setEditingSafetyRecord] = useState<SafetyRecord | null>(null);
  const [editingQualityRecord, setEditingQualityRecord] = useState<QualityRecord | null>(null);
  const [editingEnvLog, setEditingEnvLog] = useState<EnvironmentLog | null>(null);

  // 5S Form
  const [fWorkshop, setFWorkshop] = useState<Workshop>("Service Rapide");
  const [fAuditor, setFAuditor] = useState("Ahmed Amine (5S)");
  const [fSeiri, setFSeiri] = useState(18);
  const [fSeiton, setFSeiton] = useState(17);
  const [fSeiso, setFSeiso] = useState(18);
  const [fSeiketsu, setFSeiketsu] = useState(16);
  const [fShitsuke, setFShitsuke] = useState(18);
  const [fAction, setFAction] = useState("");

  // Lean Form
  const [lType, setLType] = useState<"Gaspillage (Muda)" | "Kaizen" | "TPM" | "Suggestion" | "Standardisation">("Gaspillage (Muda)");
  const [lMuda, setLMuda] = useState<any>("Mouvements");
  const [lTitle, setLTitle] = useState("");
  const [lWorkshop, setLWorkshop] = useState<Workshop>("Atelier Mécanique");
  const [lDesc, setLDesc] = useState("");

  // Safety Form
  const [sCategory, setSCategory] = useState<SafetyRecord["type"]>("Audit Sécurité");
  const [sLocation, setSLocation] = useState("Atelier Carrosserie");
  const [sDesc, setSDesc] = useState("");
  const [sSeverity, setSSeverity] = useState<"Mineure" | "Moyenne" | "Grave" | "Critique">("Moyenne");

  // Quality Form
  const [qType, setQType] = useState<QualityRecord["type"]>("Non-conformité");
  const [qTitle, setQTitle] = useState("");
  const [qWorkshop, setQWorkshop] = useState<Workshop>("Service Rapide");
  const [qDetails, setQDetails] = useState("");

  // Env Form
  const [eCat, setECat] = useState<EnvironmentLog["category"]>("Huiles usagées");
  const [eVal, setEVal] = useState(500);
  const [eUnit, setEUnit] = useState<EnvironmentLog["unit"]>("Litre");
  const [eCost, setECost] = useState(250);

  // --- Handlers: 5S ---
  const handleSave5S = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Math.round(((fSeiri + fSeiton + fSeiso + fSeiketsu + fShitsuke) / 100) * 100);
    const newAudit: Audit5S = {
      id: `AUD-5S-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      workshop: fWorkshop,
      auditor: fAuditor,
      seiriScore: fSeiri,
      seitonScore: fSeiton,
      seisoScore: fSeiso,
      seiketsuScore: fSeiketsu,
      shitsukeScore: fShitsuke,
      totalScore: total,
      actionPlan: fAction.trim() || "Actions d'amélioration standard 5S",
      status: total >= 80 ? "Conforme" : "À corriger"
    };
    onAddAudit5S(newAudit);
    setShow5sModal(false);
    setFAction("");
  };

  const handleUpdateAudit5SForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAudit5S || !onUpdateAudit5S) return;
    const total = Math.round(
      ((editingAudit5S.seiriScore +
        editingAudit5S.seitonScore +
        editingAudit5S.seisoScore +
        editingAudit5S.seiketsuScore +
        editingAudit5S.shitsukeScore) /
        100) *
        100
    );
    const updated: Audit5S = {
      ...editingAudit5S,
      totalScore: total,
      status: total >= 80 ? "Conforme" : "À corriger"
    };
    onUpdateAudit5S(updated);
    setEditingAudit5S(null);
  };

  // --- Handlers: Lean ---
  const handleSaveLean = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lTitle.trim()) return;
    const item: LeanItem = {
      id: `LEAN-${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0],
      type: lType,
      mudaCategory: lType === "Gaspillage (Muda)" ? lMuda : undefined,
      title: lTitle.trim(),
      workshop: lWorkshop,
      description: lDesc.trim() || "Chantier d'élimination des gaspillages",
      author: currentUserRole,
      status: "En cours",
      estimatedSavingTnd: 1200,
      impactScore: "Fort"
    };
    onAddLeanItem(item);
    setShowLeanModal(false);
    setLTitle("");
    setLDesc("");
  };

  const handleUpdateLeanItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeanItem || !onUpdateLeanItem) return;
    onUpdateLeanItem(editingLeanItem);
    setEditingLeanItem(null);
  };

  const handleQuickStatusLean = (item: LeanItem, newStatus: LeanItem["status"]) => {
    if (!onUpdateLeanItem) return;
    onUpdateLeanItem({ ...item, status: newStatus });
  };

  // --- Handlers: Safety ---
  const handleSaveSafety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sDesc.trim()) return;
    const record: SafetyRecord = {
      id: `HSE-${Date.now()}`,
      type: sCategory,
      date: new Date().toISOString().split("T")[0],
      location: sLocation,
      description: sDesc.trim(),
      severity: sSeverity,
      actionPlan: "Sécurisation immédiate et mise en conformité EPI/EPC",
      responsible: "Responsable HSE",
      status: "En cours"
    };
    onAddSafetyRecord(record);
    setShowSafetyModal(false);
    setSDesc("");
  };

  const handleUpdateSafetyRecordForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSafetyRecord || !onUpdateSafetyRecord) return;
    onUpdateSafetyRecord(editingSafetyRecord);
    setEditingSafetyRecord(null);
  };

  const handleQuickStatusSafety = (record: SafetyRecord, newStatus: SafetyRecord["status"]) => {
    if (!onUpdateSafetyRecord) return;
    onUpdateSafetyRecord({ ...record, status: newStatus });
  };

  // --- Handlers: Quality ---
  const handleSaveQuality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim()) return;
    const record: QualityRecord = {
      id: `CAPA-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: qType,
      title: qTitle.trim(),
      workshop: qWorkshop,
      details: qDetails.trim() || "Traitement de non-conformité SAV",
      responsible: "Chef d'Atelier",
      status: "Ouvert"
    };
    onAddQualityRecord(record);
    setShowQualityModal(false);
    setQTitle("");
    setQDetails("");
  };

  const handleUpdateQualityRecordForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQualityRecord || !onUpdateQualityRecord) return;
    onUpdateQualityRecord(editingQualityRecord);
    setEditingQualityRecord(null);
  };

  const handleQuickStatusQuality = (record: QualityRecord, newStatus: QualityRecord["status"]) => {
    if (!onUpdateQualityRecord) return;
    onUpdateQualityRecord({ ...record, status: newStatus });
  };

  // --- Handlers: Env ---
  const handleSaveEnv = (e: React.FormEvent) => {
    e.preventDefault();
    const log: EnvironmentLog = {
      id: `ENV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      category: eCat,
      value: eVal,
      unit: eUnit,
      costOrSavingTnd: eCost,
      notes: "Registre environnemental conforme"
    };
    onAddEnvironmentLog(log);
    setShowEnvModal(false);
  };

  const handleUpdateEnvLogForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnvLog || !onUpdateEnvironmentLog) return;
    onUpdateEnvironmentLog(editingEnvLog);
    setEditingEnvLog(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-chery-red text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Pilotage Lean Manufacturing & Démarche Progrès (SAV Chery)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Module Amélioration Continue & Excellence Opérationnelle
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion intégrée du 5S, Kaizen (8 Gasps), Sécurité HSE, Qualité CAPA & Audit Environnemental ISO 14001.
          </p>
        </div>

        {/* Global Submodule Navigation Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto shrink-0">
          {[
            { id: "5s", label: "5S & Visuel", icon: Sparkles },
            { id: "lean", label: "Lean & Kaizen", icon: Zap },
            { id: "securite", label: "Sécurité HSE", icon: ShieldCheck },
            { id: "qualite", label: "Qualité CAPA", icon: Award },
            { id: "environnement", label: "Environnement", icon: Leaf }
          ].map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSubModule === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubModule(sub.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-MODULE 1: 5S & MANAGEMENT VISUEL */}
      {activeSubModule === "5s" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Audits 5S par Atelier</h3>
              <p className="text-xs text-slate-500">Seiri (Débarras), Seiton (Rangement), Seiso (Nettoyage), Seiketsu (Standard), Shitsuke (Rigueur).</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShow5sModal(true)}
                className="bg-chery-red hover:bg-chery-dark text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Nouveau Score Audit 5S</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audits5s.map((audit) => (
              <div key={audit.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{audit.date}</span>
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-chery-red" />
                      {audit.workshop}
                    </h4>
                    <span className="text-[10px] text-slate-500">Auditeur: {audit.auditor}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black font-mono ${audit.totalScore >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                      {audit.totalScore}%
                    </span>
                    <span className={`block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      audit.status === "Conforme" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {audit.status}
                    </span>
                  </div>
                </div>

                {/* 5 Pillar Micro Progress Bars */}
                <div className="grid grid-cols-5 gap-1 pt-2 border-t border-slate-100 text-[10px]">
                  <div className="text-center">
                    <span className="text-slate-400 block font-bold">Seiri</span>
                    <span className="font-mono font-bold text-slate-800">{audit.seiriScore}/20</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 block font-bold">Seiton</span>
                    <span className="font-mono font-bold text-slate-800">{audit.seitonScore}/20</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 block font-bold">Seiso</span>
                    <span className="font-mono font-bold text-slate-800">{audit.seisoScore}/20</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 block font-bold">Seiketsu</span>
                    <span className="font-mono font-bold text-slate-800">{audit.seiketsuScore}/20</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 block font-bold">Shitsuke</span>
                    <span className="font-mono font-bold text-slate-800">{audit.shitsukeScore}/20</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 italic">
                  "{audit.actionPlan}"
                </p>

                {!isReadOnly && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingAudit5S(audit)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" /> Modifier
                    </button>
                    {onDeleteAudit5S && (
                      <button
                        onClick={() => onDeleteAudit5S(audit.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-MODULE 2: LEAN & KAIZEN */}
      {activeSubModule === "lean" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Chantiers Kaizen & Chasse aux 8 Gaspillages (Muda)</h3>
              <p className="text-xs text-slate-500">Idées d'amélioration continue proposées par les compagnons et mécaniciens.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowLeanModal(true)}
                className="bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Déclarer un Chantier Kaizen</span>
              </button>
            )}
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Type / Muda</th>
                  <th className="p-3">Sujet Kaizen</th>
                  <th className="p-3">Atelier</th>
                  <th className="p-3">Auteur</th>
                  <th className="p-3">Gain Estimé</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leanItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{item.type}</span>
                      {item.mudaCategory && <span className="text-[10px] text-chery-red font-bold">⚠️ {item.mudaCategory}</span>}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-[10px] text-slate-500 block">{item.description}</span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">{item.workshop}</td>
                    <td className="p-3 text-slate-600">👤 {item.author}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">+{item.estimatedSavingTnd || 0} TND</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === "Standardisé" || item.status === "Appliqué"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {!isReadOnly && (
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "En cours" && (
                            <button
                              onClick={() => handleQuickStatusLean(item, "Appliqué")}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Appliquer
                            </button>
                          )}
                          <button
                            onClick={() => setEditingLeanItem(item)}
                            className="p-1 text-slate-400 hover:text-slate-800"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {onDeleteLeanItem && (
                            <button
                              onClick={() => onDeleteLeanItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-MODULE 3: SÉCURITÉ HSE */}
      {activeSubModule === "securite" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Registre de Sécurité & Prévention HSE</h3>
              <p className="text-xs text-slate-500">Signalisations de risques, incidents évités (Near-Miss) & port des EPI.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowSafetyModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Déclarer Alerte Sécurité HSE</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyRecords.map((s) => (
              <div key={s.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    s.severity === "Critique" || s.severity === "Grave" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    Sévérité {s.severity}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{s.date}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{s.description}</h4>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>📍 {s.location}</span>
                  <span>•</span>
                  <span>👤 {s.responsible}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Plan d'action préventif :</span>
                  <p className="text-slate-600">{s.actionPlan}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    s.status === "Réglé" || s.status === "Sous contrôle" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    Statut: {s.status}
                  </span>

                  {!isReadOnly && (
                    <div className="flex items-center gap-2">
                      {s.status === "En cours" && (
                        <button
                          onClick={() => handleQuickStatusSafety(s, "Réglé")}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          Réglé
                        </button>
                      )}
                      <button
                        onClick={() => setEditingSafetyRecord(s)}
                        className="p-1 text-slate-400 hover:text-slate-800"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {onDeleteSafetyRecord && (
                        <button
                          onClick={() => onDeleteSafetyRecord(s.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-MODULE 4: QUALITÉ CAPA */}
      {activeSubModule === "qualite" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Plan d'Actions Correctives & Préventives (CAPA)</h3>
              <p className="text-xs text-slate-500">Non-conformités SAV, réclamations clients Chery et audits constructeur.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowQualityModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Ouvrir Fiche CAPA</span>
              </button>
            )}
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Sujet CAPA</th>
                  <th className="p-3">Atelier</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qualityRecords.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-700">{q.type}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{q.title}</span>
                      <span className="text-[10px] text-slate-500">{q.details}</span>
                    </td>
                    <td className="p-3 text-slate-700">{q.workshop}</td>
                    <td className="p-3 font-semibold text-slate-800">👤 {q.responsible}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        q.status === "Résolu" || q.status === "Validé" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {!isReadOnly && (
                        <div className="flex items-center justify-end gap-1.5">
                          {q.status !== "Résolu" && q.status !== "Validé" && (
                            <button
                              onClick={() => handleQuickStatusQuality(q, "Résolu")}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Résoudre
                            </button>
                          )}
                          <button
                            onClick={() => setEditingQualityRecord(q)}
                            className="p-1 text-slate-400 hover:text-slate-800"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {onDeleteQualityRecord && (
                            <button
                              onClick={() => onDeleteQualityRecord(q.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-MODULE 5: ENVIRONNEMENT ISO 14001 */}
      {activeSubModule === "environnement" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Suivi Environnemental & Recyclage Déchets</h3>
              <p className="text-xs text-slate-500">Traçabilité huiles usagées, filtres, liquides de frein et pièces usagées.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowEnvModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Saisir Collecte Déchets</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {environmentLogs.map((e) => (
              <div key={e.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{e.date}</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">+{e.costOrSavingTnd} TND</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  {e.category}
                </h4>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {e.value} <span className="text-xs font-normal text-slate-500">{e.unit}</span>
                </p>
                <p className="text-xs text-slate-500">{e.notes}</p>

                {!isReadOnly && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingEnvLog(e)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" /> Modifier
                    </button>
                    {onDeleteEnvironmentLog && (
                      <button
                        onClick={() => onDeleteEnvironmentLog(e.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: NEW 5S */}
      {show5sModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Nouvel Audit 5S</h3>
            <form onSubmit={handleSave5S} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Atelier Cible</label>
                <select
                  value={fWorkshop}
                  onChange={(e) => setFWorkshop(e.target.value as Workshop)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                >
                  {WORKSHOPS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiri (/20)</label>
                  <input type="number" min="0" max="20" value={fSeiri} onChange={(e) => setFSeiri(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiton (/20)</label>
                  <input type="number" min="0" max="20" value={fSeiton} onChange={(e) => setFSeiton(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiso (/20)</label>
                  <input type="number" min="0" max="20" value={fSeiso} onChange={(e) => setFSeiso(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiketsu (/20)</label>
                  <input type="number" min="0" max="20" value={fSeiketsu} onChange={(e) => setFSeiketsu(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shitsuke (/20)</label>
                  <input type="number" min="0" max="20" value={fShitsuke} onChange={(e) => setFShitsuke(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Plan d'action retenu</label>
                <input
                  type="text"
                  value={fAction}
                  onChange={(e) => setFAction(e.target.value)}
                  placeholder="ex: Etiquetage bacs outillage spécial"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShow5sModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-chery-red text-white font-bold py-2.5 rounded-xl shadow-md">Enregistrer Audit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: 5S */}
      {editingAudit5S && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier l'Audit 5S</h3>
            <form onSubmit={handleUpdateAudit5SForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Atelier</label>
                <select
                  value={editingAudit5S.workshop}
                  onChange={(e) => setEditingAudit5S({ ...editingAudit5S, workshop: e.target.value as Workshop })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                >
                  {WORKSHOPS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiri (/20)</label>
                  <input type="number" min="0" max="20" value={editingAudit5S.seiriScore} onChange={(e) => setEditingAudit5S({ ...editingAudit5S, seiriScore: Number(e.target.value) })} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiton (/20)</label>
                  <input type="number" min="0" max="20" value={editingAudit5S.seitonScore} onChange={(e) => setEditingAudit5S({ ...editingAudit5S, seitonScore: Number(e.target.value) })} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiso (/20)</label>
                  <input type="number" min="0" max="20" value={editingAudit5S.seisoScore} onChange={(e) => setEditingAudit5S({ ...editingAudit5S, seisoScore: Number(e.target.value) })} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seiketsu (/20)</label>
                  <input type="number" min="0" max="20" value={editingAudit5S.seiketsuScore} onChange={(e) => setEditingAudit5S({ ...editingAudit5S, seiketsuScore: Number(e.target.value) })} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shitsuke (/20)</label>
                  <input type="number" min="0" max="20" value={editingAudit5S.shitsukeScore} onChange={(e) => setEditingAudit5S({ ...editingAudit5S, shitsukeScore: Number(e.target.value) })} className="w-full border border-slate-300 rounded-xl p-2 font-mono" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Plan d'action</label>
                <input
                  type="text"
                  value={editingAudit5S.actionPlan}
                  onChange={(e) => setEditingAudit5S({ ...editingAudit5S, actionPlan: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingAudit5S(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-chery-red text-white font-bold py-2.5 rounded-xl shadow-md">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: LEAN ITEM */}
      {editingLeanItem && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier Chantier Kaizen</h3>
            <form onSubmit={handleUpdateLeanItemForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre</label>
                <input
                  type="text"
                  required
                  value={editingLeanItem.title}
                  onChange={(e) => setEditingLeanItem({ ...editingLeanItem, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Atelier</label>
                  <select
                    value={editingLeanItem.workshop}
                    onChange={(e) => setEditingLeanItem({ ...editingLeanItem, workshop: e.target.value as Workshop })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    {WORKSHOPS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={editingLeanItem.status}
                    onChange={(e) => setEditingLeanItem({ ...editingLeanItem, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Nouveau">Nouveau</option>
                    <option value="En cours">En cours</option>
                    <option value="Appliqué">Appliqué</option>
                    <option value="Standardisé">Standardisé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gain Estimé (TND)</label>
                <input
                  type="number"
                  value={editingLeanItem.estimatedSavingTnd || 0}
                  onChange={(e) => setEditingLeanItem({ ...editingLeanItem, estimatedSavingTnd: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingLeanItem(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl shadow-md">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: SAFETY RECORD */}
      {editingSafetyRecord && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier Fiche Sécurité HSE</h3>
            <form onSubmit={handleUpdateSafetyRecordForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editingSafetyRecord.description}
                  onChange={(e) => setEditingSafetyRecord({ ...editingSafetyRecord, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sévérité</label>
                  <select
                    value={editingSafetyRecord.severity}
                    onChange={(e) => setEditingSafetyRecord({ ...editingSafetyRecord, severity: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Mineure">Mineure</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Grave">Grave</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={editingSafetyRecord.status}
                    onChange={(e) => setEditingSafetyRecord({ ...editingSafetyRecord, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="En cours">En cours</option>
                    <option value="Réglé">Réglé</option>
                    <option value="Sous contrôle">Sous contrôle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Plan d'action</label>
                <textarea
                  rows={2}
                  value={editingSafetyRecord.actionPlan}
                  onChange={(e) => setEditingSafetyRecord({ ...editingSafetyRecord, actionPlan: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingSafetyRecord(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl shadow-md">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: QUALITY RECORD */}
      {editingQualityRecord && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier Fiche CAPA</h3>
            <form onSubmit={handleUpdateQualityRecordForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sujet CAPA</label>
                <input
                  type="text"
                  required
                  value={editingQualityRecord.title}
                  onChange={(e) => setEditingQualityRecord({ ...editingQualityRecord, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={editingQualityRecord.status}
                    onChange={(e) => setEditingQualityRecord({ ...editingQualityRecord, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Ouvert">Ouvert</option>
                    <option value="En traitement">En traitement</option>
                    <option value="Résolu">Résolu</option>
                    <option value="Validé">Validé</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsable</label>
                  <input
                    type="text"
                    value={editingQualityRecord.responsible}
                    onChange={(e) => setEditingQualityRecord({ ...editingQualityRecord, responsible: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Détails</label>
                <textarea
                  rows={2}
                  value={editingQualityRecord.details}
                  onChange={(e) => setEditingQualityRecord({ ...editingQualityRecord, details: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingQualityRecord(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-amber-600 text-white font-bold py-2.5 rounded-xl shadow-md">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: ENV LOG */}
      {editingEnvLog && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier Collecte Déchets</h3>
            <form onSubmit={handleUpdateEnvLogForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                <input
                  type="text"
                  required
                  value={editingEnvLog.category}
                  onChange={(e) => setEditingEnvLog({ ...editingEnvLog, category: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantité</label>
                  <input
                    type="number"
                    value={editingEnvLog.value}
                    onChange={(e) => setEditingEnvLog({ ...editingEnvLog, value: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valorisation / Gain (TND)</label>
                  <input
                    type="number"
                    value={editingEnvLog.costOrSavingTnd}
                    onChange={(e) => setEditingEnvLog({ ...editingEnvLog, costOrSavingTnd: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingEnvLog(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW LEAN */}
      {showLeanModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Nouveau Chantier Kaizen</h3>
            <form onSubmit={handleSaveLean} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre de l'Idée Kaizen</label>
                <input
                  type="text"
                  required
                  value={lTitle}
                  onChange={(e) => setLTitle(e.target.value)}
                  placeholder="ex: Fabrication servante spécifique purge frein"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={lType}
                    onChange={(e) => setLType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Gaspillage (Muda)">Gaspillage (Muda)</option>
                    <option value="Kaizen">Kaizen</option>
                    <option value="TPM">TPM</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Standardisation">Standardisation</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Atelier</label>
                  <select
                    value={lWorkshop}
                    onChange={(e) => setLWorkshop(e.target.value as Workshop)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    {WORKSHOPS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Problème résolu</label>
                <textarea
                  rows={2}
                  value={lDesc}
                  onChange={(e) => setLDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowLeanModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl shadow-md">Enregistrer Kaizen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW SAFETY */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Déclarer un Événement Sécurité HSE</h3>
            <form onSubmit={handleSaveSafety} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description du Risque</label>
                <input
                  type="text"
                  required
                  value={sDesc}
                  onChange={(e) => setSDesc(e.target.value)}
                  placeholder="ex: Fuite d'huile non absorbée près du pont 3"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sévérité</label>
                  <select
                    value={sSeverity}
                    onChange={(e) => setSSeverity(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Mineure">Mineure</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Grave">Grave</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lieu / Zone</label>
                  <input
                    type="text"
                    value={sLocation}
                    onChange={(e) => setSLocation(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowSafetyModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl shadow-md">Créer Alerte HSE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW QUALITY */}
      {showQualityModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Ouvrir une Fiche CAPA Qualité</h3>
            <form onSubmit={handleSaveQuality} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé de la Non-Conformité</label>
                <input
                  type="text"
                  required
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  placeholder="ex: Trace de graisse sur volant après vidange"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Atelier concerné</label>
                <select
                  value={qWorkshop}
                  onChange={(e) => setQWorkshop(e.target.value as Workshop)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                >
                  {WORKSHOPS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowQualityModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-amber-600 text-white font-bold py-2.5 rounded-xl shadow-md">Ouvrir Fiche CAPA</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW ENV */}
      {showEnvModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Enregistrer Collecte Déchets</h3>
            <form onSubmit={handleSaveEnv} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Type de Déchet</label>
                <input
                  type="text"
                  required
                  value={eCat}
                  onChange={(e) => setECat(e.target.value as any)}
                  placeholder="ex: Filtres usagés, Huiles, Batteries"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantité / Volume</label>
                  <input
                    type="number"
                    value={eVal}
                    onChange={(e) => setEVal(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gain / Coût (TND)</label>
                  <input
                    type="number"
                    value={eCost}
                    onChange={(e) => setECost(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEnvModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md">Enregistrer Collecte</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
