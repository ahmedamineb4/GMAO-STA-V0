/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Clock,
  Info,
  Sliders,
  DollarSign,
  ChevronRight,
  X,
  FileText,
  Copy,
  Edit,
  Trash2,
  RefreshCw,
  QrCode,
  Download,
  Printer,
  Calendar,
  User,
  ExternalLink,
  Tag,
  Paperclip,
  Image as ImageIcon,
  Camera,
  Eye,
  ZoomIn,
  Link,
  TrendingUp,
  Award,
  FileSpreadsheet,
  Upload,
  Check
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Equipment, EquipmentStatus, Workshop, Intervention, SparePart, Vendor } from "../types";
import { WORKSHOPS } from "../data";
import { generateEquipmentBreakdownPDF } from "../utils/pdfGenerator";
import { generateEquipmentImportTemplate, parseEquipmentExcelFile } from "../utils/excelGenerator";

interface EquipmentsManagerProps {
  equipments: Equipment[];
  interventions: Intervention[];
  spareParts?: SparePart[];
  vendors?: Vendor[];
  onAddEquipment: (newEq: Equipment) => void;
  onUpdateStatus: (code: string, status: EquipmentStatus) => void;
  onUpdateEquipment: (updatedEq: Equipment) => void;
  onDeleteEquipment: (code: string) => void;
  onAddIntervention?: (newInt: Intervention) => void;
  initialWorkshop?: string;
  isReadOnly?: boolean;
  allowedWorkshop?: string;
  onResetDemoData?: () => void;
}

