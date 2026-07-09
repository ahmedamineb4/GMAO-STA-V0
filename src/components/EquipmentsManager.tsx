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
  RefreshCw
} from "lucide-react";
import { Equipment, EquipmentStatus, Workshop, Intervention } from "../types";
import { WORKSHOPS } from "../data";

interface EquipmentsManagerProps {
  equipments: Equipment[];
  interventions: Intervention[];
  onAddEquipment: (newEq: Equipment) => void;
  onUpdateStatus: (code: string, status: EquipmentStatus) => void;
  onUpdateEquipment: (updatedEq: Equipment) => void;
  onDeleteEquipment: (code: string) => void;
  initialWorkshop?: string;
  isReadOnly?: boolean;
  allowedWorkshop?: string;
  onResetDemoData?: () => void;
}

export default function EquipmentsManager({
  equipments,
  interventions,
  onAddEquipment,
  onUpdateStatus,
  onUpdateEquipment,
  onDeleteEquipment,
  initialWorkshop = "All",
  isReadOnly = false,
  allowedWorkshop,
  onResetDemoData
}: EquipmentsManagerProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>(initialWorkshop);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Sync initialWorkshop selection when prop changes
  useEffect(() => {
    if (allowedWorkshop) {
      setSelectedWorkshop(allowedWorkshop);
      setNewWorkshop(allowedWorkshop as Workshop);
    } else if (initialWorkshop) {
      setSelectedWorkshop(initialWorkshop);
    }
  }, [initialWorkshop, allowedWorkshop]);

  // Detail drawer state
  const [selectedEqCode, setSelectedEqCode] = useState<string | null>(null);

  // Add/Edit Equipment Form modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Deletion confirmation modal state
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);

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

  // Filtered Equipments List
  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      const matchesSearch =
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWorkshop = selectedWorkshop === "All" || eq.workshop === selectedWorkshop;
      const matchesStatus = selectedStatus === "All" || eq.status === selectedStatus;
      const matchesCritical = !onlyCritical || eq.critical;

      return matchesSearch && matchesWorkshop && matchesStatus && matchesCritical;
    });
  }, [equipments, searchQuery, selectedWorkshop, selectedStatus, onlyCritical]);

  const selectedEquipment = useMemo(() => {
    return equipments.find((eq) => eq.code === selectedEqCode) || null;
  }, [equipments, selectedEqCode]);

  const selectedEqInterventions = useMemo(() => {
    if (!selectedEqCode) return [];
    return interventions.filter((int) => int.equipmentCode === selectedEqCode);
  }, [interventions, selectedEqCode]);

  // Handle submitting equipment form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      alert("Veuillez remplir le Code et le Nom de l'équipement.");
      return;
    }

    const payload: Equipment = {
      code: newCode.toUpperCase(),
      name: newName,
      workshop: newWorkshop,
      status: newStatus,
      purchaseDate: newPurchaseDate,
      warrantyEnd: newWarrantyEnd,
      purchasePrice: Number(newPrice),
      location: newLocation || "Zone Principale",
      serialNumber: newSerial || "SN-PENDING",
      critical: newCritical,
      lastInspectionDate: editingEquipment ? editingEquipment.lastInspectionDate : newPurchaseDate,
      inspectionIntervalMonths: Number(newInterval),
      mtbfTargetHours: Number(newMtbf),
      mttrTargetHours: Number(newMttr)
    };

    if (editingEquipment) {
      onUpdateEquipment(payload);
    } else {
      // Check if code already exists
      if (equipments.some((eq) => eq.code.toUpperCase() === newCode.toUpperCase())) {
        alert(`Erreur : Le code équipement "${newCode}" existe déjà !`);
        return;
      }
      onAddEquipment(payload);
    }

    setShowAddForm(false);
    setEditingEquipment(null);

    // Reset Form fields
    setNewCode("");
    setNewName("");
    setNewLocation("");
    setNewSerial("");
    setNewCritical(false);
  };

  const handleAddNewClick = () => {
    setEditingEquipment(null);
    setNewCode("");
    setNewName("");
    setNewWorkshop(allowedWorkshop as Workshop || "Service Rapide");
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
    setShowAddForm(true);
  };

  // Pre-fill the add equipment form with an existing equipment's data for editing
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
    setNewInterval(eq.inspectionIntervalMonths);
    setNewMtbf(eq.mtbfTargetHours);
    setNewMttr(eq.mttrTargetHours);
    setShowAddForm(true);
  };

  const handleDeleteClick = (code: string) => {
    setEquipmentToDelete(code);
  };

  const executeDelete = () => {
    if (equipmentToDelete) {
      onDeleteEquipment(equipmentToDelete);
      if (selectedEqCode === equipmentToDelete) {
        setSelectedEqCode(null);
      }
      setEquipmentToDelete(null);
    }
  };

  // Pre-fill the add equipment form with an existing equipment's data as a copy
  const handleDuplicate = (eq: Equipment) => {
    setEditingEquipment(null);
    let baseCode = eq.code;
    let suggestedCode = `${baseCode}_COPIE`;
    let counter = 1;
    while (equipments.some((item) => item.code.toUpperCase() === suggestedCode.toUpperCase())) {
      suggestedCode = `${baseCode}_COPIE${counter}`;
      counter++;
    }

    setNewCode(suggestedCode);
    setNewName(`${eq.name} (Copie)`);
    setNewWorkshop(eq.workshop);
    setNewStatus(eq.status);
    setNewPurchaseDate(eq.purchaseDate);
    setNewWarrantyEnd(eq.warrantyEnd);
    setNewPrice(eq.purchasePrice);
    setNewLocation(eq.location);
    setNewSerial(eq.serialNumber && eq.serialNumber !== "SN-PENDING" ? `${eq.serialNumber}-COPIE` : "");
    setNewCritical(eq.critical);
    setNewInterval(eq.inspectionIntervalMonths);
    setNewMtbf(eq.mtbfTargetHours);
    setNewMttr(eq.mttrTargetHours);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par Code, Nom, S/N..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50/50 focus:bg-white focus:ring-1 focus:ring-chery-red focus:border-chery-red outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Workshop selector */}
          <select
            value={selectedWorkshop}
            disabled={!!allowedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-3 bg-white hover:bg-neutral-50 outline-none font-medium cursor-pointer disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            {allowedWorkshop ? (
              <option value={allowedWorkshop}>{allowedWorkshop}</option>
            ) : (
              <>
                <option value="All">Tous les Services</option>
                {WORKSHOPS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </>
            )}
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-3 bg-white hover:bg-neutral-50 outline-none font-medium cursor-pointer"
          >
            <option value="All">Tous les Statuts</option>
            <option value="Opérationnel">Opérationnel</option>
            <option value="Dégradé">Dégradé</option>
            <option value="En Maintenance">En Maintenance</option>
            <option value="En Panne">En Panne</option>
          </select>

          {/* Critical filter toggle */}
          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`flex items-center gap-1.5 border rounded-lg text-xs py-2 px-3 font-medium transition-colors cursor-pointer ${
              onlyCritical
                ? "border-red-200 bg-red-50 text-chery-red"
                : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Critique
          </button>

          {!isReadOnly && (
            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors ml-auto md:ml-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Enregistrer Équipement
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Equipment Grid/List (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-neutral-700">
                Équipements ({filteredEquipments.length} sur {equipments.length})
              </h3>
              <span className="text-xs text-neutral-400 font-medium">Cliquer pour inspecter la fiche</span>
            </div>

            {filteredEquipments.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
                <Sliders className="h-10 w-10 text-neutral-300 mb-2" />
                <p className="text-sm font-bold">Aucun équipement trouvé</p>
                <p className="text-xs mt-1 mb-4">
                  {equipments.length === 0 
                    ? "La base de données d'équipements est actuellement vierge (vide)."
                    : "Modifiez vos critères de recherche ou de filtre."}
                </p>
                {equipments.length === 0 && onResetDemoData && (
                  <button
                    type="button"
                    onClick={onResetDemoData}
                    className="bg-chery-red hover:bg-chery-dark text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Mettre en place les équipements depuis le fichier STA
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredEquipments.map((eq) => {
                  const hasWarranty = new Date(eq.warrantyEnd) > new Date("2026-07-01");

                  return (
                    <div
                      key={eq.code}
                      onClick={() => setSelectedEqCode(eq.code)}
                      className={`p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer ${
                        selectedEqCode === eq.code ? "bg-red-50/10 border-l-4 border-l-chery-red" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 h-3.5 w-3.5 rounded-full ${
                            eq.status === "Opérationnel"
                              ? "bg-green-500"
                              : eq.status === "Dégradé"
                              ? "bg-amber-500"
                              : eq.status === "En Maintenance"
                              ? "bg-blue-500"
                              : eq.status === "Hors Service"
                              ? "bg-neutral-400"
                              : "bg-red-500 animate-pulse-subtle"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-400 font-mono">
                              {eq.code}
                            </span>
                            <span className="text-xs text-neutral-400 font-mono">|</span>
                            <span className="text-xs font-semibold text-neutral-500">
                              {eq.workshop}
                            </span>
                            {eq.critical && (
                              <span className="bg-red-50 text-chery-red font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Critique
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-neutral-800 mt-0.5">{eq.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                            <span>S/N: {eq.serialNumber}</span>
                            <span>•</span>
                            <span>Loc: {eq.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-sm ${
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
                          <span className="text-[10px] text-neutral-400 block mt-1">
                            {hasWarranty ? "Sous Garantie" : "Hors Garantie"}
                          </span>
                        </div>
                        {!isReadOnly && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(eq);
                              }}
                              title="Modifier cet équipement"
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-neutral-400 hover:text-blue-600 transition-all cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(eq);
                              }}
                              title="Dupliquer cet équipement"
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-chery-red transition-all cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(eq.code);
                              }}
                              title="Supprimer cet équipement"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-neutral-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Equipment Technical Sheet Side Panel */}
        <div className="lg:col-span-1">
          {selectedEquipment ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 space-y-5 sticky top-6">
              <div className="flex justify-between items-start pb-3 border-b border-neutral-100">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <span>{selectedEquipment.code}</span>
                    <span>•</span>
                    <span>{selectedEquipment.workshop}</span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-800 mt-1 truncate">
                    {selectedEquipment.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDuplicate(selectedEquipment)}
                      title="Dupliquer cet équipement"
                      className="p-1.5 rounded-lg bg-neutral-50 hover:bg-red-50 text-neutral-500 hover:text-chery-red border border-neutral-100 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">Dupliquer</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEqCode(null)}
                    className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status Manager Control */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  {isReadOnly ? "État Actuel (Lecture Seule)" : "Changer l'État Actuel"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["Opérationnel", "Dégradé", "En Maintenance", "En Panne", "Hors Service"] as EquipmentStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        disabled={isReadOnly}
                        onClick={() => onUpdateStatus(selectedEquipment.code, st)}
                        className={`text-xs font-semibold py-1.5 px-2 rounded border transition-all ${
                          isReadOnly ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                        } ${
                          selectedEquipment.status === st
                            ? st === "Opérationnel"
                              ? "bg-green-500 border-green-500 text-white shadow-sm"
                              : st === "Dégradé"
                              ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                              : st === "En Maintenance"
                              ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                              : st === "Hors Service"
                              ? "bg-neutral-500 border-neutral-500 text-white shadow-sm"
                              : "bg-red-500 border-red-500 text-white shadow-sm"
                            : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Administrative actions */}
              {!isReadOnly && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(selectedEquipment)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedEquipment.code)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-chery-red py-2 rounded-lg text-xs font-semibold border border-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              )}

              {/* Technical Specifications */}
              <div className="space-y-3 bg-neutral-50 p-4 rounded-xl text-xs">
                <h4 className="font-bold text-neutral-700 flex items-center gap-1.5 border-b border-neutral-200 pb-1.5">
                  <Sliders className="h-3.5 w-3.5 text-neutral-500" />
                  Caractéristiques Techniques
                </h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                  <div>
                    <span className="text-neutral-400 block">S/N de Série :</span>
                    <span className="font-bold text-neutral-700 font-mono">{selectedEquipment.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Localisation :</span>
                    <span className="font-bold text-neutral-700">{selectedEquipment.location}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Date d'Achat :</span>
                    <span className="font-bold text-neutral-700 font-mono">{selectedEquipment.purchaseDate}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Prix d'Achat :</span>
                    <span className="font-bold text-neutral-700 font-mono">
                      {selectedEquipment.purchasePrice.toLocaleString()} TND
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Fin de Garantie :</span>
                    <span
                      className={`font-bold font-mono ${
                        new Date(selectedEquipment.warrantyEnd) < new Date("2026-07-01")
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedEquipment.warrantyEnd}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Critique ?</span>
                    <span className="font-bold text-neutral-700">
                      {selectedEquipment.critical ? "OUI (Priorité 1)" : "NON"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reliability Indicators */}
              <div className="space-y-3 border border-neutral-100 p-4 rounded-xl text-xs">
                <h4 className="font-bold text-neutral-700 flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
                  <Clock className="h-3.5 w-3.5 text-chery-red" />
                  Seuils de Fiabilité (MTBF/MTTR)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                      MTBF Cible
                    </span>
                    <span className="text-sm font-bold font-mono text-neutral-800">
                      {selectedEquipment.mtbfTargetHours} h
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                      MTTR Cible
                    </span>
                    <span className="text-sm font-bold font-mono text-neutral-800">
                      {selectedEquipment.mttrTargetHours} h
                    </span>
                  </div>
                </div>
              </div>

              {/* Specific Intervention History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Historique des Travaux ({selectedEqInterventions.length})
                </h4>
                {selectedEqInterventions.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-4 bg-neutral-50 rounded-lg">
                    Aucune intervention enregistrée pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedEqInterventions.map((int) => (
                      <div key={int.id} className="p-2 border border-neutral-100 rounded-lg text-xs hover:bg-neutral-50/50 transition-colors">
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-neutral-700 truncate">{int.title}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold ${
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
                        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                          <span>{int.dateIntervention}</span>
                          <span>{int.technician}</span>
                          <span className="font-mono text-neutral-600">
                            {(int.costParts + int.costLabor).toLocaleString()} TND
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-400 flex flex-col items-center justify-center h-full min-h-[350px]">
              <Info className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-sm font-bold">Aucun équipement sélectionné</p>
              <p className="text-xs max-w-[200px] mt-1">
                Cliquez sur n'importe quelle ligne d'équipement à gauche pour afficher sa fiche technique.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Equipment Drawer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-chery-red" />
                {editingEquipment ? `Modifier l'Équipement: ${editingEquipment.code}` : "Enregistrer un Nouvel Équipement"}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 uppercase outline-none focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Service Émetteur</label>
                  <select
                    value={newWorkshop}
                    onChange={(e) => setNewWorkshop(e.target.value as Workshop)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  >
                    <option value="Opérationnel">Opérationnel</option>
                    <option value="Dégradé">Dégradé</option>
                    <option value="En Maintenance">En Maintenance</option>
                    <option value="En Panne">En Panne</option>
                    <option value="Hors Service">Hors Service</option>
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Date Fin Garantie</label>
                  <input
                    type="date"
                    value={newWarrantyEnd}
                    onChange={(e) => setNewWarrantyEnd(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Prix d'Achat (TND)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Numéro de Série</label>
                  <input
                    type="text"
                    placeholder="S/N"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Périodicité Contrôle (Mois)</label>
                  <input
                    type="number"
                    value={newInterval}
                    onChange={(e) => setNewInterval(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">MTTR Cible (Heures)</label>
                  <input
                    type="number"
                    value={newMttr}
                    onChange={(e) => setNewMttr(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newCritical"
                  checked={newCritical}
                  onChange={(e) => setNewCritical(e.target.checked)}
                  className="rounded text-chery-red focus:ring-chery-red h-4 w-4 border-neutral-300"
                />
                <label htmlFor="newCritical" className="font-bold text-neutral-700 select-none">
                  Marquer comme Équipement Hautement Critique (Priorité Maximale)
                </label>
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
                Êtes-vous sûr de vouloir supprimer définitivement l'équipement <strong className="text-neutral-800">{equipmentToDelete}</strong> ? Cette action supprimera l'équipement du parc et est strictement irréversible.
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
    </div>
  );
}
