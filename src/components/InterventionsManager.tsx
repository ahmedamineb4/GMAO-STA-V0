/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Wrench,
  CheckCircle,
  Clock,
  User,
  AlertTriangle,
  Coins,
  ArrowRight,
  Sparkles,
  Layers,
  X,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  ClipboardList,
  PenTool,
  Image as ImageIcon,
  CheckSquare,
  Square,
  FileCheck,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Lock,
  ThumbsUp,
  Download,
  ZoomIn
} from "lucide-react";
import { Equipment, Intervention, InterventionStatus, InterventionType, SparePart, PartUsed } from "../types";
import { generateInterventionReportPDF } from "../utils/pdfGenerator";
import ImageLightboxModal from "./ImageLightboxModal";

interface InterventionsManagerProps {
  interventions: Intervention[];
  equipments: Equipment[];
  spareParts: SparePart[];
  onAddIntervention: (newInt: Intervention) => void;
  onUpdateInterventionStatus: (id: string, status: InterventionStatus) => void;
  onUpdateIntervention?: (updatedInt: Intervention) => void;
  initialType?: string;
  initialStatus?: string;
  showCalendarByDefault?: boolean;
  isReadOnly?: boolean;
  allowedWorkshop?: string;
}

export default function InterventionsManager({
  interventions,
  equipments,
  spareParts,
  onAddIntervention,
  onUpdateInterventionStatus,
  onUpdateIntervention,
  initialType = "All",
  initialStatus = "All",
  showCalendarByDefault = false,
  isReadOnly = false,
  allowedWorkshop
}: InterventionsManagerProps) {
  // Navigation tabs inside Interventions Manager
  const [viewMode, setViewMode] = useState<"list" | "calendar">(showCalendarByDefault ? "calendar" : "list");

  // Sync viewMode from props
  useEffect(() => {
    setViewMode(showCalendarByDefault ? "calendar" : "list");
  }, [showCalendarByDefault]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedPriority, setSelectedPriority] = useState<string>("All");

  // Detail drawer / inspector state
  const [selectedIntId, setSelectedIntId] = useState<string | null>(null);

  // Sync initial filters
  useEffect(() => {
    if (initialType) setSelectedType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (initialStatus) setSelectedStatus(initialStatus);
  }, [initialStatus]);

  // Calendar Year/Month (Defaults to July 2026 - Simulated current date)
  const [calYear, setCalYear] = useState<number>(2026);
  const [calMonth, setCalMonth] = useState<number>(6); // 6 is July (0-indexed)
  const [selectedCalDate, setSelectedCalDate] = useState<string>("2026-07-01");

  const MONTHS_FR = useMemo(() => ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"], []);
  const DAYS_OF_WEEK = useMemo(() => ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], []);

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    let day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Align Monday as first day of week
  };

  // Toast Notifications state (Simulated)
  const [toastNotification, setToastNotification] = useState<{ id: string; text: string; type: "info" | "success" | "warning" } | null>(null);

  // 🖼️ Lightbox Modal state for full-screen photo zoom
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    title?: string;
  } | null>(null);

  const showToast = (text: string, type: "info" | "success" | "warning" = "info") => {
    setToastNotification({ id: String(Date.now()), text, type });
  };

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [selectedEqCode, setSelectedEqCode] = useState("");
  const [newType, setNewType] = useState<InterventionType>("Correctif");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("2026-07-21");
  const [newDuration, setNewDuration] = useState<number>(2.5);
  const [newCostLabor, setNewCostLabor] = useState<number>(150);
  const [newTechnician, setNewTechnician] = useState("");
  const [newStatus, setNewStatus] = useState<InterventionStatus>("Planifiée");
  const [newNotes, setNewNotes] = useState("");
  const [newExecutorType, setNewExecutorType] = useState<"Interne" | "Externe">("Interne");
  const [newExternalProvider, setNewExternalProvider] = useState("");
  const [newPriority, setNewPriority] = useState<"Faible" | "Moyenne" | "Haute" | "Critique">("Moyenne");

  // Spare parts select list for form
  const [formPartsUsed, setFormPartsUsed] = useState<PartUsed[]>([]);
  const [selectedPartToAdd, setSelectedPartToAdd] = useState("");
  const [partQtyToAdd, setPartQtyToAdd] = useState<number>(1);

  // Inspection sub-sheet checklist & signature controls
  const [activeChecklist, setActiveChecklist] = useState<Record<string, boolean>>({});
  const [signatureName, setSignatureName] = useState("");
  const [realMinutesValue, setRealMinutesValue] = useState<number>(120);
  const [inspectedPhotos, setInspectedPhotos] = useState<string[]>([]);

  // Default technical checklists depending on type
  const DEFAULT_CHECKLISTS = {
    Correctif: [
      "Consigner l'équipement électriquement & pneumatiquement",
      "Diagnostiquer la source de défaillance / code d'erreur",
      "Remplacer les composants défectueux par des pièces certifiées",
      "Effectuer des tests de pression ou de rotation manuelle",
      "Tester les organes de sécurité et d'arrêt d'urgence",
      "Nettoyer la zone et enlever les consignations"
    ],
    Préventif: [
      "Contrôler le niveau de fluide hydraulique / lubrifiant",
      "Vérifier le serrage mécanique des fixations et ancrages",
      "Nettoyer ou remplacer les filtres à air comprimé",
      "Mesurer la tension électrique de l'alimentation phase-neutre",
      "S'assurer du bon fonctionnement des capteurs de fin de course",
      "Renseigner la fiche d'intervention"
    ],
    Réglementaire: [
      "Vérifier la validité du certificat de conformité",
      "Inspecter visuellement l'état des câbles et poulies de levage",
      "Tester la redondance des systèmes de blocage antichute",
      "Faire un essai en charge nominale maximale",
      "Vérifier la signalétique de danger et capacité de charge",
      "Enregistrer les observations pour le rapport officiel Apave"
    ]
  };

  // Filtered interventions
  const filteredInterventions = useMemo(() => {
    return interventions.filter((int) => {
      const matchesSearch =
        int.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.technician.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "All" || int.type === selectedType;
      const matchesStatus = selectedStatus === "All" || int.status === selectedStatus;
      
      const pLevel = int.priority || "Moyenne";
      const matchesPriority = selectedPriority === "All" || pLevel === selectedPriority;

      const targetEq = equipments.find((e) => e.code === int.equipmentCode);
      const matchesWorkshop = !allowedWorkshop || (targetEq && targetEq.workshop === allowedWorkshop);

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesWorkshop;
    });
  }, [interventions, searchQuery, selectedType, selectedStatus, selectedPriority, allowedWorkshop, equipments]);

  const selectedIntervention = useMemo(() => {
    return interventions.find((i) => i.id === selectedIntId) || null;
  }, [interventions, selectedIntId]);

  // Load checklist, photos, and real duration when selectedIntervention changes
  useEffect(() => {
    if (selectedIntervention) {
      // Setup checklist
      const initial: Record<string, boolean> = {};
      const items = selectedIntervention.checklist || (DEFAULT_CHECKLISTS[selectedIntervention.type as keyof typeof DEFAULT_CHECKLISTS] || DEFAULT_CHECKLISTS.Correctif).map(t => ({ task: t, done: false }));
      items.forEach((item) => {
        const taskName = typeof item === "string" ? item : (item as any).task;
        const isDone = typeof item === "string" 
          ? (selectedIntervention.status === "Terminée" || selectedIntervention.status === "Clôturée")
          : (item as any).done;
        initial[taskName] = isDone;
      });
      setActiveChecklist(initial);

      // Setup other details
      const sigName = typeof selectedIntervention.signature === "string" 
        ? selectedIntervention.signature 
        : selectedIntervention.signature?.name || "";
      setSignatureName(sigName);
      setRealMinutesValue(selectedIntervention.realDurationMinutes || (selectedIntervention.durationHours * 60));
      setInspectedPhotos(selectedIntervention.photos || []);
    }
  }, [selectedIntervention]);

  // Total Intervention Costs in historical view
  const aggregateCosts = useMemo(() => {
    let parts = 0;
    let labor = 0;
    filteredInterventions.forEach((int) => {
      parts += int.costParts;
      labor += int.costLabor;
    });
    return { parts, labor, total: parts + labor };
  }, [filteredInterventions]);

  // Handle adding a part to the list
  const handleAddPartToForm = () => {
    if (!selectedPartToAdd) return;
    const existingIndex = formPartsUsed.findIndex((p) => p.partCode === selectedPartToAdd);
    if (existingIndex > -1) {
      const updated = [...formPartsUsed];
      updated[existingIndex].quantity += Number(partQtyToAdd);
      setFormPartsUsed(updated);
    } else {
      setFormPartsUsed([...formPartsUsed, { partCode: selectedPartToAdd, quantity: Number(partQtyToAdd) }]);
    }
    // Reset inputs
    setSelectedPartToAdd("");
    setPartQtyToAdd(1);
  };

  const handleRemovePartFromForm = (partCode: string) => {
    setFormPartsUsed(formPartsUsed.filter((p) => p.partCode !== partCode));
  };

  // Auto-calculated parts cost based on formPartsUsed
  const calculatedPartsCost = useMemo(() => {
    return formPartsUsed.reduce((acc, pu) => {
      const part = spareParts.find((p) => p.code === pu.partCode);
      return acc + (part ? part.unitPrice * pu.quantity : 0);
    }, 0);
  }, [formPartsUsed, spareParts]);

  // Submit main form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqCode || !newTitle || !newTechnician) {
      alert("Veuillez renseigner l'Équipement, le Titre et le Technicien.");
      return;
    }

    const created: Intervention = {
      id: `INT-2026-${String(interventions.length + 1).padStart(3, "0")}`,
      equipmentCode: selectedEqCode,
      type: newType,
      title: newTitle,
      description: newDesc,
      dateIntervention: newDate,
      durationHours: Number(newDuration),
      costParts: 0,
      costLabor: Number(newCostLabor),
      technician: newTechnician,
      status: newStatus,
      partsUsed: [],
      notes: newNotes,
      executorType: newExecutorType,
      externalProvider: newExecutorType === "Externe" ? newExternalProvider : undefined,
      priority: newPriority,
      checklist: (DEFAULT_CHECKLISTS[newType as keyof typeof DEFAULT_CHECKLISTS] || DEFAULT_CHECKLISTS.Correctif).map(t => ({ task: t, done: false }))
    };

    onAddIntervention(created);
    setShowForm(false);
    
    showToast(`Bon de travail ${created.id} émis pour ${created.equipmentCode}.`, "success");

    // Reset Form
    setSelectedEqCode("");
    setNewTitle("");
    setNewDesc("");
    setNewTechnician("");
    setNewNotes("");
    setFormPartsUsed([]);
    setNewExecutorType("Interne");
    setNewExternalProvider("");
    setNewPriority("Moyenne");
  };

  // Change Status of Intervention
  const handleStatusTransition = (id: string, st: InterventionStatus) => {
    onUpdateInterventionStatus(id, st);
    showToast(`Bon d'intervention ${id} passé en état : ${st}`, "info");
  };

  // Save the full checklist, signature, and real minutes inside the details sheet
  const handleSaveInspectionReport = (isValidationAndClosure = false) => {
    if (!selectedIntervention || !onUpdateIntervention) return;

    // Build list of checklist items with their done status
    const formattedChecklist = Object.entries(activeChecklist).map(([task, done]) => ({
      task,
      done
    }));

    // Auto-fill signature name with assigned technician if blank for rapid closure
    const finalSigName = signatureName.trim() || selectedIntervention.technician || "Ahmed Amine";

    const updatedInt: Intervention = {
      ...selectedIntervention,
      status: isValidationAndClosure ? "Clôturée" : selectedIntervention.status,
      realDurationMinutes: realMinutesValue,
      signature: {
        name: finalSigName,
        date: new Date().toLocaleDateString("fr-FR"),
        dataUrl: undefined
      } as any,
      validationBy: isValidationAndClosure ? finalSigName : selectedIntervention.validationBy,
      photos: inspectedPhotos,
      checklist: formattedChecklist
    };

    onUpdateIntervention(updatedInt);
    showToast(
      isValidationAndClosure
        ? `Bon ${selectedIntervention.id} validé & clôturé réglementairement.`
        : "Fiche d'intervention enregistrée temporairement.",
      "success"
    );

    if (isValidationAndClosure) {
      setSelectedIntId(null);
    }
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string;
        setInspectedPhotos([url, ...inspectedPhotos]);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast simulated notifications center */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-neutral-900 text-white rounded-xl shadow-2xl flex items-center gap-3 max-w-sm border border-neutral-700/60 animate-bounce">
          <div className="h-2 w-2 rounded-full bg-chery-red animate-ping shrink-0" />
          <Bell className="h-4 w-4 text-chery-red shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">Notification GMAO</span>
            <p className="text-[11px] text-neutral-300 mt-0.5">{toastNotification.text}</p>
          </div>
          <button onClick={() => setToastNotification(null)} className="p-0.5 rounded-full hover:bg-neutral-800 text-neutral-400 cursor-pointer shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top statistics summary panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Total Bons de Travail</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {filteredInterventions.length} d'interventions
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Sur critères de filtre actuels
          </span>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Coût cumulé M.O.</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {(aggregateCosts.labor ?? 0).toLocaleString()} TND
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Temps de travail facturé
          </span>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Dépenses Pièces Détachées</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {(aggregateCosts.parts ?? 0).toLocaleString()} TND
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Consommation réelle du magasin
          </span>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Clôturées / En cours</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {interventions.filter((i) => i.status === "Clôturée").length} / {interventions.filter((i) => i.status === "En cours").length}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Taux de résolution global de la STA
          </span>
        </div>
      </div>

      {/* Filter and Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par Titre, Technicien, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50/50 focus:bg-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-2 bg-white outline-none font-medium cursor-pointer"
          >
            <option value="All">Tous les Types</option>
            <option value="Préventif">Préventif</option>
            <option value="Correctif">Correctif</option>
            <option value="Réglementaire">Réglementaire</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-2 bg-white outline-none font-medium cursor-pointer"
          >
            <option value="All">Tous les Statuts</option>
            <option value="Nouvelle">Nouvelle</option>
            <option value="Planifiée">Planifiée</option>
            <option value="En cours">En cours</option>
            <option value="En attente">En attente</option>
            <option value="Terminée">Terminée</option>
            <option value="Clôturée">Clôturée</option>
            <option value="Annulée">Annulée</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-2 bg-white outline-none font-medium cursor-pointer font-bold"
          >
            <option value="All">Toutes Priorités</option>
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
            <option value="Critique">Critique</option>
          </select>

          <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/50">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "list" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Liste</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "calendar" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Calendrier</span>
            </button>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau Bon
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Side Interventions List / Calendar + Right Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === "list" ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
              <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-neutral-700">Registre Historique des Interventions</h3>
                <span className="text-[10px] text-neutral-400">Cliquez sur une ligne pour l'inspecter et la signer</span>
              </div>

              <div className="overflow-x-auto">
                {filteredInterventions.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
                    <FileText className="h-10 w-10 text-neutral-300 mb-2" />
                    <p className="text-sm font-bold">Aucune intervention</p>
                    <p className="text-xs">Aucune fiche de maintenance ne correspond aux critères de filtres.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase bg-neutral-50/20 text-[10px]">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Équipement</th>
                        <th className="py-3 px-4">Désignation / Titre</th>
                        <th className="py-3 px-4">Prio.</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-center">Date</th>
                        <th className="py-3 px-4 text-right font-bold">Total (TND)</th>
                        <th className="py-3 px-4">Intervenant</th>
                        <th className="py-3 px-4 text-center">Statut</th>
                        <th className="py-3 px-4 text-center">PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 font-medium">
                      {filteredInterventions.map((int) => {
                        const eqName = equipments.find((e) => e.code === int.equipmentCode)?.name || "N/A";
                        const isSelected = selectedIntId === int.id;
                        const pLevel = int.priority || "Moyenne";

                        return (
                          <tr
                            key={int.id}
                            onClick={() => setSelectedIntId(int.id)}
                            className={`hover:bg-neutral-50/50 transition-all cursor-pointer ${
                              isSelected ? "bg-red-50/10 border-l-2 border-l-chery-red" : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-neutral-400">{int.id}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-neutral-700 block font-mono">{int.equipmentCode}</span>
                              <span className="text-[10px] text-neutral-400 truncate max-w-[150px] block">
                                {eqName}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <span className="font-bold text-neutral-800 block text-[13px]">{int.title}</span>
                              <span className="text-[10px] text-neutral-400 block mt-0.5 line-clamp-1">
                                {int.description}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                                  pLevel === "Critique"
                                    ? "bg-red-100 text-chery-red animate-pulse"
                                    : pLevel === "Haute"
                                    ? "bg-orange-50 text-orange-600"
                                    : pLevel === "Faible"
                                    ? "bg-neutral-100 text-neutral-500"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {pLevel}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                                  int.type === "Correctif"
                                    ? "bg-red-50 text-chery-red"
                                    : int.type === "Préventif"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-purple-50 text-purple-700"
                                }`}
                              >
                                {int.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-neutral-500">
                              {int.dateIntervention}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-neutral-800">
                              {((int.costParts || 0) + (int.costLabor || 0)).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-neutral-800 font-bold">
                                  <User className="h-3 w-3 text-neutral-400" />
                                  <span>{int.technician}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`text-[10px] font-bold py-1 px-2 rounded-full border ${
                                  int.status === "Clôturée"
                                    ? "bg-green-100 border-green-200 text-green-800"
                                    : int.status === "Terminée"
                                    ? "bg-teal-50 border-teal-200 text-teal-700"
                                    : int.status === "En cours"
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : int.status === "Planifiée" || int.status === "Planifié"
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : "bg-neutral-50 border-neutral-200 text-neutral-400"
                                }`}
                              >
                                {int.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  const associatedEquipment = equipments.find((eq) => eq.code === int.equipmentCode) || {
                                    code: int.equipmentCode,
                                    name: "Équipement Non Référencé",
                                    workshop: "Atelier Diagnostic",
                                    status: "Opérationnel",
                                    purchaseDate: "2026-01-01",
                                    warrantyEnd: "2028-12-31",
                                    purchasePrice: 15000,
                                    location: "Ligne A",
                                    serialNumber: "SN-999-TEMP",
                                    critical: false,
                                    mtbfTargetHours: 250,
                                    mttrTargetHours: 4
                                  };
                                  generateInterventionReportPDF(int, associatedEquipment as any);
                                }}
                                title="Télécharger le bon en PDF"
                                className="p-1 hover:bg-red-50 text-neutral-400 hover:text-chery-red rounded transition-colors cursor-pointer inline-flex items-center justify-center"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            /* Calendar Grid view */
            <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-chery-red" />
                  <h3 className="text-sm font-bold text-neutral-800">
                    Planification Mensuelle : {MONTHS_FR[calMonth]} {calYear}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear((y) => y - 1);
                      } else {
                        setCalMonth((m) => m - 1);
                      }
                    }}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalYear(2026);
                      setCalMonth(6);
                      setSelectedCalDate("2026-07-21");
                    }}
                    className="text-[10px] font-bold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer"
                  >
                    Aujourd'hui
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear((y) => y + 1);
                      } else {
                        setCalMonth((m) => m + 1);
                      }
                    }}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day grids */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="py-1 font-bold text-neutral-400 uppercase text-[10px]">
                    {day}
                  </div>
                ))}

                {(() => {
                  const totalDays = getDaysInMonth(calYear, calMonth);
                  const firstDayIdx = getFirstDayOfMonth(calYear, calMonth);
                  const blanks = Array(firstDayIdx).fill(null);
                  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
                  const cells = [...blanks, ...days];

                  return cells.map((cell, idx) => {
                    if (cell === null) return <div key={`blank-${idx}`} className="bg-neutral-50/20 rounded-lg h-20" />;

                    const dayNum = cell;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const dayInts = filteredInterventions.filter((i) => i.dateIntervention === dateStr);
                    const isSelected = selectedCalDate === dateStr;
                    const isToday = dateStr === "2026-07-21";

                    return (
                      <div
                        key={`day-${dayNum}`}
                        onClick={() => {
                          setSelectedCalDate(dateStr);
                          if (dayInts.length > 0) {
                            setSelectedIntId(dayInts[0].id);
                          }
                        }}
                        className={`h-20 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden select-none ${
                          isSelected
                            ? "border-chery-red bg-red-50/10 shadow-xs"
                            : isToday
                            ? "border-neutral-800 bg-neutral-50 font-bold"
                            : "border-neutral-100 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[11px] font-mono ${isToday ? "text-neutral-900 font-extrabold" : "text-neutral-500 font-semibold"}`}>
                            {dayNum}
                          </span>
                          {isToday && <span className="h-1.5 w-1.5 rounded-full bg-chery-red block" />}
                        </div>

                        <div className="space-y-0.5 max-h-[48px] overflow-hidden">
                          {dayInts.slice(0, 2).map((int) => (
                            <div
                              key={int.id}
                              className={`text-[8px] px-1 py-0.5 rounded-xs font-bold truncate leading-tight ${
                                int.type === "Préventif"
                                  ? "bg-blue-100 text-blue-800"
                                  : int.type === "Correctif"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                              title={`${int.id}: ${int.title}`}
                            >
                              {int.type === "Préventif" ? "PRV" : int.type === "Correctif" ? "COR" : "REG"}: {int.title}
                            </div>
                          ))}
                          {dayInts.length > 2 && (
                            <div className="text-[7px] font-extrabold text-neutral-400 text-center uppercase">
                              + {dayInts.length - 2} travaux
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High Fidelity Intervention & Signature Inspector Sheet */}
        <div className="lg:col-span-1">
          {selectedIntervention ? (
            <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm space-y-4 sticky top-6">
              {/* Header block */}
              <div className="flex justify-between items-start pb-3 border-b border-neutral-100">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                    <span>{selectedIntervention.id}</span>
                    <span>•</span>
                    <span className="font-bold text-neutral-600 uppercase bg-neutral-100 px-1 rounded">{selectedIntervention.type}</span>
                  </div>
                  <h3 className="text-base font-black text-neutral-800 mt-1 leading-tight">
                    {selectedIntervention.title}
                  </h3>
                  <span className="text-xs text-neutral-400 font-semibold block mt-1 font-mono">
                    Équipement: {selectedIntervention.equipmentCode}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIntId(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 shrink-0 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* PDF Download Button */}
              <button
                onClick={() => {
                  const associatedEquipment = equipments.find((eq) => eq.code === selectedIntervention.equipmentCode) || {
                    code: selectedIntervention.equipmentCode,
                    name: "Équipement Non Référencé",
                    workshop: "Atelier Diagnostic",
                    status: "Opérationnel",
                    purchaseDate: "2026-01-01",
                    warrantyEnd: "2028-12-31",
                    purchasePrice: 15000,
                    location: "Ligne A",
                    serialNumber: "SN-999-TEMP",
                    critical: false,
                    mtbfTargetHours: 250,
                    mttrTargetHours: 4
                  };
                  generateInterventionReportPDF(selectedIntervention, associatedEquipment as any);
                }}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs cursor-pointer transition-all border border-neutral-800"
              >
                <Download className="h-4 w-4 text-chery-red" />
                Télécharger le Rapport PDF
              </button>

              {/* Live Status Control inside details */}
              <div className="space-y-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Flux de Statut Actuel</span>
                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                  {["Nouvelle", "Planifiée", "En cours", "En attente", "Terminée", "Clôturée"].map((st) => {
                    const isActive = selectedIntervention.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusTransition(selectedIntervention.id, st as any)}
                        disabled={isReadOnly || selectedIntervention.status === "Clôturée"}
                        className={`py-1 px-1.5 rounded font-bold border text-center transition-all cursor-pointer ${
                          isActive
                            ? "bg-chery-red border-chery-red text-white"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description and Technician Specs */}
              <div className="text-xs space-y-2">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <span className="font-bold text-neutral-500 block">Symptômes & Consignes :</span>
                  <p className="text-neutral-600 mt-0.5 leading-relaxed text-[11px]">{selectedIntervention.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 border border-neutral-100 rounded-lg">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Technicien</span>
                    <span className="font-bold text-neutral-700 flex items-center gap-1 mt-0.5">
                      <User className="h-3 w-3 text-neutral-400" />
                      {selectedIntervention.technician}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Exécuteur</span>
                    <span className="font-bold text-neutral-700 uppercase block mt-0.5">
                      {selectedIntervention.executorType || "Interne"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Technical Checklist (Check-list optionnelle) */}
              <div className="space-y-2.5 bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100">
                <div className="flex justify-between items-center border-b border-neutral-200/50 pb-1.5">
                  <h4 className="font-bold text-neutral-700 flex items-center gap-1.5 text-xs">
                    <ClipboardList className="h-4 w-4 text-chery-red" />
                    Check-list Technique de Contrôle
                  </h4>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Optionnel</span>
                </div>
                
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {Object.keys(activeChecklist).map((item) => {
                    const checked = activeChecklist[item];
                    return (
                      <div
                        key={item}
                        onClick={() => {
                          if (selectedIntervention.status === "Clôturée") return;
                          setActiveChecklist({ ...activeChecklist, [item]: !checked });
                        }}
                        className={`flex items-start gap-2.5 text-xs cursor-pointer select-none py-1 px-1 rounded hover:bg-white transition-colors ${
                          checked ? "text-neutral-800" : "text-neutral-400"
                        }`}
                      >
                        {checked ? (
                          <CheckSquare className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 text-neutral-300 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-snug text-[11px]">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real duration settings & photos upload */}
              <div className="space-y-2 border border-neutral-100 p-3 rounded-lg text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-500">Durée Réelle (Minutes)</span>
                  <input
                    type="number"
                    value={realMinutesValue}
                    disabled={selectedIntervention.status === "Clôturée"}
                    onChange={(e) => setRealMinutesValue(Number(e.target.value))}
                    className="w-16 border border-neutral-200 rounded p-1 text-center font-mono font-bold"
                  />
                </div>

                {/* Photo attachment board */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-500 text-[11px]">Photos Après Travaux ({inspectedPhotos.length})</span>
                    {selectedIntervention.status !== "Clôturée" && (
                      <label className="text-[9px] font-black text-chery-red bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
                        Ajouter
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
                      </label>
                    )}
                  </div>
                  
                  {inspectedPhotos.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {inspectedPhotos.map((ph, i) => (
                        <div
                          key={i}
                          onClick={() => setLightboxState({
                            isOpen: true,
                            images: inspectedPhotos,
                            initialIndex: i,
                            title: `Intervention ${selectedIntervention.id} - Photo ${i + 1}`
                          })}
                          className="relative group h-11 w-16 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-900 cursor-pointer shadow-2xs hover:border-chery-red transition-all"
                          title="Cliquer pour agrandir et zoomer la photo"
                        >
                          <img
                            src={ph}
                            alt="Preuve"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="h-3.5 w-3.5 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Digital validation & Approval (Signature block) */}
              <div className="space-y-2 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5 text-xs">
                  <PenTool className="h-3.5 w-3.5 text-green-600" />
                  Signer et Clôturer le Bon de Travail
                </span>
                
                {selectedIntervention.status === "Clôturée" ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center gap-1 font-bold text-green-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>BON CLÔTURÉ & SIGNÉ</span>
                    </div>
                    <p className="text-[10px] text-green-700 font-mono italic">
                      Approuvé par: <strong>{selectedIntervention.validationBy || "Ahmed Amine"}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={`Valideur (par défaut : ${selectedIntervention.technician || "Ahmed Amine"})`}
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-chery-red"
                    />
                    
                    {/* Mock Signature Line */}
                    <div className="h-12 bg-white border border-dashed border-neutral-300 rounded flex items-center justify-center text-neutral-400 italic text-[10px] relative overflow-hidden select-none">
                      {signatureName ? (
                        <span className="font-cursive text-neutral-700 text-sm font-black rotate-[-3deg] uppercase tracking-widest block select-none">
                          {signatureName}
                        </span>
                      ) : (
                        <span className="text-neutral-500 font-semibold">
                          ✍️ Signature par défaut : <strong className="text-neutral-700">{selectedIntervention.technician || "Ahmed Amine"}</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-normal italic">
                      💡 La check-list est désormais facultative. Laissez le champ vide pour valider au nom du technicien et clôturer en un seul clic !
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveInspectionReport(false)}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold py-1.5 rounded text-xs cursor-pointer transition-colors"
                      >
                        Sauvegarder Brouillon
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveInspectionReport(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 rounded text-xs cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        Valider & Clôturer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-400 flex flex-col items-center justify-center h-full min-h-[350px]">
              <ClipboardList className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm font-bold">Aucune intervention inspectée</p>
              <p className="text-xs max-w-[200px] mt-1 leading-relaxed">
                Sélectionnez n'importe quelle intervention à gauche pour afficher sa check-list, ses pièces consommées, et procéder à la signature électronique de clôture.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Work Order Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-chery-red" />
                Émettre un Bon d'Intervention / de Travail
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Row 1: Asset selection & type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Cible Équipement *</label>
                  <select
                    required
                    value={selectedEqCode}
                    onChange={(e) => setSelectedEqCode(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="">Sélectionner l'Équipement</option>
                    {equipments.map((eq) => (
                      <option key={eq.code} value={eq.code}>
                        [{eq.code}] {eq.name} ({eq.workshop})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Type d'Intervention</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as InterventionType)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="Correctif">Correctif (Panne)</option>
                    <option value="Préventif">Préventif (Planifié)</option>
                    <option value="Réglementaire">Réglementaire (Sécurité)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Title */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold text-neutral-600 mb-1">Désignation du Problème / Titre *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Remplacement électrovanne ou Réglage capteur"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Niveau de Priorité *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none font-bold"
                  >
                    <option value="Faible">Faible (Niveau 3)</option>
                    <option value="Moyenne">Moyenne (Niveau 2)</option>
                    <option value="Haute">Haute (Crucial)</option>
                    <option value="Critique">Critique (Bloquant)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Description détaillée des symptômes / travaux</label>
                <textarea
                  rows={2}
                  placeholder="Expliquez ici ce qui nécessite réparation ou la méthode préventive appliquée"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none"
                />
              </div>

              {/* Row 4: Dates & Duration */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date d'Intervention</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Durée Prévue (Heures)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Main d'Œuvre (TND)</label>
                  <input
                    type="number"
                    value={newCostLabor}
                    onChange={(e) => setNewCostLabor(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
              </div>

              {/* Row 4.5: Executor Type */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Type d'Intervenant *</label>
                  <select
                    value={newExecutorType}
                    onChange={(e) => setNewExecutorType(e.target.value as "Interne" | "Externe")}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none font-semibold text-neutral-800"
                  >
                    <option value="Interne">Nos techniciens (Interne STA)</option>
                    <option value="Externe">Prestataire (Externe)</option>
                  </select>
                </div>

                {newExecutorType === "Externe" ? (
                  <div>
                    <label className="block font-bold text-neutral-600 mb-1">Société Prestataire *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Weinmann, ABAC, Sotradies..."
                      value={newExternalProvider}
                      onChange={(e) => setNewExternalProvider(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none font-medium focus:ring-1 focus:ring-chery-red"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[11px] text-neutral-500 pt-5 pl-2">
                    💡 Exécuté par les équipes internes de la STA Chery.
                  </div>
                )}
              </div>

              {/* Row 5: Technician & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">
                    {newExecutorType === "Externe" ? "Technicien du Prestataire *" : "Technicien Interne Assigné *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ridha Ben Abdallah ou Agent Technique"
                    value={newTechnician}
                    onChange={(e) => setNewTechnician(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Statut initial du Bon</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as InterventionStatus)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="Nouvelle">Nouvelle</option>
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Rapport de diagnostic initial</label>
                <input
                  type="text"
                  placeholder="Notes de diagnostic ou observations de réparation initiales"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
                >
                  Valider et Enregistrer le Bon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ High-Res Image Lightbox Modal */}
      {lightboxState && (
        <ImageLightboxModal
          isOpen={lightboxState.isOpen}
          onClose={() => setLightboxState(null)}
          images={lightboxState.images}
          initialIndex={lightboxState.initialIndex}
          title={lightboxState.title}
        />
      )}
    </div>
  );
}
