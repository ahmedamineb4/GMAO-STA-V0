/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Award,
  Calendar,
  AlertTriangle,
  UserCheck,
  DollarSign,
  Plus,
  Phone,
  Mail,
  Building,
  CheckCircle,
  FileCheck,
  Star,
  Clock,
  Edit2,
  Trash2,
  X
} from "lucide-react";
import { Vendor, MaintenanceContract, ComplianceCheck, Equipment } from "../types";

interface ContractsManagerProps {
  vendors: Vendor[];
  contracts: MaintenanceContract[];
  compliance: ComplianceCheck[];
  equipments: Equipment[];
  onAddComplianceCheck: (newCheck: ComplianceCheck) => void;
  onAddContract?: (contract: MaintenanceContract) => void;
  onUpdateContract?: (contract: MaintenanceContract) => void;
  onDeleteContract?: (id: string) => void;
  currentRole?: string;
  allowedWorkshop?: string;
}

export default function ContractsManager({
  vendors,
  contracts,
  compliance,
  equipments,
  onAddComplianceCheck,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  currentRole = "admin",
  allowedWorkshop
}: ContractsManagerProps) {
  const TODAY = "2026-07-01";

  // Filtered compliance checks and contracts for workshop isolation
  const filteredCompliance = useMemo(() => {
    if (!allowedWorkshop) return compliance;
    return compliance.filter((c) => {
      const eq = equipments.find((e) => e.code === c.equipmentCode);
      return eq && eq.workshop === allowedWorkshop;
    });
  }, [compliance, allowedWorkshop, equipments]);

  const filteredContracts = useMemo(() => {
    if (!allowedWorkshop) return contracts;
    return contracts.filter((contract) => {
      if (contract.coveredEquipments.includes("EQ-ALL")) return true;
      return contract.coveredEquipments.some((eqCode) => {
        const eq = equipments.find((e) => e.code === eqCode);
        return eq && eq.workshop === allowedWorkshop;
      });
    });
  }, [contracts, allowedWorkshop, equipments]);

  // Modal State for Regulatory check
  const [showAddCheck, setShowAddCheck] = useState(false);

  // Contract Modal States
  const [showAddContract, setShowAddContract] = useState(false);
  const [editingContract, setEditingContract] = useState<MaintenanceContract | null>(null);

  // New Contract Form State
  const [contractTitle, setContractTitle] = useState("");
  const [contractVendorId, setContractVendorId] = useState("");
  const [contractCost, setContractCost] = useState<number>(1000);
  const [contractStartDate, setContractStartDate] = useState("2026-01-01");
  const [contractEndDate, setContractEndDate] = useState("2026-12-31");
  const [contractFrequency, setContractFrequency] = useState<"Mensuel" | "Trimestriel" | "Semestriel" | "Annuel">("Annuel");
  const [contractStatus, setContractStatus] = useState<"Actif" | "Expiré" | "En révision">("Actif");
  const [contractEquipments, setContractEquipments] = useState<string>("");

  // Edit Contract Form State
  const [editTitle, setEditTitle] = useState("");
  const [editVendorId, setEditVendorId] = useState("");
  const [editCost, setEditCost] = useState<number>(0);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editFrequency, setEditFrequency] = useState<"Mensuel" | "Trimestriel" | "Semestriel" | "Annuel">("Annuel");
  const [editStatus, setEditStatus] = useState<"Actif" | "Expiré" | "En révision">("Actif");
  const [editEquipments, setEditEquipments] = useState<string>("");

  const handleStartEditContract = (c: MaintenanceContract) => {
    setEditingContract(c);
    setEditTitle(c.title);
    setEditVendorId(c.vendorId);
    setEditCost(c.costAnnual);
    setEditStartDate(c.startDate);
    setEditEndDate(c.endDate);
    setEditFrequency(c.frequency);
    setEditStatus(c.status);
    setEditEquipments(c.coveredEquipments.join(", "));
  };

  const handleAddContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractTitle || !contractVendorId || !onAddContract) return;
    const eqList = contractEquipments
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newContract: MaintenanceContract = {
      id: `CTR-2026-${String(contracts.length + 1).padStart(2, "0")}`,
      title: contractTitle,
      vendorId: contractVendorId,
      costAnnual: Number(contractCost),
      startDate: contractStartDate,
      endDate: contractEndDate,
      frequency: contractFrequency,
      status: contractStatus,
      coveredEquipments: eqList.length > 0 ? eqList : ["EQ-ALL"]
    };
    onAddContract(newContract);
    setShowAddContract(false);
    setContractTitle("");
    setContractVendorId("");
    setContractCost(1000);
    setContractEquipments("");
  };

  const handleEditContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract || !onUpdateContract) return;
    const eqList = editEquipments
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const updated: MaintenanceContract = {
      ...editingContract,
      title: editTitle,
      vendorId: editVendorId,
      costAnnual: Number(editCost),
      startDate: editStartDate,
      endDate: editEndDate,
      frequency: editFrequency,
      status: editStatus,
      coveredEquipments: eqList
    };
    onUpdateContract(updated);
    setEditingContract(null);
  };

  const handleDeleteContractAction = (c: MaintenanceContract) => {
    if (currentRole !== "admin") {
      alert("⛔ Seul l'Administrateur est autorisé à supprimer un contrat de maintenance.");
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer le contrat "${c.title}" (${c.id}) ?`)) {
      if (onDeleteContract) {
        onDeleteContract(c.id);
      }
    }
  };

  // New compliance form inputs
  const [newEqCode, setNewEqCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("Apave Tunisie");
  const [newDate, setNewDate] = useState("2026-07-01");
  const [newNextDate, setNewNextDate] = useState("2027-07-01");
  const [newStatus, setNewStatus] = useState<"Conforme" | "Non conforme" | "En attente d'action">("Conforme");
  const [newReport, setNewReport] = useState("");

  const activeContractsCost = useMemo(() => {
    return contracts
      .filter((c) => c.status === "Actif")
      .reduce((acc, c) => acc + c.costAnnual, 0);
  }, [contracts]);

  const handleSubmitCompliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqCode || !newTitle || !newReport) {
      alert("Veuillez remplir l'équipement, l'objet et la référence du PV.");
      return;
    }

    const created: ComplianceCheck = {
      id: `CMP-2026-${String(compliance.length + 1).padStart(2, "0")}`,
      equipmentCode: newEqCode,
      title: newTitle,
      bodyName: newBody,
      inspectionDate: newDate,
      nextInspectionDate: newNextDate,
      status: newStatus,
      reportRef: newReport
    };

    onAddComplianceCheck(created);
    setShowAddCheck(false);

    // Reset Form
    setNewEqCode("");
    setNewTitle("");
    setNewReport("");
  };

  return (
    <div className="space-y-6">
      {/* KPI Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-neutral-100 text-neutral-800 rounded-xl">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Prestataires Actifs
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {vendors.length} Organismes
            </span>
            <span className="text-xs text-neutral-400 font-medium block mt-0.5">
              Partenaires agréés et SAV d'origine
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-chery-red rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Engagements Annuels
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {filteredContracts.reduce((sum, c) => sum + c.costAnnual, 0).toLocaleString()} TND / an
            </span>
            <span className="text-xs text-neutral-500 font-medium block mt-0.5">
              Maintenance contractuelle externe
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Contrôles Périodiques
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {filteredCompliance.filter((c) => c.status === "Conforme").length} / {filteredCompliance.length} Conformes
            </span>
            <span className="text-xs text-blue-600 font-medium block mt-0.5">
              Inspections de sécurité valides
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Maintenance Contracts & Vendors */}
        <div className="space-y-6">
          {/* Contracts Section */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                <Award className="h-5 w-5 text-chery-red" />
                Contrats d'Assistance & Maintenance Externe
              </h3>
              {onAddContract && (currentRole === "admin" || currentRole === "magasin") && (
                <button
                  onClick={() => setShowAddContract(true)}
                  className="flex items-center gap-1 bg-chery-red hover:bg-chery-dark text-white text-[11px] py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouveau Contrat
                </button>
              )}
            </div>

            <div className="space-y-4">
              {filteredContracts.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-4">Aucun contrat d'assistance répertorié.</p>
              ) : (
                filteredContracts.map((c) => {
                  const vendor = vendors.find((v) => v.id === c.vendorId);
                  const hasExpired = new Date(c.endDate) < new Date(TODAY);

                  return (
                    <div
                      key={c.id}
                      className="p-4 border border-neutral-100 rounded-xl space-y-3 hover:bg-neutral-50/20 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-neutral-800 text-[13px]">{c.title}</h4>
                          <span className="text-xs text-neutral-400 block">
                            Fournisseur: <strong>{vendor ? vendor.name : c.vendorId}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              hasExpired
                                ? "bg-red-50 text-chery-red border border-red-100"
                                : "bg-green-50 text-green-700 border border-green-100"
                            }`}
                          >
                            {hasExpired ? "Expiré" : c.status}
                          </span>

                          {/* Edit Contract */}
                          {onUpdateContract && (
                            <button
                              onClick={() => handleStartEditContract(c)}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-1 rounded text-[10px] border border-neutral-200 cursor-pointer transition-colors"
                              title="Modifier ce contrat"
                            >
                              <Edit2 className="h-3 w-3 text-neutral-600" />
                            </button>
                          )}

                          {/* Delete Contract (Admin Only) */}
                          {currentRole === "admin" && onDeleteContract && (
                            <button
                              onClick={() => handleDeleteContractAction(c)}
                              className="bg-red-50 hover:bg-red-100 text-chery-red p-1 rounded text-[10px] border border-red-200 cursor-pointer transition-colors"
                              title="Supprimer ce contrat (Admin)"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-50 text-[11px] text-neutral-500">
                      <div>
                        <span className="block text-neutral-400">Coût Annuel</span>
                        <span className="font-bold font-mono text-neutral-700">
                          {(c.costAnnual ?? 0).toLocaleString()} TND
                        </span>
                      </div>
                      <div>
                        <span className="block text-neutral-400">Fréquence</span>
                        <span className="font-bold text-neutral-700">{c.frequency}</span>
                      </div>
                      <div>
                        <span className="block text-neutral-400">Période</span>
                        <span className="font-mono text-neutral-700">{c.endDate}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-400 pt-1.5 flex flex-wrap gap-1">
                      <span className="font-semibold text-neutral-500">Actifs couverts:</span>
                      {c.coveredEquipments.map((code) => (
                        <span key={code} className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Vendors Directory */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-800 mb-4">Annuaire des Prestataires & SAV</h3>
            <div className="divide-y divide-neutral-100">
              {vendors.map((v) => (
                <div key={v.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-neutral-800 text-[13px]">{v.name}</h4>
                    <span className="text-[11px] text-neutral-400 block">{v.serviceType}</span>
                    <span className="text-neutral-500 text-[11px] font-medium block mt-0.5">
                      Contact: {v.contactPerson}
                    </span>
                  </div>

                  <div className="flex flex-col md:items-end gap-1.5 text-right">
                    {/* Stars */}
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < v.rating ? "fill-amber-400" : "text-neutral-200"}`} />
                      ))}
                    </div>
                    {/* Contacts buttons */}
                    <div className="flex gap-2 text-[10px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-neutral-400" />
                        {v.phone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-neutral-400" />
                        {v.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Regulatory Compliance Audits */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                  Sécurité & Contrôles Réglementaires Obligatoires
                </h3>
                <p className="text-xs text-neutral-500">Inspections techniques (Apave, SGS) de la concession</p>
              </div>
              <button
                onClick={() => setShowAddCheck(true)}
                className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] py-1.5 px-3 rounded-lg font-bold cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Saisir PV
              </button>
            </div>

            <div className="space-y-4">
              {filteredCompliance.map((cmp) => {
                const nextDate = new Date(cmp.nextInspectionDate);
                const todayDate = new Date(TODAY);
                const isOverdue = nextDate < todayDate;
                const diffDays = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
                const eqName = equipments.find((e) => e.code === cmp.equipmentCode)?.name || "N/A";

                return (
                  <div
                    key={cmp.id}
                    className={`p-4 border rounded-xl space-y-2 ${
                      isOverdue
                        ? "bg-red-50/20 border-red-100"
                        : diffDays <= 30
                        ? "bg-amber-50/20 border-amber-100"
                        : "bg-white border-neutral-100"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                          {cmp.id}
                        </span>
                        <h4 className="font-bold text-neutral-800 text-[13px] mt-1.5">{cmp.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          cmp.status === "Conforme"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : cmp.status === "Non conforme"
                            ? "bg-red-50 text-chery-red border border-red-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {cmp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Équipement inspecté:</span>
                        <span className="font-bold text-neutral-700 font-mono">
                          {cmp.equipmentCode}
                        </span>
                        <span className="text-[10px] text-neutral-400 block truncate">{eqName}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">PV d'Inspection:</span>
                        <span className="font-bold text-neutral-700 font-mono text-[11px]">
                          {cmp.reportRef}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">Organisme: {cmp.bodyName}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-2 border-t border-neutral-50 text-neutral-400 font-medium">
                      <span>Réalisé le: {cmp.inspectionDate}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Échéance: <strong className="text-neutral-700 font-mono">{cmp.nextInspectionDate}</strong></span>
                      </div>
                    </div>

                    {isOverdue ? (
                      <div className="bg-red-50 text-chery-red p-2 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 animate-pulse-subtle">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Alerte de conformité : Contrôle technique expiré. Refaire d'urgence !
                      </div>
                    ) : diffDays <= 30 ? (
                      <div className="bg-amber-50 text-amber-700 p-2 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Planifier l'inspection périodique dans {diffDays} jours.
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PV Compliance Modal */}
      {showAddCheck && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-chery-red" />
                Saisir un PV d'Inspection Réglementaire
              </h3>
              <button
                onClick={() => setShowAddCheck(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmitCompliance} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Cible Équipement *</label>
                <select
                  required
                  value={newEqCode}
                  onChange={(e) => setNewEqCode(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                >
                  <option value="">Sélectionner...</option>
                  {equipments.map((eq) => (
                    <option key={eq.code} value={eq.code}>
                      [{eq.code}] {eq.name} ({eq.workshop})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Libellé / Objet du Contrôle *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Vérification des câbles et épreuve de charge"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Organisme Agrée</label>
                  <select
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  >
                    <option value="Apave Tunisie">Apave Tunisie</option>
                    <option value="SGS Tunisie">SGS Tunisie</option>
                    <option value="Veritas Tunisie">Bureau Veritas</option>
                    <option value="Socomat Service">Socomat (Constructeur)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Statut Conformité</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  >
                    <option value="Conforme">Conforme</option>
                    <option value="Non conforme">Non conforme</option>
                    <option value="En attente d'action">En attente d'action</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date d'Inspection</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Prochaine Échéance</label>
                  <input
                    type="date"
                    value={newNextDate}
                    onChange={(e) => setNewNextDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Référence du PV / Rapport *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: AP-PV-9922/2026"
                  value={newReport}
                  onChange={(e) => setNewReport(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCheck(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
                >
                  Enregistrer PV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nouveau Contrat Modal */}
      {showAddContract && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-chery-red" />
                <h3 className="text-base font-bold text-neutral-800">
                  Saisir un Nouveau Contrat de Maintenance Externe
                </h3>
              </div>
              <button
                onClick={() => setShowAddContract(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddContractSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Intitulé du Contrat *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Contrat Maintenance Préventive Ponts Elevateurs"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Prestataire / Fournisseur *</label>
                <select
                  required
                  value={contractVendorId}
                  onChange={(e) => setContractVendorId(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red cursor-pointer"
                >
                  <option value="">Sélectionner un prestataire...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.serviceType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Coût Annuel (TND) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={contractCost}
                    onChange={(e) => setContractCost(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white font-mono font-bold outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Fréquence d'Intervention</label>
                  <select
                    value={contractFrequency}
                    onChange={(e) => setContractFrequency(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red cursor-pointer"
                  >
                    <option value="Mensuel">Mensuel</option>
                    <option value="Trimestriel">Trimestriel</option>
                    <option value="Semestriel">Semestriel</option>
                    <option value="Annuel">Annuel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date de Début</label>
                  <input
                    type="date"
                    required
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date de Fin / Échéance</label>
                  <input
                    type="date"
                    required
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Statut du Contrat</label>
                  <select
                    value={contractStatus}
                    onChange={(e) => setContractStatus(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none font-bold focus:ring-1 focus:ring-chery-red cursor-pointer"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Expiré">Expiré</option>
                    <option value="En révision">En révision</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Équipements Couverts (Séparés par virgule)</label>
                  <input
                    type="text"
                    placeholder="ex: EQ-SR-01, EQ-SR-02"
                    value={contractEquipments}
                    onChange={(e) => setContractEquipments(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none font-mono focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContract(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer transition-colors shadow-sm"
                >
                  Créer le Contrat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modifier Contrat Modal */}
      {editingContract && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-chery-red" />
                <h3 className="text-base font-bold text-neutral-800">
                  Modifier le Contrat ({editingContract.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingContract(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditContractSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Intitulé du Contrat *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Prestataire / Fournisseur *</label>
                <select
                  required
                  value={editVendorId}
                  onChange={(e) => setEditVendorId(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red cursor-pointer"
                >
                  <option value="">Sélectionner un prestataire...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.serviceType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Coût Annuel (TND) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white font-mono font-bold outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Fréquence d'Intervention</label>
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red cursor-pointer"
                  >
                    <option value="Mensuel">Mensuel</option>
                    <option value="Trimestriel">Trimestriel</option>
                    <option value="Semestriel">Semestriel</option>
                    <option value="Annuel">Annuel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date de Début</label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date de Fin / Échéance</label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Statut du Contrat</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none font-bold focus:ring-1 focus:ring-chery-red cursor-pointer"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Expiré">Expiré</option>
                    <option value="En révision">En révision</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Équipements Couverts (Séparés par virgule)</label>
                  <input
                    type="text"
                    placeholder="ex: EQ-SR-01, EQ-SR-02"
                    value={editEquipments}
                    onChange={(e) => setEditEquipments(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none font-mono focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer transition-colors shadow-sm"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
