import React, { useState } from "react";
import {
  FolderKanban,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Building2,
  ShieldAlert,
  Paperclip,
  ImageIcon,
  ChevronRight,
  Sparkles,
  PieChart as PieChartIcon,
  Trash2,
  Edit,
  Download,
  Filter,
  BarChart3,
  Calculator,
  ArrowUpRight,
  X
} from "lucide-react";
import {
  Project,
  ProjectTask,
  ProjectBudgetItem,
  ProjectRisk,
  ProjectDoc,
  ProjectPriority,
  ProjectStatus
} from "../types";

interface ProjectsManagerProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  isReadOnly?: boolean;
  currentUserRole: string;
}

export default function ProjectsManager({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  isReadOnly = false,
  currentUserRole
}: ProjectsManagerProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projects[0]?.id || "";
  });
  const [activeTab, setActiveTab] = useState<"general" | "planning" | "budget" | "documents" | "risks" | "kpi">("general");

  // Modal states for Creation
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
  const [showNewRiskModal, setShowNewRiskModal] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);

  // Modal states for Editing
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editingBudgetItem, setEditingBudgetItem] = useState<ProjectBudgetItem | null>(null);
  const [editingRisk, setEditingRisk] = useState<ProjectRisk | null>(null);

  // New Project Form State
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pManager, setPManager] = useState("M. Ahmed Amine");
  const [pDept, setPDept] = useState("Atelier & Infrastructures");
  const [pPriority, setPPriority] = useState<ProjectPriority>("Moyenne");
  const [pStatus, setPStatus] = useState<ProjectStatus>("En cours");
  const [pStartDate, setPStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [pEndDate, setPEndDate] = useState("2026-12-31");
  const [pBudgetPlanned, setPBudgetPlanned] = useState<number>(25000);

  // Edit Project State
  const [editP, setEditP] = useState<Project | null>(null);

  // New Supplier state for editing
  const [newSupplierInput, setNewSupplierInput] = useState("");

  // New Task Form State
  const [tName, setTName] = useState("");
  const [tManager, setTManager] = useState("");
  const [tStart, setTStart] = useState(new Date().toISOString().split("T")[0]);
  const [tEnd, setTEnd] = useState("");
  const [tPriority, setTPriority] = useState<ProjectPriority>("Moyenne");

  // New Budget Item Form State
  const [bTitle, setBTitle] = useState("");
  const [bType, setBType] = useState<"Devis" | "Commande" | "Dépense" | "CAPEX" | "OPEX">("Dépense");
  const [bSupplier, setBSupplier] = useState("");
  const [bAmount, setBAmount] = useState<number>(1000);

  // New Risk Form State
  const [rRisk, setRRisk] = useState("");
  const [rProb, setRProb] = useState<"Faible" | "Moyenne" | "Élevée">("Moyenne");
  const [rImpact, setRImpact] = useState<"Faible" | "Moyen" | "Fort" | "Critique">("Fort");
  const [rAction, setRAction] = useState("");
  const [rOwner, setROwner] = useState("");

  // New Document Form State
  const [dName, setDName] = useState("");
  const [dType, setDType] = useState<"Cahier des charges" | "Plan" | "Photo" | "Compte rendu" | "PV de réception">("Cahier des charges");

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Global Helper Stats
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter((p) => p.status === "En cours").length;
  const totalBudgetPlannedSum = projects.reduce((acc, p) => acc + p.budgetPlanned, 0);
  const totalBudgetRealSum = projects.reduce((acc, p) => acc + p.budgetReal, 0);
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progressPercent, 0) / projects.length) : 0;

  // --- Handlers: Project General ---
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const newPrj: Project = {
      id: `PRJ-2026-${String(projects.length + 1).padStart(2, "0")}`,
      name: pName.trim(),
      description: pDesc.trim(),
      manager: pManager.trim(),
      department: pDept.trim(),
      priority: pPriority,
      status: pStatus,
      startDate: pStartDate,
      endDate: pEndDate,
      budgetPlanned: pBudgetPlanned,
      budgetReal: 0,
      progressPercent: 0,
      documents: [],
      photos: [],
      suppliers: [],
      tasks: [],
      budgetItems: [],
      risks: []
    };

    onAddProject(newPrj);
    setSelectedProjectId(newPrj.id);
    setShowNewProjectModal(false);
    setPName("");
    setPDesc("");
  };

  const openEditProjectModal = () => {
    if (!currentProject) return;
    setEditP({ ...currentProject });
    setShowEditProjectModal(true);
  };

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editP) return;
    onUpdateProject(editP);
    setShowEditProjectModal(false);
    setEditP(null);
  };

  const handleAddSupplier = () => {
    if (!currentProject || !newSupplierInput.trim()) return;
    const updatedSuppliers = [...(currentProject.suppliers || []), newSupplierInput.trim()];
    onUpdateProject({ ...currentProject, suppliers: updatedSuppliers });
    setNewSupplierInput("");
  };

  const handleRemoveSupplier = (supName: string) => {
    if (!currentProject) return;
    const updatedSuppliers = (currentProject.suppliers || []).filter((s) => s !== supName);
    onUpdateProject({ ...currentProject, suppliers: updatedSuppliers });
  };

  // --- Handlers: Tasks ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !tName.trim()) return;

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      projectId: currentProject.id,
      name: tName.trim(),
      manager: tManager.trim() || currentProject.manager,
      startDate: tStart,
      endDate: tEnd || tStart,
      durationDays: 10,
      dependencies: [],
      priority: tPriority,
      status: "À faire",
      progressPercent: 0
    };

    const updatedTasks = [...(currentProject.tasks || []), newTask];
    onUpdateProject({ ...currentProject, tasks: updatedTasks });
    setShowNewTaskModal(false);
    setTName("");
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !editingTask) return;

    const updatedTasks = (currentProject.tasks || []).map((t) => (t.id === editingTask.id ? editingTask : t));
    
    // Auto calculate project overall progress average
    const avgProg = updatedTasks.length > 0 
      ? Math.round(updatedTasks.reduce((acc, t) => acc + (t.progressPercent || 0), 0) / updatedTasks.length)
      : currentProject.progressPercent;

    onUpdateProject({
      ...currentProject,
      tasks: updatedTasks,
      progressPercent: avgProg
    });
    setEditingTask(null);
  };

  const handleQuickUpdateTask = (taskId: string, fields: Partial<ProjectTask>) => {
    if (!currentProject) return;
    const updatedTasks = (currentProject.tasks || []).map((t) => {
      if (t.id === taskId) {
        const updated = { ...t, ...fields };
        if (fields.status === "Terminé" && fields.progressPercent === undefined) {
          updated.progressPercent = 100;
        }
        return updated;
      }
      return t;
    });

    const avgProg = updatedTasks.length > 0 
      ? Math.round(updatedTasks.reduce((acc, t) => acc + (t.progressPercent || 0), 0) / updatedTasks.length)
      : currentProject.progressPercent;

    onUpdateProject({
      ...currentProject,
      tasks: updatedTasks,
      progressPercent: avgProg
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentProject) return;
    const updatedTasks = (currentProject.tasks || []).filter((t) => t.id !== taskId);
    onUpdateProject({ ...currentProject, tasks: updatedTasks });
  };

  // --- Handlers: Budget Items ---
  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !bTitle.trim()) return;

    const newBgt: ProjectBudgetItem = {
      id: `bgt-${Date.now()}`,
      projectId: currentProject.id,
      type: bType,
      title: bTitle.trim(),
      supplier: bSupplier.trim() || "Fournisseur Officiel",
      amount: bAmount,
      date: new Date().toISOString().split("T")[0],
      status: "Validé"
    };

    const updatedBudgetItems = [...(currentProject.budgetItems || []), newBgt];
    const newRealBudget = updatedBudgetItems
      .filter((b) => b.type === "Dépense" || b.type === "CAPEX" || b.type === "OPEX")
      .reduce((acc, b) => acc + b.amount, 0);

    onUpdateProject({
      ...currentProject,
      budgetItems: updatedBudgetItems,
      budgetReal: newRealBudget
    });

    setShowNewBudgetModal(false);
    setBTitle("");
  };

  const handleSaveEditBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !editingBudgetItem) return;

    const updatedBudgetItems = (currentProject.budgetItems || []).map((b) =>
      b.id === editingBudgetItem.id ? editingBudgetItem : b
    );
    const newRealBudget = updatedBudgetItems
      .filter((b) => b.type === "Dépense" || b.type === "CAPEX" || b.type === "OPEX")
      .reduce((acc, b) => acc + b.amount, 0);

    onUpdateProject({
      ...currentProject,
      budgetItems: updatedBudgetItems,
      budgetReal: newRealBudget
    });
    setEditingBudgetItem(null);
  };

  const handleDeleteBudgetItem = (itemId: string) => {
    if (!currentProject) return;
    const updatedBudgetItems = (currentProject.budgetItems || []).filter((b) => b.id !== itemId);
    const newRealBudget = updatedBudgetItems
      .filter((b) => b.type === "Dépense" || b.type === "CAPEX" || b.type === "OPEX")
      .reduce((acc, b) => acc + b.amount, 0);

    onUpdateProject({
      ...currentProject,
      budgetItems: updatedBudgetItems,
      budgetReal: newRealBudget
    });
  };

  // --- Handlers: Risks ---
  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !rRisk.trim()) return;

    let priority: "Basse" | "Modérée" | "Haute" | "Critique" = "Modérée";
    if (rImpact === "Critique" || rProb === "Élevée") priority = "Haute";
    if (rImpact === "Critique" && rProb === "Élevée") priority = "Critique";

    const newRisk: ProjectRisk = {
      id: `risk-${Date.now()}`,
      projectId: currentProject.id,
      risk: rRisk.trim(),
      probability: rProb,
      impact: rImpact,
      priority,
      preventiveAction: rAction.trim(),
      responsible: rOwner.trim() || currentProject.manager,
      state: "Identifié"
    };

    const updatedRisks = [...(currentProject.risks || []), newRisk];
    onUpdateProject({ ...currentProject, risks: updatedRisks });
    setShowNewRiskModal(false);
    setRRisk("");
  };

  const handleSaveEditRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !editingRisk) return;

    const updatedRisks = (currentProject.risks || []).map((r) =>
      r.id === editingRisk.id ? editingRisk : r
    );
    onUpdateProject({ ...currentProject, risks: updatedRisks });
    setEditingRisk(null);
  };

  const handleDeleteRisk = (riskId: string) => {
    if (!currentProject) return;
    const updatedRisks = (currentProject.risks || []).filter((r) => r.id !== riskId);
    onUpdateProject({ ...currentProject, risks: updatedRisks });
  };

  // --- Handlers: Documents ---
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !dName.trim()) return;

    const newDoc: ProjectDoc = {
      id: `doc-${Date.now()}`,
      projectId: currentProject.id,
      name: dName.trim(),
      type: dType,
      uploadDate: new Date().toISOString().split("T")[0],
      author: currentUserRole,
      fileSize: "1.5 MB"
    };

    const updatedDocs = [...(currentProject.documents || []), newDoc];
    onUpdateProject({ ...currentProject, documents: updatedDocs });
    setShowNewDocModal(false);
    setDName("");
  };

  const handleDeleteDocument = (docId: string) => {
    if (!currentProject) return;
    const updatedDocs = (currentProject.documents || []).filter((d) => d.id !== docId);
    onUpdateProject({ ...currentProject, documents: updatedDocs });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Overview Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-chery-red text-xs font-bold uppercase tracking-wider mb-1">
            <FolderKanban className="h-4 w-4" />
            <span>Pilotage d'Investissements & Projets Stratégiques</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Module Gestion de Projets SAV & Modernisation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des chantiers d'amélioration, planning Gantt, maîtrise budgétaire (CAPEX/OPEX), matrice des risques & documents contractuels.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            {currentProject && (
              <button
                onClick={openEditProjectModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border border-slate-300"
              >
                <Edit className="h-4 w-4 text-slate-600" />
                <span>Modifier le Projet</span>
              </button>
            )}
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="bg-chery-red hover:bg-chery-dark text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-red-500/10 shrink-0 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Projet</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Stat Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-red-50 text-chery-red rounded-xl shrink-0">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Projets En Cours</span>
            <span className="text-xl font-black text-slate-900">
              {activeProjectsCount} <span className="text-xs font-normal text-slate-400">/ {totalProjectsCount}</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Budget Global Prévu</span>
            <span className="text-xl font-black text-slate-900">{totalBudgetPlannedSum.toLocaleString()} <span className="text-xs text-emerald-600 font-bold">TND</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Avancement Moyen</span>
            <span className="text-xl font-black text-slate-900">{avgProgress}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Risques Identifiés</span>
            <span className="text-xl font-black text-slate-900">
              {projects.reduce((acc, p) => acc + (p.risks?.length || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Project Selector Strip */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">Projet Sélectionné :</span>
        {projects.map((p) => {
          const isSelected = p.id === currentProject?.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${p.status === "En cours" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span>{p.name}</span>
              <span className="opacity-60 font-mono text-[10px]">({p.progressPercent}%)</span>
            </button>
          );
        })}
      </div>

      {/* Project Workspace Tabs & Main Section */}
      {currentProject ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Sub Navigation Bar */}
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 pt-3 flex items-center gap-2 overflow-x-auto">
            {[
              { id: "general", label: "Informations Générales", icon: FolderKanban },
              { id: "planning", label: "Planning (Gantt)", icon: Calendar, badge: currentProject.tasks?.length },
              { id: "budget", label: "Budget & Achats", icon: DollarSign, badge: currentProject.budgetItems?.length },
              { id: "documents", label: "Documents", icon: FileText, badge: currentProject.documents?.length },
              { id: "risks", label: "Risques", icon: AlertTriangle, badge: currentProject.risks?.length },
              { id: "kpi", label: "KPI & Analyse", icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "border-chery-red text-chery-red bg-white rounded-t-xl"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-red-100 text-chery-red" : "bg-slate-200 text-slate-600"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: INFORMATIONS GÉNÉRALES */}
          {activeTab === "general" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Core Details */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        currentProject.priority === "Urgent" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        Priorité {currentProject.priority}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        {currentProject.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono ml-auto">Code: {currentProject.id}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-black text-slate-900 leading-snug">{currentProject.name}</h2>
                      {!isReadOnly && (
                        <button
                          onClick={openEditProjectModal}
                          className="text-xs font-bold text-chery-red hover:underline flex items-center gap-1 shrink-0"
                        >
                          <Edit className="h-3.5 w-3.5" /> Éditer
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{currentProject.description}</p>
                  </div>

                  {/* Progress Meter Bar */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">Avancement Global du Projet</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          disabled={isReadOnly}
                          value={currentProject.progressPercent}
                          onChange={(e) => onUpdateProject({ ...currentProject, progressPercent: Number(e.target.value) })}
                          className="w-24 accent-chery-red cursor-pointer"
                        />
                        <span className="text-chery-red font-mono text-sm font-bold">{currentProject.progressPercent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-chery-red h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentProject.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block font-semibold mb-1">Chef de Projet</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-chery-red" />
                        {currentProject.manager}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block font-semibold mb-1">Département</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-chery-red" />
                        {currentProject.department}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block font-semibold mb-1">Dates d'exécution</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-chery-red" />
                        {currentProject.startDate} ➔ {currentProject.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Suppliers Involved */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fournisseurs & Prestataires Associés</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {currentProject.suppliers && currentProject.suppliers.length > 0 ? (
                        currentProject.suppliers.map((sup, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                            🏢 {sup}
                            {!isReadOnly && (
                              <button onClick={() => handleRemoveSupplier(sup)} className="text-slate-400 hover:text-red-600">
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Aucun fournisseur associé.</span>
                      )}

                      {!isReadOnly && (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Nouveau prest..."
                            value={newSupplierInput}
                            onChange={(e) => setNewSupplierInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddSupplier()}
                            className="text-xs border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-chery-red"
                          />
                          <button
                            type="button"
                            onClick={handleAddSupplier}
                            className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Budget Summary */}
                <div className="space-y-4 bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cadrage Financier</span>
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Budget Prévu (CAPEX/OPEX)</span>
                      <p className="text-2xl font-black text-emerald-400 font-mono">{currentProject.budgetPlanned.toLocaleString()} TND</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Engagé / Dépensé Réel</span>
                      <p className="text-2xl font-black text-amber-400 font-mono">{currentProject.budgetReal.toLocaleString()} TND</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400">Consommation Budgétaire</span>
                        <span className="text-white">
                          {Math.round((currentProject.budgetReal / (currentProject.budgetPlanned || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.round((currentProject.budgetReal / (currentProject.budgetPlanned || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="space-y-2 mt-4">
                      <button
                        onClick={openEditProjectModal}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Modifier les Informations</span>
                      </button>
                      <button
                        onClick={() => onDeleteProject(currentProject.id)}
                        className="w-full bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/80 p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer le Projet</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANNING (GANTT INTERACTIF) */}
          {activeTab === "planning" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Planning des Tâches & Diagramme de Gantt</h3>
                  <p className="text-xs text-slate-500">Ordonnancement chronologique et avancement direct de chaque tâche.</p>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une Tâche</span>
                  </button>
                )}
              </div>

              {/* Interactive Visual Gantt Timeline */}
              <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-slate-50/50 p-4 space-y-3">
                <div className="min-w-[800px] space-y-2">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 pb-2">
                    <span className="col-span-3">Tâche & Responsable</span>
                    <span className="col-span-2">Durée & Dates</span>
                    <span className="col-span-4 text-center">Avancement Visuel</span>
                    <span className="col-span-2 text-center">Statut</span>
                    <span className="col-span-1 text-right">Actions</span>
                  </div>

                  {currentProject.tasks && currentProject.tasks.length > 0 ? (
                    currentProject.tasks.map((task, idx) => {
                      return (
                        <div key={task.id || idx} className="grid grid-cols-12 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs gap-2">
                          <div className="col-span-3 min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{task.name}</span>
                            <span className="text-[10px] text-slate-500">👤 {task.manager}</span>
                          </div>

                          <div className="col-span-2 font-mono text-[11px] text-slate-600">
                            {task.durationDays}j ({task.startDate})
                          </div>

                          <div className="col-span-4 flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              disabled={isReadOnly}
                              value={task.progressPercent || 0}
                              onChange={(e) => handleQuickUpdateTask(task.id, { progressPercent: Number(e.target.value) })}
                              className="w-24 accent-chery-red cursor-pointer"
                            />
                            <div className="flex-1 bg-slate-100 h-3 rounded-full relative overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  task.status === "Terminé" ? "bg-emerald-500" : task.status === "En cours" ? "bg-chery-red" : "bg-slate-300"
                                }`}
                                style={{ width: `${task.progressPercent || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold font-mono text-slate-700 w-8 text-right">
                              {task.progressPercent || 0}%
                            </span>
                          </div>

                          <div className="col-span-2 text-center">
                            <select
                              disabled={isReadOnly}
                              value={task.status}
                              onChange={(e) => handleQuickUpdateTask(task.id, { status: e.target.value as any })}
                              className="text-[10px] font-bold border border-slate-200 rounded-lg p-1 bg-slate-50 outline-none"
                            >
                              <option value="À faire">À faire</option>
                              <option value="En cours">En cours</option>
                              <option value="Terminé">Terminé</option>
                              <option value="Bloqué">Bloqué</option>
                            </select>
                          </div>

                          <div className="col-span-1 flex items-center justify-end gap-1">
                            {!isReadOnly && (
                              <>
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                                  title="Éditer la tâche"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                  title="Supprimer la tâche"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Aucune tâche enregistrée. Cliquez sur "Ajouter une Tâche" pour construire le planning Gantt.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUDGET & ACHATS */}
          {activeTab === "budget" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Suivi Budgétaire, Devis & CAPEX</h3>
                  <p className="text-xs text-slate-500">Historique des devis, dépenses engagées et statut des factures.</p>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => setShowNewBudgetModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nouveau Poste Budgétaire</span>
                  </button>
                )}
              </div>

              {/* Budget Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Type</th>
                      <th className="p-3">Désignation</th>
                      <th className="p-3">Fournisseur</th>
                      <th className="p-3">Montant (TND)</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentProject.budgetItems && currentProject.budgetItems.length > 0 ? (
                      currentProject.budgetItems.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-700">{b.type}</td>
                          <td className="p-3 font-semibold text-slate-900">{b.title}</td>
                          <td className="p-3 text-slate-600">🏢 {b.supplier}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{b.amount.toLocaleString()} TND</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === "Payé" || b.status === "Validé" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {!isReadOnly && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingBudgetItem(b)}
                                  className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBudgetItem(b.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                          Aucun devis ou dépense saisi pour ce projet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Documents, Cahier des charges & PV</h3>
                  <p className="text-xs text-slate-500">Stockage centralisé des pièces jointes et plans techniques.</p>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => setShowNewDocModal(true)}
                    className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter un Document</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProject.documents && currentProject.documents.length > 0 ? (
                  currentProject.documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-chery-red shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-500 block">{doc.type} • {doc.uploadDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                          {doc.fileSize || "1 MB"}
                        </span>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
                    Aucun document lié pour l'instant.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: RISQUES */}
          {activeTab === "risks" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Registre & Matrice des Risques</h3>
                  <p className="text-xs text-slate-500">Identification des aléas de chantier et plan d'actions préventives.</p>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => setShowNewRiskModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Signaler un Risque</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Risque</th>
                      <th className="p-3">Probabilité</th>
                      <th className="p-3">Impact</th>
                      <th className="p-3">Priorité</th>
                      <th className="p-3">Action Préventive</th>
                      <th className="p-3">Responsable</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentProject.risks && currentProject.risks.length > 0 ? (
                      currentProject.risks.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900">{r.risk}</td>
                          <td className="p-3 text-slate-700">{r.probability}</td>
                          <td className="p-3 text-slate-700">{r.impact}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.priority === "Critique" || r.priority === "Haute" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {r.priority}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{r.preventiveAction}</td>
                          <td className="p-3 font-semibold text-slate-800">👤 {r.responsible}</td>
                          <td className="p-3 text-right">
                            {!isReadOnly && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingRisk(r)}
                                  className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRisk(r.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                          Aucun risque renseigné.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: KPI & ANALYSE */}
          {activeTab === "kpi" && (
            <div className="p-6 space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Synthèse des Indicateurs Clés de Performance (KPI)</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Avancement Tâches</span>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    {currentProject.tasks?.filter((t) => t.status === "Terminé").length || 0} / {currentProject.tasks?.length || 0}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dépassement Budgétaire</span>
                  <p className={`text-2xl font-black font-mono ${currentProject.budgetReal > currentProject.budgetPlanned ? "text-red-600" : "text-emerald-600"}`}>
                    {currentProject.budgetReal > currentProject.budgetPlanned
                      ? `+${currentProject.budgetReal - currentProject.budgetPlanned} TND`
                      : "Sous Contrôle"}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Niveau de Risque Global</span>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    {currentProject.risks?.length || 0} Alertes
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          Aucun projet créé pour l'instant. Cliquez sur "Nouveau Projet" pour démarrer.
        </div>
      )}

      {/* MODAL: CREATE PROJECT */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Création d'un Nouveau Projet</h3>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du Projet</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="ex: Extension de l'Atelier Diagnostic Chery"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-chery-red"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Objectif</label>
                <textarea
                  rows={2}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Description du périmètre..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-chery-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chef de Projet</label>
                  <input
                    type="text"
                    value={pManager}
                    onChange={(e) => setPManager(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget Prévu (TND)</label>
                  <input
                    type="number"
                    value={pBudgetPlanned}
                    onChange={(e) => setPBudgetPlanned(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Créer le Projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROJECT */}
      {showEditProjectModal && editP && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier le Projet ({editP.id})</h3>
            <form onSubmit={handleSaveEditProject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du Projet</label>
                <input
                  type="text"
                  required
                  value={editP.name}
                  onChange={(e) => setEditP({ ...editP, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editP.description}
                  onChange={(e) => setEditP({ ...editP, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chef de Projet</label>
                  <input
                    type="text"
                    value={editP.manager}
                    onChange={(e) => setEditP({ ...editP, manager: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Département</label>
                  <input
                    type="text"
                    value={editP.department}
                    onChange={(e) => setEditP({ ...editP, department: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priorité</label>
                  <select
                    value={editP.priority}
                    onChange={(e) => setEditP({ ...editP, priority: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={editP.status}
                    onChange={(e) => setEditP({ ...editP, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="En attente">En attente</option>
                    <option value="En cours">En cours</option>
                    <option value="En pause">En pause</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date Début</label>
                  <input
                    type="date"
                    value={editP.startDate}
                    onChange={(e) => setEditP({ ...editP, startDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date Fin</label>
                  <input
                    type="date"
                    value={editP.endDate}
                    onChange={(e) => setEditP({ ...editP, endDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget Prévu (TND)</label>
                  <input
                    type="number"
                    value={editP.budgetPlanned}
                    onChange={(e) => setEditP({ ...editP, budgetPlanned: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Avancement (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editP.progressPercent}
                    onChange={(e) => setEditP({ ...editP, progressPercent: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProjectModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TASK */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Ajouter une Tâche au Planning</h3>
            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé de la Tâche</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="ex: Pose des chemins de câbles"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsable</label>
                  <input
                    type="text"
                    value={tManager}
                    onChange={(e) => setTManager(e.target.value)}
                    placeholder="Responsable"
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priorité</label>
                  <select
                    value={tPriority}
                    onChange={(e) => setTPriority(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Ajouter la Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TASK */}
      {editingTask && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier la Tâche</h3>
            <form onSubmit={handleSaveEditTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé</label>
                <input
                  type="text"
                  required
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsable</label>
                  <input
                    type="text"
                    value={editingTask.manager}
                    onChange={(e) => setEditingTask({ ...editingTask, manager: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="À faire">À faire</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Bloqué">Bloqué</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Avancement (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingTask.progressPercent || 0}
                    onChange={(e) => setEditingTask({ ...editingTask, progressPercent: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durée (Jours)</label>
                  <input
                    type="number"
                    value={editingTask.durationDays}
                    onChange={(e) => setEditingTask({ ...editingTask, durationDays: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE BUDGET */}
      {showNewBudgetModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Nouveau Poste Budgétaire</h3>
            <form onSubmit={handleAddBudgetItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre du Devis / Dépense</label>
                <input
                  type="text"
                  required
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  placeholder="ex: Acompte Fournisseur Outillage"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={bType}
                    onChange={(e) => setBType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Devis">Devis</option>
                    <option value="Commande">Commande</option>
                    <option value="Dépense">Dépense</option>
                    <option value="CAPEX">CAPEX</option>
                    <option value="OPEX">OPEX</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant (TND)</label>
                  <input
                    type="number"
                    required
                    value={bAmount}
                    onChange={(e) => setBAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fournisseur</label>
                <input
                  type="text"
                  value={bSupplier}
                  onChange={(e) => setBSupplier(e.target.value)}
                  placeholder="Nom du sous-traitant"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBudgetModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Ajouter Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BUDGET ITEM */}
      {editingBudgetItem && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier Poste Budgétaire</h3>
            <form onSubmit={handleSaveEditBudgetItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé</label>
                <input
                  type="text"
                  required
                  value={editingBudgetItem.title}
                  onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fournisseur</label>
                  <input
                    type="text"
                    value={editingBudgetItem.supplier}
                    onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, supplier: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant (TND)</label>
                  <input
                    type="number"
                    value={editingBudgetItem.amount}
                    onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Statut</label>
                <select
                  value={editingBudgetItem.status}
                  onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                >
                  <option value="Demandé">Demandé</option>
                  <option value="Validé">Validé</option>
                  <option value="Payé">Payé</option>
                  <option value="Rejeté">Rejeté</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBudgetItem(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RISK */}
      {showNewRiskModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Signaler un Risque Projet</h3>
            <form onSubmit={handleAddRisk} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description du Risque</label>
                <input
                  type="text"
                  required
                  value={rRisk}
                  onChange={(e) => setRRisk(e.target.value)}
                  placeholder="ex: Retard livraison transformateur"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Probabilité</label>
                  <select
                    value={rProb}
                    onChange={(e) => setRProb(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Impact</label>
                  <select
                    value={rImpact}
                    onChange={(e) => setRImpact(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Fort">Fort</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Action Préventive</label>
                <textarea
                  rows={2}
                  value={rAction}
                  onChange={(e) => setRAction(e.target.value)}
                  placeholder="Mesure d'atténuation..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRiskModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RISK */}
      {editingRisk && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Modifier la Fiche de Risque</h3>
            <form onSubmit={handleSaveEditRisk} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Risque</label>
                <input
                  type="text"
                  required
                  value={editingRisk.risk}
                  onChange={(e) => setEditingRisk({ ...editingRisk, risk: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Probabilité</label>
                  <select
                    value={editingRisk.probability}
                    onChange={(e) => setEditingRisk({ ...editingRisk, probability: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Impact</label>
                  <select
                    value={editingRisk.impact}
                    onChange={(e) => setEditingRisk({ ...editingRisk, impact: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Fort">Fort</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Action Préventive</label>
                <textarea
                  rows={2}
                  value={editingRisk.preventiveAction}
                  onChange={(e) => setEditingRisk({ ...editingRisk, preventiveAction: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRisk(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE DOCUMENT */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">Attacher un Document</h3>
            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du Document</label>
                <input
                  type="text"
                  required
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="ex: Cahier des charges électricité"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Type de Fichier</label>
                <select
                  value={dType}
                  onChange={(e) => setDType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                >
                  <option value="Cahier des charges">Cahier des charges</option>
                  <option value="Plan">Plan Technique</option>
                  <option value="Photo">Photo Chantier</option>
                  <option value="Compte rendu">Compte rendu</option>
                  <option value="PV de réception">PV de réception</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDocModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Ajouter Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