export default function EquipmentsManager({
  equipments,
  interventions,
  spareParts = [],
  vendors = [],
  onAddEquipment,
  onUpdateStatus,
  onUpdateEquipment,
  onDeleteEquipment,
  onAddIntervention,
  initialWorkshop = "All",
  isReadOnly = false,
  allowedWorkshop,
  onResetDemoData
}: EquipmentsManagerProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>(initialWorkshop);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedCriticiteFilter, setSelectedCriticiteFilter] = useState<string>("All");
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Sync initialWorkshop selection when prop changes
  useEffect(() => {
    if (allowedWorkshop) {
      setSelectedWorkshop(allowedWorkshop);
    } else if (initialWorkshop) {
      setSelectedWorkshop(initialWorkshop);
    }
  }, [initialWorkshop, allowedWorkshop]);

  // Sync URL query param ?eq=CODE to select the equipment automatically (useful when scanning real QR codes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eqCode = params.get("eq");
    if (eqCode) {
      const exists = equipments.some((e) => e.code.toUpperCase() === eqCode.toUpperCase());
      if (exists) {
        setSelectedEqCode(eqCode.toUpperCase());
        setDetailTab("details");
      }
    }
  }, [equipments]);

  // Detail drawer state
  const [selectedEqCode, setSelectedEqCode] = useState<string | null>(null);
  
  // QR Code Printable/Save modal state
  const [qrModalEq, setQrModalEq] = useState<Equipment | null>(null);
  
  // Selected detail sub-tab
  const [detailTab, setDetailTab] = useState<"details" | "history" | "docs" | "maintenance" | "photos" | "costs">("details");

  // Add/Edit Equipment Form modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Deletion confirmation modal state
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);

  // Sub-modals for direct actions from the panel
  const [showDeclarePanneModal, setShowDeclarePanneModal] = useState(false);
  const [showPlanMaintenanceModal, setShowPlanMaintenanceModal] = useState(false);

  // Batch Excel/CSV Equipment Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedImportEquipments, setParsedImportEquipments] = useState<Equipment[]>([]);
  const [isParsingImport, setIsParsingImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // New Equipment state form values
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newWorkshop, setNewWorkshop] = useState<Workshop>("Service Rapide");
  const [newStatus, setNewStatus] = useState<EquipmentStatus>("Opérationnel");
  const [newPurchaseDate, setNewPurchaseDate] = useState("2025-01-01");
  const [newWarrantyEnd, setNewWarrantyEnd] = useState("2027-01-01");
  const [newPrice, setNewPrice] = useState<number>(12000);
  const [newLocation, setNewLocation] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newCritical, setNewCritical] = useState(false);
  const [newInterval, setNewInterval] = useState<number>(6);
  const [newMtbf, setNewMtbf] = useState<number>(1200);
  const [newMttr, setNewMttr] = useState<number>(4);
  const [newCriticite, setNewCriticite] = useState<"A - Critique" | "B - Moyen" | "C - Faible">("B - Moyen");
  const [newWarrantyDetails, setNewWarrantyDetails] = useState("");
  const [newVendorId, setNewVendorId] = useState("");
  const [newResponsableName, setNewResponsableName] = useState("");

  // Sub-modal creation form values (Declare Panne / Plan Maintenance)
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickTech, setQuickTech] = useState("");
  const [quickPriority, setQuickPriority] = useState<"Faible" | "Moyenne" | "Haute" | "Critique">("Moyenne");
  const [quickDuration, setQuickDuration] = useState(2);
  const [quickLaborCost, setQuickLaborCost] = useState(120);

  // Associated Document Form State inside sheet
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"Procédure" | "Instruction" | "Manuel" | "Plan" | "Réglementaire">("Procédure");
  const [newDocVersion, setNewDocVersion] = useState("V1.0");

  // Simulated photos store & management
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [showUrlPhotoInput, setShowUrlPhotoInput] = useState(false);
  const [urlPhotoInput, setUrlPhotoInput] = useState("");
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  const [equipmentPhotos, setEquipmentPhotos] = useState<Record<string, string[]>>({
    "EQ-SR-05": [
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&auto=format&fit=crop"
    ],
    "EQ-SR-04": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&auto=format&fit=crop"
    ]
  });

  // Filtered Equipments List
  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      const matchesSearch =
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (eq.responsableName && eq.responsableName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesWorkshop = selectedWorkshop === "All" || eq.workshop === selectedWorkshop;
      const matchesStatus = selectedStatus === "All" || eq.status === selectedStatus;
      
      const actualCriticite = eq.criticite || (eq.critical ? "A - Critique" : "B - Moyen");
      const matchesCriticite = selectedCriticiteFilter === "All" || actualCriticite === selectedCriticiteFilter;
      const matchesCritical = !onlyCritical || eq.critical || actualCriticite === "A - Critique";

      return matchesSearch && matchesWorkshop && matchesStatus && matchesCriticite && matchesCritical;
    });
  }, [equipments, searchQuery, selectedWorkshop, selectedStatus, selectedCriticiteFilter, onlyCritical]);

  const selectedEquipment = useMemo(() => {
    return equipments.find((eq) => eq.code === selectedEqCode) || null;
  }, [equipments, selectedEqCode]);

  const selectedEqInterventions = useMemo(() => {
    if (!selectedEqCode) return [];
    return interventions.filter((int) => int.equipmentCode === selectedEqCode);
  }, [interventions, selectedEqCode]);

  // Compute total costs for the active equipment
  const selectedEqCosts = useMemo(() => {
    return selectedEqInterventions.reduce(
      (acc, int) => {
        acc.parts += int.costParts || 0;
        acc.labor += int.costLabor || 0;
        acc.total += (int.costParts || 0) + (int.costLabor || 0);
        return acc;
      },
      { parts: 0, labor: 0, total: 0 }
    );
  }, [selectedEqInterventions]);

  // Handle Editing Equipment
  const handleEditClick = (eq: Equipment) => {
    setEditingEquipment(eq);
    setNewCode(eq.code);
    setNewName(eq.name);
    setNewWorkshop(eq.workshop);
    setNewStatus(eq.status);
    setNewPurchaseDate(eq.purchaseDate);
    setNewWarrantyEnd(eq.warrantyEnd);
    setNewPrice(eq.purchasePrice);
    setNewLocation(eq.location);
    setNewSerial(eq.serialNumber);
    setNewCritical(eq.critical);
    setNewInterval(eq.inspectionIntervalMonths || 6);
    setNewMtbf(eq.mtbfTargetHours || 1200);
    setNewMttr(eq.mttrTargetHours || 4);
    setNewCriticite(eq.criticite || (eq.critical ? "A - Critique" : "B - Moyen"));
    setNewWarrantyDetails(eq.warrantyDetails || "");
    setNewVendorId(eq.vendorId || "");
    setNewResponsableName(eq.responsableName || "");
    setShowAddForm(true);
  };

  const handleAddNewClick = () => {
    setEditingEquipment(null);
    setNewCode("");
    setNewName("");
    setNewWorkshop("Service Rapide");
    setNewStatus("Opérationnel");
    setNewPurchaseDate("2025-01-01");
    setNewWarrantyEnd("2027-01-01");
    setNewPrice(12000);
    setNewLocation("");
    setNewSerial("");
    setNewCritical(false);
    setNewInterval(6);
    setNewMtbf(1200);
    setNewMttr(4);
    setNewCriticite("B - Moyen");
    setNewWarrantyDetails("");
    setNewVendorId("");
    setNewResponsableName("");
    setShowAddForm(true);
  };

  // Submit equipment form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      alert("Veuillez renseigner le code et le nom de l'équipement.");
      return;
    }

    const eqData: Equipment = {
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      workshop: newWorkshop,
      status: newStatus,
      purchaseDate: newPurchaseDate,
      warrantyEnd: newWarrantyEnd,
      purchasePrice: Number(newPrice),
      location: newLocation.trim() || "Atelier STA",
      serialNumber: newSerial.trim() || "S/N-STATED",
      critical: newCritical || newCriticite === "A - Critique",
      inspectionIntervalMonths: Number(newInterval),
      mtbfTargetHours: Number(newMtbf),
      mttrTargetHours: Number(newMttr),
      criticite: newCriticite,
      warrantyDetails: newWarrantyDetails,
      vendorId: newVendorId,
      responsableName: newResponsableName || "M. Ahmed Amine"
    };

    if (editingEquipment) {
      onUpdateEquipment({
        ...editingEquipment,
        ...eqData,
        documents: editingEquipment.documents,
        photos: editingEquipment.photos
      });
    } else {
      // Check if code already exists
      const exists = equipments.some((eq) => eq.code === eqData.code);
      if (exists) {
        alert(`Le code d'équipement ${eqData.code} existe déjà.`);
        return;
      }
      onAddEquipment(eqData);
    }

    setShowAddForm(false);
    setSelectedEqCode(eqData.code);
  };

  const handleDuplicate = (eq: Equipment) => {
    const nextNum = equipments.filter((e) => e.name.startsWith(eq.name)).length + 1;
    const duplicated: Equipment = {
      ...eq,
      code: `${eq.code}-BIS-${nextNum}`,
      name: `${eq.name} (Copie ${nextNum})`,
      serialNumber: `${eq.serialNumber}-COPY`
    };
    onAddEquipment(duplicated);
    setSelectedEqCode(duplicated.code);
  };

  const handleDeleteClick = (code: string) => {
    setEquipmentToDelete(code);
  };

  const executeDelete = () => {
    if (equipmentToDelete) {
      onDeleteEquipment(equipmentToDelete);
      setSelectedEqCode(null);
      setEquipmentToDelete(null);
    }
  };

  // Document attachment inside technical sheet
  const handleAddAssociatedDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !newDocName) return;

    const currentDocs = selectedEquipment.documents || [];
    const newDoc = {
      name: newDocName,
      type: newDocType,
      dateAdded: new Date().toISOString().split("T")[0],
      version: newDocVersion,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
    };

    const updatedEq: Equipment = {
      ...selectedEquipment,
      documents: [newDoc, ...currentDocs]
    };

    onUpdateEquipment(updatedEq);
    setShowAddDocForm(false);
    setNewDocName("");
    setNewDocType("Procédure");
    setNewDocVersion("V1.0");
  };

  // Helper to get active photos list for selected equipment
  const getActivePhotos = (code: string): string[] => {
    if (equipmentPhotos[code]) return equipmentPhotos[code];
    const eq = equipments.find((e) => e.code === code);
    return eq?.photos || [];
  };

  const syncPhotoUpdate = (code: string, updatedPhotos: string[]) => {
    setEquipmentPhotos((prev) => ({ ...prev, [code]: updatedPhotos }));
    const eq = equipments.find((e) => e.code === code);
    if (eq) {
      onUpdateEquipment({ ...eq, photos: updatedPhotos });
    }
  };

  // Photo uploading / replacing
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, replaceIndex?: number | null) => {
    if (!selectedEqCode || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const photoUrl = event.target.result as string;
        const currentPhotos = [...getActivePhotos(selectedEqCode)];
        if (typeof replaceIndex === "number" && replaceIndex >= 0 && replaceIndex < currentPhotos.length) {
          currentPhotos[replaceIndex] = photoUrl;
        } else {
          currentPhotos.unshift(photoUrl);
        }
        syncPhotoUpdate(selectedEqCode, currentPhotos);
        setReplaceTargetIndex(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddPhotoUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqCode || !urlPhotoInput.trim()) return;
    const currentPhotos = [...getActivePhotos(selectedEqCode)];
    if (typeof replaceTargetIndex === "number" && replaceTargetIndex >= 0 && replaceTargetIndex < currentPhotos.length) {
      currentPhotos[replaceTargetIndex] = urlPhotoInput.trim();
    } else {
      currentPhotos.unshift(urlPhotoInput.trim());
    }
    syncPhotoUpdate(selectedEqCode, currentPhotos);
    setUrlPhotoInput("");
    setShowUrlPhotoInput(false);
    setReplaceTargetIndex(null);
  };

  const handleDeletePhoto = (index: number) => {
    if (!selectedEqCode) return;
    const currentPhotos = getActivePhotos(selectedEqCode);
    const updated = currentPhotos.filter((_, i) => i !== index);
    syncPhotoUpdate(selectedEqCode, updated);
  };

  // Create Corrective Intervention (Déclarer une panne)
  const handleDeclarePanneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !onAddIntervention || !quickTitle || !quickTech) return;

    const newInt: Intervention = {
      id: `INT-PANNE-${Date.now()}`,
      equipmentCode: selectedEquipment.code,
      type: "Correctif",
      title: quickTitle,
      description: quickDesc || "Panne signalée en urgence depuis la fiche équipement.",
      dateIntervention: new Date().toISOString().split("T")[0],
      durationHours: Number(quickDuration),
      costParts: 0,
      costLabor: Number(quickLaborCost),
      technician: quickTech,
      status: "Nouvelle",
      partsUsed: [],
      priority: quickPriority
    };

    // Update equipment status to En Panne
    onUpdateStatus(selectedEquipment.code, "En Panne");
    onAddIntervention(newInt);

    setShowDeclarePanneModal(false);
    setQuickTitle("");
    setQuickDesc("");
    setQuickTech("");
    setDetailTab("history");
    alert(`Panne déclarée avec succès pour l'équipement ${selectedEquipment.code}. Un ticket d'intervention Corrective a été créé.`);
  };

  // Create Preventive Maintenance (Planifier une maintenance)
  const handlePlanMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !onAddIntervention || !quickTitle || !quickTech) return;

    const newInt: Intervention = {
      id: `INT-PREV-${Date.now()}`,
      equipmentCode: selectedEquipment.code,
      type: "Préventif",
      title: quickTitle,
      description: quickDesc || "Maintenance préventive périodique.",
      dateIntervention: new Date().toISOString().split("T")[0],
      durationHours: Number(quickDuration),
      costParts: 0,
      costLabor: Number(quickLaborCost),
      technician: quickTech,
      status: "Planifiée",
      partsUsed: [],
      priority: quickPriority
    };

    onAddIntervention(newInt);

    setShowPlanMaintenanceModal(false);
    setQuickTitle("");
    setQuickDesc("");
    setQuickTech("");
    setDetailTab("history");
    alert(`Maintenance préventive planifiée pour l'équipement ${selectedEquipment.code}.`);
  };

  // Open the printable QR code label modal
  const handlePrintQR = (eqCode: string) => {
    const eq = equipments.find((e) => e.code === eqCode);
    if (eq) {
      setQrModalEq(eq);
    }
  };

  // Handle batch import file upload
  const handleFileImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsParsingImport(true);
    setImportError(null);

    try {
      const parsed = await parseEquipmentExcelFile(file);
      if (!parsed || parsed.length === 0) {
        setImportError("Aucun équipement valide n'a été trouvé dans ce fichier Excel/CSV.");
        setParsedImportEquipments([]);
      } else {
        setParsedImportEquipments(parsed);
      }
    } catch (err: any) {
      console.error(err);
      setImportError("Erreur lors de la lecture du fichier. Vérifiez le format (Excel .xlsx / .csv).");
      setParsedImportEquipments([]);
    } finally {
      setIsParsingImport(false);
    }
  };

  // Confirm and batch add equipment
  const handleConfirmBatchImport = () => {
    if (!parsedImportEquipments || parsedImportEquipments.length === 0) return;

    let countAdded = 0;
    parsedImportEquipments.forEach((eq) => {
      onAddEquipment(eq);
      countAdded++;
    });

    setShowImportModal(false);
    setImportFile(null);
    setParsedImportEquipments([]);
    setImportError(null);

    alert(`✅ Importation réussie ! ${countAdded} équipement(s) ont été intégrés avec succès au parc GMAO.`);
  };

  return (
    <div className="space-y-6">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-800 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-chery-red" />
            🏭 Gestion du Parc Équipements (GMAO)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Visualisez, inspectez, et gérez les ponts de levage, équilibreuses, stations diag et outillage de la STA Tunisie.
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generateEquipmentImportTemplate()}
              title="Télécharger le modèle officiel Excel (.xlsx) pré-rempli à compléter"
              className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2.5 px-3.5 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Modèle Excel</span>
            </button>

            <button
              onClick={() => {
                setShowImportModal(true);
                setImportFile(null);
                setParsedImportEquipments([]);
                setImportError(null);
              }}
              title="Importer une liste d'équipements depuis un fichier Excel ou CSV"
              className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold py-2.5 px-3.5 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4 text-blue-600" />
              <span>Importer Excel / CSV</span>
            </button>

            <button
              onClick={handleAddNewClick}
              className="flex items-center justify-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher par équipement, code, S/N ou responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-neutral-300"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="bg-white border border-neutral-200 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
          >
            <option value="All">Tous les Ateliers</option>
            {WORKSHOPS.map((ws) => (
              <option key={ws} value={ws}>{ws}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-neutral-200 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
          >
            <option value="All">Tous les États</option>
            <option value="Opérationnel">Opérationnel</option>
            <option value="Dégradé">Dégradé</option>
            <option value="En Maintenance">En Maintenance</option>
            <option value="En Panne">En Panne</option>
            <option value="Hors Service">Hors Service</option>
          </select>

          <select
            value={selectedCriticiteFilter}
            onChange={(e) => setSelectedCriticiteFilter(e.target.value)}
            className="bg-white border border-neutral-200 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
          >
            <option value="All">Toutes Criticités</option>
            <option value="A - Critique">A - Critique (Maximal)</option>
            <option value="B - Moyen">B - Moyen (Standard)</option>
            <option value="C - Faible">C - Faible</option>
          </select>

          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`flex items-center gap-1 px-3 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              onlyCritical
                ? "border-red-200 bg-red-50 text-chery-red"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Seulement critiques
          </button>
        </div>
      </div>

      {/* Main Split Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Equipments list (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Équipements du Parc ({filteredEquipments.length} sur {equipments.length})
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Cliquer pour inspecter la fiche</span>
            </div>

            {filteredEquipments.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
                <Sliders className="h-10 w-10 text-neutral-300 mb-2" />
                <p className="text-sm font-bold">Aucun équipement trouvé</p>
                <p className="text-xs mt-1 mb-4">Ajustez vos filtres de recherche.</p>
                {equipments.length === 0 && onResetDemoData && (
                  <button
                    onClick={onResetDemoData}
                    className="bg-chery-red hover:bg-chery-dark text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Restaurer le parc STA
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredEquipments.map((eq) => {
                  const criticalLevel = eq.criticite || (eq.critical ? "A - Critique" : "B - Moyen");
                  const hasWarranty = new Date(eq.warrantyEnd) > new Date("2026-07-01");

                  return (
                    <div
                      key={eq.code}
                      onClick={() => {
                        setSelectedEqCode(eq.code);
                        setDetailTab("details");
                      }}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors cursor-pointer ${
                        selectedEqCode === eq.code ? "bg-red-50/10 border-l-4 border-l-chery-red" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1.5 h-3.5 w-3.5 rounded-full shrink-0 ${
                            eq.status === "Opérationnel"
                              ? "bg-green-500"
                              : eq.status === "Dégradé"
                              ? "bg-amber-500"
                              : eq.status === "En Maintenance"
                              ? "bg-blue-500"
                              : eq.status === "Hors Service"
                              ? "bg-neutral-400"
                              : "bg-red-500 animate-pulse"
                          }`}
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-neutral-400 font-mono">
                              {eq.code}
                            </span>
                            <span className="text-neutral-300">|</span>
                            <span className="text-[10px] font-semibold text-neutral-500">
                              {eq.workshop}
                            </span>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                criticalLevel === "A - Critique"
                                  ? "bg-red-50 text-chery-red"
                                  : criticalLevel === "B - Moyen"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {criticalLevel}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-neutral-800 mt-1">{eq.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 mt-1">
                            <span>S/N: <strong>{eq.serialNumber}</strong></span>
                            <span>•</span>
                            <span>Resp: <strong>{eq.responsableName || "Ahmed Amine"}</strong></span>
                            <span>•</span>
                            <span>Loc: <strong>{eq.location}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-none pt-2 sm:pt-0 border-neutral-100 shrink-0">
                        <div className="text-left sm:text-right">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              eq.status === "Opérationnel"
                                ? "text-green-700 bg-green-50"
                                : eq.status === "Dégradé"
                                ? "text-amber-700 bg-amber-50"
                                : eq.status === "En Maintenance"
                                ? "text-blue-700 bg-blue-50"
                                : "text-red-700 bg-red-50"
                            }`}
                          >
                            {eq.status}
                          </span>
                          <span className="text-[9px] text-neutral-400 block mt-1 font-mono">
                            {hasWarranty ? "GARANTIE ACTIVE" : "HORS GARANTIE"}
                          </span>
                        </div>
                        {!isReadOnly && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEqCode(eq.code);
                                setDetailTab("photos");
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-blue-600 transition-all cursor-pointer relative group flex items-center gap-1"
                              title="Ajouter / Modifier / Supprimer les photos de cet équipement"
                            >
                              <Camera className="h-3.5 w-3.5 text-blue-500" />
                              {((equipmentPhotos[eq.code] && equipmentPhotos[eq.code].length > 0) || (eq.photos && eq.photos.length > 0)) && (
                                <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 rounded-full">
                                  {(equipmentPhotos[eq.code] || eq.photos || []).length}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(eq);
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-chery-red transition-all cursor-pointer"
                              title="Modifier la fiche équipement"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(eq);
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-chery-red transition-all cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(eq.code);
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-chery-red transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-neutral-300 hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Technical Inspection Panel */}
        <div className="lg:col-span-1">
          {selectedEquipment ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 space-y-4 sticky top-6">
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-neutral-100">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                    <span>{selectedEquipment.code}</span>
                    <span>•</span>
                    <span>{selectedEquipment.workshop}</span>
                  </div>
                  <h3 className="text-base font-black text-neutral-800 mt-1 leading-tight">
                    {selectedEquipment.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEqCode(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Instant Status Controller */}
              <div className="grid grid-cols-5 gap-1 border-b border-neutral-100 pb-3">
                {(["Opérationnel", "Dégradé", "En Maintenance", "En Panne", "Hors Service"] as EquipmentStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      disabled={isReadOnly}
                      onClick={() => onUpdateStatus(selectedEquipment.code, st)}
                      title={st}
                      className={`text-[9px] font-bold py-1 px-0.5 rounded border transition-all text-center leading-tight cursor-pointer ${
                        selectedEquipment.status === st
                          ? st === "Opérationnel"
                            ? "bg-green-500 border-green-500 text-white"
                            : st === "Dégradé"
                            ? "bg-amber-500 border-amber-500 text-white"
                            : st === "En Maintenance"
                            ? "bg-blue-500 border-blue-500 text-white"
                            : st === "Hors Service"
                            ? "bg-neutral-500 border-neutral-500 text-white"
                            : "bg-red-500 border-red-500 text-white"
                          : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      {st.split(" ")[0]}
                    </button>
                  )
                )}
              </div>

              {/* Interactive Tabs Menu */}
              <div className="flex border-b border-neutral-100 overflow-x-auto gap-1 py-1 no-scrollbar text-xs">
                {[
                  { id: "details", label: "Specs" },
                  { id: "history", label: "Historique" },
                  { id: "docs", label: "Docs" },
                  { id: "maintenance", label: "Prév." },
                  { id: "photos", label: "Photos" },
                  { id: "costs", label: "Coûts" }
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setDetailTab(tb.id as any)}
                    className={`pb-1 px-2 font-bold shrink-0 transition-colors border-b-2 cursor-pointer ${
                      detailTab === tb.id
                        ? "border-chery-red text-chery-red"
                        : "border-transparent text-neutral-400 hover:text-neutral-700"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* Tab View Container */}
              <div className="min-h-[220px] max-h-[380px] overflow-y-auto pr-1">
                {/* Tab 1: Details and QR Code */}
                {detailTab === "details" && (
                  <div className="space-y-4 text-xs animate-fade-in">
                    {/* Unique Code Identification Block */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Identification Unique</span>
                      <div className="flex items-center gap-3">
                        <div className="font-mono bg-neutral-800 text-white px-3 py-1.5 rounded-lg font-black text-sm tracking-wide shadow-xs">
                          {selectedEquipment.code}
                        </div>
                        <div>
                          <span className="text-[11px] font-black text-neutral-800 uppercase block">{selectedEquipment.name}</span>
                          <span className="text-[10px] text-neutral-500 font-medium">Affecté à l'Atelier : <strong>{selectedEquipment.workshop}</strong></span>
                        </div>
                      </div>
                      <p className="text-neutral-500 text-[10px] leading-snug pt-1">
                        Cet identifiant unique sert de référence pour toutes les interventions, rapports d'audits et signalements de panne pour cet équipement.
                      </p>
                    </div>

                    {/* Metadata specs */}
                    <div className="space-y-2 bg-neutral-50 p-4 rounded-xl">
                      <h4 className="font-bold text-neutral-700 border-b border-neutral-200 pb-1 flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-neutral-500" />
                        Caractéristiques Techniques
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">S/N de Série :</span>
                          <span className="font-bold text-neutral-700 font-mono text-[11px]">{selectedEquipment.serialNumber}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Localisation :</span>
                          <span className="font-bold text-neutral-700 text-[11px]">{selectedEquipment.location}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Date d'Achat :</span>
                          <span className="font-bold text-neutral-700 font-mono text-[11px]">{selectedEquipment.purchaseDate}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Prix d'Achat :</span>
                          <span className="font-bold text-neutral-700 font-mono text-[11px]">
                            {(selectedEquipment.purchasePrice ?? 0).toLocaleString()} TND
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Responsable :</span>
                          <span className="font-bold text-neutral-700 text-[11px] flex items-center gap-1">
                            <User className="h-3 w-3 text-neutral-400" />
                            {selectedEquipment.responsableName || "Ahmed Amine"}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Criticité :</span>
                          <span className="font-bold text-neutral-700 text-[11px]">
                            {selectedEquipment.criticite || (selectedEquipment.critical ? "A - Critique" : "B - Moyen")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Garantie information */}
                    <div className="space-y-2 border border-neutral-100 p-4 rounded-xl">
                      <h4 className="font-bold text-neutral-700 border-b border-neutral-100 pb-1 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-green-600" />
                        Garantie Constructeur
                      </h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Date Fin Garantie :</span>
                          <span className="font-bold font-mono text-[11px]">{selectedEquipment.warrantyEnd}</span>
                        </div>
                        <span
                          className={`font-black text-[9px] px-2 py-0.5 rounded font-mono ${
                            new Date(selectedEquipment.warrantyEnd) > new Date("2026-07-01")
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-chery-red"
                          }`}
                        >
                          {new Date(selectedEquipment.warrantyEnd) > new Date("2026-07-01") ? "ACTIVE" : "EXPIRÉE"}
                        </span>
                      </div>
                      {selectedEquipment.warrantyDetails && (
                        <p className="text-[10px] text-neutral-400 italic bg-neutral-50 p-2 rounded">
                          "{selectedEquipment.warrantyDetails}"
                        </p>
                      )}
                    </div>

                    {/* Vendor integration */}
                    {selectedEquipment.vendorId && (
                      <div className="space-y-2 border border-neutral-100 p-4 rounded-xl">
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Fournisseur Associé</span>
                        {vendors.find((v) => v.id === selectedEquipment.vendorId) ? (
                          (() => {
                            const v = vendors.find((v) => v.id === selectedEquipment.vendorId)!;
                            return (
                              <div className="text-xs">
                                <span className="font-bold text-neutral-800 text-[11px] block">{v.name}</span>
                                <span className="text-neutral-400 block mt-0.5">{v.contactPerson} • {v.phone}</span>
                                <span className="text-neutral-400 block">{v.email}</span>
                              </div>
                            );
                          })()
                        ) : (
                          <span className="text-neutral-600 font-bold">{selectedEquipment.vendorId}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Historical list */}
                {detailTab === "history" && (
                  <div className="space-y-2.5 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-500">Historique des travaux ({selectedEqInterventions.length})</span>
                      <span className="text-neutral-400 font-mono text-[10px]">Total cumulé: {(selectedEqCosts.total ?? 0).toLocaleString()} TND</span>
                    </div>

                    {selectedEqInterventions.length > 0 && (
                      <button
                        onClick={() => generateEquipmentBreakdownPDF(selectedEquipment, interventions)}
                        className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs cursor-pointer transition-all mb-1"
                      >
                        <Download className="h-3.5 w-3.5 text-chery-red" />
                        Télécharger l'Historique PDF
                      </button>
                    )}

                    {selectedEqInterventions.length === 0 ? (
                      <p className="text-xs text-neutral-400 text-center py-8 bg-neutral-50 rounded-xl italic">
                        Aucune intervention enregistrée sur cet équipement.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[300px]">
                        {selectedEqInterventions.map((int) => (
                          <div key={int.id} className="p-3 border border-neutral-100 rounded-xl text-xs bg-white shadow-xs">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-black text-neutral-800 text-[11px] truncate">{int.title}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase ${
                                  int.type === "Correctif"
                                    ? "bg-red-50 text-chery-red"
                                    : int.type === "Préventif"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-neutral-100 text-neutral-600"
                                }`}
                              >
                                {int.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">{int.description}</p>
                            <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2 border-t border-neutral-50 pt-1.5 font-mono">
                              <span>{int.dateIntervention}</span>
                              <span>Tech: <strong>{int.technician}</strong></span>
                              <span className="font-bold text-neutral-600 font-sans">{((int.costParts || 0) + (int.costLabor || 0)).toLocaleString()} TND</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Documentation list */}
                {detailTab === "docs" && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-neutral-500">Documents techniques liés</span>
                      <button
                        onClick={() => setShowAddDocForm(!showAddDocForm)}
                        className="text-[10px] font-bold text-chery-red bg-red-50 hover:bg-red-100 px-2 py-1 rounded cursor-pointer transition-colors"
                      >
                        {showAddDocForm ? "Fermer" : "Lier un document"}
                      </button>
                    </div>

                    {showAddDocForm && (
                      <form onSubmit={handleAddAssociatedDoc} className="p-3 border border-neutral-200 rounded-xl bg-neutral-50 space-y-2 text-xs">
                        <div>
                          <label className="font-bold text-neutral-600 block mb-0.5">Nom du document *</label>
                          <input
                            type="text"
                            required
                            placeholder="ex: Manuel calibrage.pdf"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            className="w-full border border-neutral-300 rounded bg-white p-1 text-xs outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-neutral-600 block mb-0.5">Type *</label>
                            <select
                              value={newDocType}
                              onChange={(e) => setNewDocType(e.target.value as any)}
                              className="w-full border border-neutral-300 rounded bg-white p-1 text-xs outline-none"
                            >
                              <option value="Procédure">Procédure</option>
                              <option value="Instruction">Instruction</option>
                              <option value="Manuel">Manuel</option>
                              <option value="Plan">Plan</option>
                              <option value="Réglementaire">Réglementaire</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-neutral-600 block mb-0.5">Version *</label>
                            <input
                              type="text"
                              required
                              placeholder="V1.0"
                              value={newDocVersion}
                              onChange={(e) => setNewDocVersion(e.target.value)}
                              className="w-full border border-neutral-300 rounded bg-white p-1 text-xs outline-none font-mono"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-chery-red hover:bg-chery-dark text-white font-bold py-1 px-2 rounded text-xs cursor-pointer transition-colors"
                        >
                          Lier ce document
                        </button>
                      </form>
                    )}

                    {(!selectedEquipment.documents || selectedEquipment.documents.length === 0) ? (
                      <p className="text-xs text-neutral-400 text-center py-8 bg-neutral-50 rounded-xl italic">
                        Aucun document de procédure lié. Cliquez sur "Lier un document" pour l'associer.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[250px]">
                        {selectedEquipment.documents.map((doc, idx) => (
                          <div key={idx} className="p-2.5 border border-neutral-100 rounded-xl bg-white flex items-center justify-between text-xs hover:bg-neutral-50">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-neutral-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-neutral-700 truncate block">{doc.name}</span>
                                <span className="text-[9px] text-neutral-400 block font-mono">
                                  {doc.type} • Version {doc.version} ({doc.dateAdded})
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const element = document.createElement("a");
                                const file = new Blob([`Fichier de simulation pour ${doc.name}`], {type: 'text/plain'});
                                element.href = URL.createObjectURL(file);
                                element.download = doc.name;
                                element.click();
                              }}
                              className="p-1 rounded bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-chery-red hover:bg-red-50 shrink-0 cursor-pointer"
                              title="Télécharger"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Planned maintenance & conformity */}
                {detailTab === "maintenance" && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Compliance alerts */}
                    <div className="space-y-2.5 bg-neutral-50 p-4 rounded-xl text-xs">
                      <h4 className="font-bold text-neutral-700 border-b border-neutral-200 pb-1.5 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        Périodicités Réglementaires (Apave)
                      </h4>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Intervalle d'Inspection :</span>
                        <span className="font-bold text-neutral-700 text-[11px]">Tous les {selectedEquipment.inspectionIntervalMonths || 6} mois</span>
                      </div>
                      {selectedEquipment.lastInspectionDate ? (
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Dernier Contrôle :</span>
                          <span className="font-bold font-mono text-[11px] text-neutral-700">{selectedEquipment.lastInspectionDate}</span>
                        </div>
                      ) : (
                        <div className="text-neutral-500 italic bg-white p-1.5 border border-dashed border-neutral-200 rounded text-[10px] text-center">
                          Aucun contrôle réglementaire enregistré.
                        </div>
                      )}
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-neutral-500 block">Travaux préventifs planifiés</span>
                      {selectedEqInterventions.filter((int) => int.type === "Préventif" && (int.status === "Planifiée" || int.status === "Planifié")).length === 0 ? (
                        <p className="text-xs text-neutral-400 text-center py-6 bg-neutral-50 rounded-xl italic">
                          Aucun préventif planifié à l'horizon.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedEqInterventions
                            .filter((int) => int.type === "Préventif" && (int.status === "Planifiée" || int.status === "Planifié"))
                            .map((int) => (
                              <div key={int.id} className="p-2 border border-neutral-100 rounded-xl text-xs bg-white">
                                <div className="flex justify-between items-center font-bold">
                                  <span>{int.title}</span>
                                  <span className="text-[10px] text-blue-600 font-mono bg-blue-50 px-1 rounded">{int.dateIntervention}</span>
                                </div>
                                <span className="text-[10px] text-neutral-400 block mt-0.5">Technicien assigné: {int.technician}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 5: Photos */}
                {detailTab === "photos" && (
                  <div className="space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                      <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                        <Camera className="h-4 w-4 text-blue-600" />
                        Photos de la Machine ({getActivePhotos(selectedEquipment.code).length})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUrlPhotoInput(!showUrlPhotoInput);
                            setReplaceTargetIndex(null);
                          }}
                          className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Link className="h-3 w-3" />
                          Lien Web
                        </button>
                        <label className="text-[10px] font-bold text-white bg-chery-red hover:bg-chery-dark px-2 py-1 rounded cursor-pointer transition-colors flex items-center gap-1 shadow-xs">
                          <Plus className="h-3 w-3" />
                          Uploader
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, null)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* URL Input Form */}
                    {showUrlPhotoInput && (
                      <form onSubmit={handleAddPhotoUrlSubmit} className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2 animate-fade-in">
                        <span className="text-[11px] font-bold text-blue-900 block">
                          {replaceTargetIndex !== null ? `Remplacer la photo #${replaceTargetIndex + 1}` : "Ajouter une photo par adresse URL"}
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlPhotoInput}
                            onChange={(e) => setUrlPhotoInput(e.target.value)}
                            placeholder="https://images.unsplash.com/... ou lien d'image"
                            className="flex-1 bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowUrlPhotoInput(false);
                              setReplaceTargetIndex(null);
                            }}
                            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-2 py-1 rounded-lg text-xs cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </form>
                    )}

                    {getActivePhotos(selectedEquipment.code).length === 0 ? (
                      <div className="bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-400 flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-neutral-300 mb-1.5" />
                        <span className="font-bold text-xs text-neutral-600">Aucune photo enregistrée</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">
                          Ajoutez des clichés réels de l'équipement dans l'atelier STA (plaque signalétique, câblage, état général).
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {getActivePhotos(selectedEquipment.code).map((photo, index) => (
                          <div key={index} className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-video shadow-xs">
                            <img
                              src={photo}
                              alt={`Équipement ${selectedEquipment.code} - Photo ${index + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                            />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-2">
                              {/* Zoom / Fullscreen */}
                              <button
                                type="button"
                                onClick={() => setPreviewPhotoUrl(photo)}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-all cursor-pointer shadow-md"
                                title="Agrandir la photo"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {/* Replace / Edit photo */}
                              <label
                                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-md"
                                title="Remplacer cette photo (Uploader)"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(e, index)}
                                />
                              </label>

                              {/* Delete photo */}
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(index)}
                                className="p-1.5 rounded-lg bg-chery-red text-white hover:bg-red-700 transition-all cursor-pointer shadow-md"
                                title="Supprimer la photo"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                              #{index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 6: Costs Recharts graphs */}
                {detailTab === "costs" && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    <div className="space-y-2 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                      <h4 className="font-bold text-neutral-700 flex items-center gap-1.5 border-b border-neutral-200 pb-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-chery-red" />
                        Analyse Financière Individuelle
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-white p-2 rounded-lg border border-neutral-100 shadow-2xs">
                          <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Pièces de Rechange</span>
                          <span className="text-xs font-black text-neutral-800 font-mono mt-0.5 inline-block">
                            {(selectedEqCosts.parts ?? 0).toLocaleString()} TND
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-neutral-100 shadow-2xs">
                          <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Main d'œuvre (Interne/Ext)</span>
                          <span className="text-xs font-black text-neutral-800 font-mono mt-0.5 inline-block">
                            {(selectedEqCosts.labor ?? 0).toLocaleString()} TND
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-neutral-200 flex justify-between items-center">
                        <span className="font-bold text-neutral-500">Coût Total d'Interventions :</span>
                        <span className="text-sm font-black text-chery-red font-mono">
                          {(selectedEqCosts.total ?? 0).toLocaleString()} TND
                        </span>
                      </div>
                    </div>

                    {/* Cost over time mock progress */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Répartition Budgétaire vs Prix d'achat</span>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                          <span>Dépenses cumulées / Valeur d'achat</span>
                          <span>{Math.round((selectedEqCosts.total / (selectedEquipment.purchasePrice || 1)) * 100)} %</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (selectedEqCosts.total / (selectedEquipment.purchasePrice || 1)) > 0.5
                                ? "bg-red-500 animate-pulse"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min((selectedEqCosts.total / (selectedEquipment.purchasePrice || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instant Call-to-action control buttons */}
              {!isReadOnly && (
                <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowDeclarePanneModal(true)}
                      className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-chery-red border border-red-200 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Déclarer Panne
                    </button>
                    <button
                      onClick={() => setShowPlanMaintenanceModal(true)}
                      className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Planifier Prév.
                    </button>
                  </div>
                  <button
                    onClick={() => setDetailTab("docs")}
                    className="w-full flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Consulter les documents
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-400 flex flex-col items-center justify-center h-full min-h-[350px]">
              <QrCode className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm font-bold">Aucun équipement sélectionné</p>
              <p className="text-xs max-w-[200px] mt-1 leading-relaxed">
                Cliquez sur n'importe quelle ligne d'équipement à gauche pour afficher sa fiche technique interactive, ses documents, photos et coûts de maintenance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-chery-red" />
                {editingEquipment ? `Modifier l'Équipement: ${editingEquipment.code}` : "Enregistrer un Nouvel Équipement"}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Code Équipement *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingEquipment}
                    placeholder="ex: EQ-SR-03"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 uppercase outline-none focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Nom de l'Équipement *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Équilibreuse Laser"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Service Émetteur</label>
                  <select
                    value={newWorkshop}
                    onChange={(e) => setNewWorkshop(e.target.value as Workshop)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    {WORKSHOPS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Statut Initial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as EquipmentStatus)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="Opérationnel">Opérationnel</option>
                    <option value="Dégradé">Dégradé</option>
                    <option value="En Maintenance">En Maintenance</option>
                    <option value="En Panne">En Panne</option>
                    <option value="Hors Service">Hors Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Criticité constructeur</label>
                  <select
                    value={newCriticite}
                    onChange={(e) => setNewCriticite(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="A - Critique">A - Critique (Priorité 1)</option>
                    <option value="B - Moyen">B - Moyen (Standard)</option>
                    <option value="C - Faible">C - Faible (Secondaire)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Collaborateur Responsable</label>
                  <input
                    type="text"
                    placeholder="M. Ahmed Amine"
                    value={newResponsableName}
                    onChange={(e) => setNewResponsableName(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Fournisseur / Garantie</label>
                  <select
                    value={newVendorId}
                    onChange={(e) => setNewVendorId(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="">Sélectionner</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date d'Achat</label>
                  <input
                    type="date"
                    value={newPurchaseDate}
                    onChange={(e) => setNewPurchaseDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date Fin Garantie</label>
                  <input
                    type="date"
                    value={newWarrantyEnd}
                    onChange={(e) => setNewWarrantyEnd(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Spécificités et Détails Garantie</label>
                <input
                  type="text"
                  placeholder="Garantie pièces et main d'œuvre de 2 ans, excluant pièces d'usure..."
                  value={newWarrantyDetails}
                  onChange={(e) => setNewWarrantyDetails(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Prix d'Achat (TND)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Numéro de Série</label>
                  <input
                    type="text"
                    placeholder="S/N"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Localisation précise</label>
                  <input
                    type="text"
                    placeholder="ex: Baie 3"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Périodicité Contrôle Réglementaire (Mois)</label>
                  <input
                    type="number"
                    value={newInterval}
                    onChange={(e) => setNewInterval(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">MTBF Cible (Heures)</label>
                  <input
                    type="number"
                    value={newMtbf}
                    onChange={(e) => setNewMtbf(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">MTTR Cible (Heures)</label>
                  <input
                    type="number"
                    value={newMttr}
                    onChange={(e) => setNewMttr(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
                >
                  {editingEquipment ? "Enregistrer les modifications" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Panne Declarer Modal Form */}
      {showDeclarePanneModal && selectedEquipment && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <AlertTriangle className="h-5 w-5 text-chery-red animate-pulse" />
              Déclarer une Panne - {selectedEquipment.code}
            </h3>

            <form onSubmit={handleDeclarePanneSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Désignation du dysfonctionnement *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fuite d'huile vérin droit / Écran de contrôle figé"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Description détaillée des symptômes</label>
                <textarea
                  rows={2}
                  placeholder="Symptômes, bruits suspects, code d'erreur affiché..."
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Technicien assigné *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Hichem Ben Ali"
                    value={quickTech}
                    onChange={(e) => setQuickTech(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Priorité panne *</label>
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="Faible">Faible (Niveau 3)</option>
                    <option value="Moyenne">Moyenne (Niveau 2)</option>
                    <option value="Haute">Haute (Priorité)</option>
                    <option value="Critique">Critique (Atelier Bloqué)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Temps estimé (Heures)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Frais main d'œuvre (TND)</label>
                  <input
                    type="number"
                    value={quickLaborCost}
                    onChange={(e) => setQuickLaborCost(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeclarePanneModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Valider le Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Maintenance Schedule Modal */}
      {showPlanMaintenanceModal && selectedEquipment && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              Planifier un Entretien - {selectedEquipment.code}
            </h3>

            <form onSubmit={handlePlanMaintenanceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Désignation de la maintenance *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Vidange de cuve et nettoyage filtres"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Consignes et Points de contrôle</label>
                <textarea
                  rows={2}
                  placeholder="Détails, check-list à vérifier, pièces à remplacer préventivement..."
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Technicien assigné *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Mehdi Chaouch"
                    value={quickTech}
                    onChange={(e) => setQuickTech(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Priorité d'exécution *</label>
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="Faible">Faible (Routine)</option>
                    <option value="Moyenne">Moyenne (Standard)</option>
                    <option value="Haute">Haute (Crucial)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Durée prévue (Heures)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Frais alloués (TND)</label>
                  <input
                    type="number"
                    value={quickLaborCost}
                    onChange={(e) => setQuickLaborCost(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPlanMaintenanceModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 py-2.5 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Planifier l'Entretien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal */}
      {equipmentToDelete && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-chery-red border border-red-100">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">
                Supprimer définitivement l'équipement ?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement l'équipement <strong className="text-neutral-800">{equipmentToDelete}</strong> ? Cette action l'effacera du parc d'actifs de la STA Tunisie de manière irréversible.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEquipmentToDelete(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 bg-chery-red hover:bg-red-700 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🖨️ Live QR Code Printable Label Modal */}
      {qrModalEq && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fade-in no-print">
          {/* Inject print-specific styles dynamically */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              /* Hide everything else */
              body > * {
                display: none !important;
              }
              /* Show ONLY our printable modal wrapper */
              #printable-qr-card-wrapper {
                display: flex !important;
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: white !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 9999999 !important;
              }
              #printable-qr-card {
                border: 2px solid #000 !important;
                box-shadow: none !important;
                padding: 40px !important;
                border-radius: 0px !important;
                width: 450px !important;
                background: white !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div id="printable-qr-card-wrapper" className="w-full max-w-md bg-white rounded-2xl border border-neutral-100 shadow-2xl p-6 space-y-5">
            {/* Modal Card Header */}
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3 no-print">
              <h3 className="text-sm font-black text-neutral-800 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-chery-red" />
                Étiquette d'Équipement STA Chery
              </h3>
              <button
                onClick={() => setQrModalEq(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* The QR Label Card itself */}
            <div id="printable-qr-card" className="border-2 border-dashed border-neutral-300 rounded-xl p-5 bg-white text-center space-y-4 shadow-2xs mx-auto">
              <div className="flex items-center justify-center gap-1.5 border-b border-neutral-100 pb-3">
                <span className="bg-chery-red text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                  STA
                </span>
                <span className="font-sans font-black text-sm tracking-wide text-neutral-800">
                  CHERY TUNISIE
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Code GMAO</span>
                <span className="text-base font-black text-neutral-800 font-mono tracking-wider bg-neutral-50 px-3 py-1 rounded border border-neutral-100 inline-block">
                  {qrModalEq.code}
                </span>
              </div>

              {/* Real high-quality QR code image */}
              <div className="bg-white p-3 border-2 border-neutral-900 rounded-xl inline-block shadow-2xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    `${window.location.origin}${window.location.pathname}?eq=${qrModalEq.code}`
                  )}&ecc=H`}
                  alt={`QR Code ${qrModalEq.code}`}
                  className="w-48 h-48 mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-neutral-800 leading-tight">
                  {qrModalEq.name}
                </h4>
                <div className="flex justify-center items-center gap-3 text-[10px] text-neutral-400 font-medium">
                  <span>Atelier: <strong>{qrModalEq.workshop}</strong></span>
                  <span>•</span>
                  <span>S/N: <strong>{qrModalEq.serialNumber}</strong></span>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 text-[9px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Scannez ce code pour déclarer une panne, consulter la documentation ou l'historique d'interventions de cet équipement.
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 pt-2 no-print text-xs font-semibold">
              <button
                type="button"
                onClick={() => setQrModalEq(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Fermer
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                    `${window.location.origin}${window.location.pathname}?eq=${qrModalEq.code}`
                  )}&ecc=H`;
                  
                  fetch(qrUrl)
                    .then(response => response.blob())
                    .then(blob => {
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = `QR_CODE_STA_${qrModalEq.code}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(blobUrl);
                    })
                    .catch(() => {
                      window.open(qrUrl, "_blank");
                    });
                }}
                className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/10"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📥 Batch Equipment Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-black text-neutral-800 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  Importation Massive d'Équipements (Excel / CSV)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Téléchargez le modèle d'importation, remplissez vos équipements et importez le fichier en un clic.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Step 1: Download Template Callout */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-900 block">
                    Étape 1 : Modèle Excel de Saisie
                  </span>
                  <p className="text-emerald-750 text-[11px]">
                    Téléchargez le fichier Excel modèle pour avoir les colonnes au format exact (Code, Nom, Atelier, S/N, Prix, etc.).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => generateEquipmentImportTemplate()}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger le Modèle (.xlsx)</span>
                </button>
              </div>

              {/* Step 2: Upload File Area */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 block">
                  Étape 2 : Séléctionnez votre fichier rempli (.xlsx, .xls, .csv)
                </label>
                <div className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 bg-neutral-50/50 hover:bg-emerald-50/30 rounded-xl p-6 text-center transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileImportChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <Upload className="h-8 w-8 text-neutral-400" />
                    {importFile ? (
                      <div>
                        <p className="font-bold text-neutral-800">{importFile.name}</p>
                        <p className="text-[10px] text-neutral-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-neutral-700">Cliquez ou glissez-déposez votre fichier ici</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Formats acceptés : Excel (.xlsx), CSV (.csv)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Parsing status / Error messages */}
              {isParsingImport && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Analyse du fichier Excel en cours...</span>
                </div>
              )}

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Step 3: Parsed Preview */}
              {parsedImportEquipments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Équipements détectés ({parsedImportEquipments.length})
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Prêts à être ajoutés
                    </span>
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="p-2 border-b">Code</th>
                          <th className="p-2 border-b">Nom de l'équipement</th>
                          <th className="p-2 border-b">Atelier</th>
                          <th className="p-2 border-b">Statut</th>
                          <th className="p-2 border-b">Prix Achat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {parsedImportEquipments.map((eq, i) => (
                          <tr key={i} className="hover:bg-neutral-50 font-medium">
                            <td className="p-2 font-mono font-bold text-neutral-800">{eq.code}</td>
                            <td className="p-2 text-neutral-800">{eq.name}</td>
                            <td className="p-2 text-neutral-600">{eq.workshop}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                {eq.status}
                              </span>
                            </td>
                            <td className="p-2 font-mono text-neutral-700">
                              {eq.purchasePrice.toLocaleString("fr-FR")} TND
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-2 px-4 rounded-xl cursor-pointer transition-colors"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={parsedImportEquipments.length === 0}
                onClick={handleConfirmBatchImport}
                className={`py-2 px-5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all ${
                  parsedImportEquipments.length > 0
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <Check className="h-4 w-4" />
                <span>Valider & Importer ({parsedImportEquipments.length}) Équipement(s)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ High-Res Photo Lightbox Preview Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center px-4 py-2 text-white border-b border-slate-800">
              <span className="text-xs font-bold flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-400" />
                Aperçu Photo Équipement ({selectedEquipment?.code})
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto flex items-center justify-center w-full bg-slate-950/50">
              <img
                src={previewPhotoUrl}
                alt="Agrandissement photo machine"
                referrerPolicy="no-referrer"
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
