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
  CalendarRange
} from "lucide-react";
import { Equipment, Intervention, InterventionStatus, InterventionType, SparePart, PartUsed } from "../types";

interface InterventionsManagerProps {
  interventions: Intervention[];
  equipments: Equipment[];
  spareParts: SparePart[];
  onAddIntervention: (newInt: Intervention) => void;
  onUpdateInterventionStatus: (id: string, status: InterventionStatus) => void;
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

  // Sync initial filters
  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [initialType]);

  useEffect(() => {
    if (initialStatus) {
      setSelectedStatus(initialStatus);
    }
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

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [selectedEqCode, setSelectedEqCode] = useState("");
  const [newType, setNewType] = useState<InterventionType>("Correctif");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("2026-07-01");
  const [newDuration, setNewDuration] = useState<number>(2.5);
  const [newCostLabor, setNewCostLabor] = useState<number>(150);
  const [newTechnician, setNewTechnician] = useState("");
  const [newStatus, setNewStatus] = useState<InterventionStatus>("Planifié");
  const [newNotes, setNewNotes] = useState("");

  // Spare parts select list for form
  const [formPartsUsed, setFormPartsUsed] = useState<PartUsed[]>([]);
  const [selectedPartToAdd, setSelectedPartToAdd] = useState("");
  const [partQtyToAdd, setPartQtyToAdd] = useState<number>(1);

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

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [interventions, searchQuery, selectedType, selectedStatus]);

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

    // Verify stock availability for each part used
    for (const pUsed of formPartsUsed) {
      const partInStock = spareParts.find((sp) => sp.code === pUsed.partCode);
      if (partInStock && partInStock.currentStock < pUsed.quantity) {
        alert(
          `Quantité insuffisante pour la pièce ${partInStock.name} (Stock actuel: ${partInStock.currentStock}, Demandé: ${pUsed.quantity})`
        );
        return;
      }
    }

    const created: Intervention = {
      id: `INT-2026-${String(interventions.length + 1).padStart(3, "0")}`,
      equipmentCode: selectedEqCode,
      type: newType,
      title: newTitle,
      description: newDesc,
      dateIntervention: newDate,
      durationHours: Number(newDuration),
      costParts: calculatedPartsCost,
      costLabor: Number(newCostLabor),
      technician: newTechnician,
      status: newStatus,
      partsUsed: formPartsUsed,
      notes: newNotes
    };

    onAddIntervention(created);
    setShowForm(false);

    // Reset Form
    setSelectedEqCode("");
    setNewTitle("");
    setNewDesc("");
    setNewTechnician("");
    setNewNotes("");
    setFormPartsUsed([]);
  };

  return (
    <div className="space-y-6">
      {/* Top statistics summary panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
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
            {aggregateCosts.labor.toLocaleString()} TND
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Temps de travail facturé
          </span>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Dépenses Pièces Détachées</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {aggregateCosts.parts.toLocaleString()} TND
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Consommation réelle du magasin
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-3 bg-white outline-none font-medium cursor-pointer"
          >
            <option value="All">Tous les Types</option>
            <option value="Préventif">Préventif</option>
            <option value="Correctif">Correctif</option>
            <option value="Réglementaire">Réglementaire</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-3 bg-white outline-none font-medium cursor-pointer"
          >
            <option value="All">Tous les Statuts</option>
            <option value="Planifié">Planifié</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>

          {/* View Toggle */}
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
              className="flex items-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer ml-auto md:ml-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau Bon
            </button>
          )}
        </div>
      </div>

      {/* Interventions Content Toggle */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-700">Registre Historique des Interventions</h3>
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
                  <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase bg-neutral-50/20">
                    <th className="py-3 px-4">Intervention ID</th>
                    <th className="py-3 px-4">Équipement</th>
                    <th className="py-3 px-4">Désignation / Titre</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Date</th>
                    <th className="py-3 px-4 text-center">Durée</th>
                    <th className="py-3 px-4 text-right">Pièces (TND)</th>
                    <th className="py-3 px-4 text-right">Labor (TND)</th>
                    <th className="py-3 px-4 text-right font-bold">Total (TND)</th>
                    <th className="py-3 px-4">Intervenant</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 font-medium">
                  {filteredInterventions.map((int) => {
                    const eqName = equipments.find((e) => e.code === int.equipmentCode)?.name || "N/A";

                    return (
                      <tr key={int.id} className="hover:bg-neutral-50/50 transition-all">
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
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                              int.type === "Correctif"
                                ? "bg-red-50 text-chery-red"
                                : int.type === "Préventif"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {int.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-neutral-500">
                          {int.dateIntervention}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-neutral-500">
                          {int.durationHours} h
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-600">
                          {int.costParts.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-600">
                          {int.costLabor.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-800">
                          {(int.costParts + int.costLabor).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-neutral-700">
                            <User className="h-3 w-3 text-neutral-400" />
                            <span>{int.technician}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            disabled={isReadOnly}
                            value={int.status}
                            onChange={(e) =>
                              onUpdateInterventionStatus(int.id, e.target.value as InterventionStatus)
                            }
                            className={`text-[11px] font-bold py-1 px-1.5 rounded-md border cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-80 ${
                              int.status === "Terminé"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : int.status === "En cours"
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : int.status === "Planifié"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-neutral-50 border-neutral-200 text-neutral-400"
                            }`}
                          >
                            <option value="Planifié">Planifié</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                            <option value="Annulé">Annulé</option>
                          </select>
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
        /* Calendar View container with interactive list on click */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 columns: The beautiful Monthly Calendar grid */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-100 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-chery-red" />
                <h3 className="text-sm font-bold text-neutral-800">
                  Planification Mensuelle : {MONTHS_FR[calMonth]} {calYear}
                </h3>
              </div>
              {/* Nav Controls */}
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
                    setCalMonth(6); // Return to default July 2026
                    setSelectedCalDate("2026-07-01");
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

            {/* Calendar Day grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {/* Days headers */}
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="py-1 font-bold text-neutral-400 uppercase text-[10px]">
                  {day}
                </div>
              ))}

              {/* Grid cells */}
              {(() => {
                const totalDays = getDaysInMonth(calYear, calMonth);
                const firstDayIdx = getFirstDayOfMonth(calYear, calMonth);
                const blanks = Array(firstDayIdx).fill(null);
                const days = Array.from({ length: totalDays }, (_, i) => i + 1);
                const cells = [...blanks, ...days];

                return cells.map((cell, idx) => {
                  if (cell === null) {
                    return <div key={`blank-${idx}`} className="bg-neutral-50/20 rounded-lg h-20" />;
                  }

                  const dayNum = cell;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const dayInts = filteredInterventions.filter((i) => i.dateIntervention === dateStr);
                  const isSelected = selectedCalDate === dateStr;
                  const isToday = dateStr === "2026-07-01"; // simulated current date

                  return (
                    <div
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedCalDate(dateStr)}
                      className={`h-20 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden select-none ${
                        isSelected
                          ? "border-chery-red bg-red-50/10 shadow-xs"
                          : isToday
                          ? "border-neutral-800 bg-neutral-50 font-bold"
                          : "border-neutral-100 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      {/* Day number */}
                      <div className="flex justify-between items-center">
                        <span className={`text-[11px] font-mono ${isToday ? "text-neutral-900 font-extrabold" : "text-neutral-500 font-semibold"}`}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="h-1.5 w-1.5 rounded-full bg-chery-red block" title="Aujourd'hui" />
                        )}
                      </div>

                      {/* Miniature tags or indicator dots */}
                      <div className="space-y-0.5 max-h-[48px] overflow-hidden">
                        {dayInts.slice(0, 2).map((int) => (
                          <div
                            key={int.id}
                            className={`text-[8px] px-1 py-0.5 rounded-xs font-bold truncate leading-tight ${
                              int.type === "Préventif"
                                ? "bg-green-100 text-green-800"
                                : int.type === "Correctif"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
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

          {/* Right 1 column: Selected day's task list & details */}
          <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Plan du Jour sélectionné
              </h3>
              <span className="text-sm font-extrabold text-neutral-800 font-mono mt-0.5 block">
                {selectedCalDate.split("-").reverse().join("/")}
              </span>
            </div>

            {/* List of interventions on selected day */}
            {(() => {
              const dayInts = filteredInterventions.filter((i) => i.dateIntervention === selectedCalDate);

              if (dayInts.length === 0) {
                return (
                  <div className="py-12 text-center text-neutral-400 flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 text-neutral-300 mb-1.5" />
                    <p className="text-xs font-bold">Aucune maintenance</p>
                    <p className="text-[10px]">Aucun travail planifié pour cette date.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {dayInts.map((int) => {
                    const eq = equipments.find((e) => e.code === int.equipmentCode);
                    return (
                      <div
                        key={int.id}
                        className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2.5 relative hover:border-neutral-200 transition-all text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-neutral-400 text-[10px]">{int.id}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              int.type === "Préventif"
                                ? "bg-green-100 text-green-800"
                                : int.type === "Correctif"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {int.type}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-bold text-neutral-800 text-xs leading-tight">
                            {int.title}
                          </h4>
                          <span className="text-[10px] text-neutral-500 block font-semibold">
                            Équipement : {eq ? eq.name : int.equipmentCode} ({eq?.workshop})
                          </span>
                        </div>

                        <p className="text-[10px] text-neutral-400 leading-normal line-clamp-2">
                          {int.description}
                        </p>

                        <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 pt-2 border-t border-neutral-100">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-neutral-400" />
                            {int.technician}
                          </span>
                          <select
                            disabled={isReadOnly}
                            value={int.status}
                            onChange={(e) =>
                              onUpdateInterventionStatus(int.id, e.target.value as InterventionStatus)
                            }
                            className={`text-[10px] font-bold py-0.5 px-1 rounded cursor-pointer outline-none border disabled:cursor-not-allowed disabled:opacity-80 ${
                              int.status === "Terminé"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : int.status === "En cours"
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            <option value="Planifié">Planifié</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  >
                    <option value="Correctif">Correctif (Panne)</option>
                    <option value="Préventif">Préventif (Planifié)</option>
                    <option value="Réglementaire">Réglementaire (Sécurité)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Title */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Désignation du Problème / Titre *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Remplacement électrovanne ou Réglage capteur"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Description détaillée des symptômes / travaux</label>
                <textarea
                  rows={2}
                  placeholder="Expliquez ici ce qui nécessite réparation ou la méthode préventive appliquée"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 outline-none"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Durée Prévue (Heures)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Main d'Œuvre (TND)</label>
                  <input
                    type="number"
                    value={newCostLabor}
                    onChange={(e) => setNewCostLabor(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Technician & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Technicien / Prestataire Assigné *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ridha Ben Abdallah ou Externe (Weinmann)"
                    value={newTechnician}
                    onChange={(e) => setNewTechnician(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Statut initial du Bon</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as InterventionStatus)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>

              {/* Spare Parts Allocator Integration (The cool integration!) */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3">
                <h4 className="font-bold text-neutral-700 flex items-center gap-1.5 border-b border-neutral-200 pb-1.5">
                  <Package className="h-3.5 w-3.5 text-neutral-500" />
                  Prélèvement Pièces du Stock Magasin
                </h4>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">Sélectionner la Pièce</label>
                    <select
                      value={selectedPartToAdd}
                      onChange={(e) => setSelectedPartToAdd(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg p-1.5 bg-white outline-none text-xs"
                    >
                      <option value="">Sélectionner...</option>
                      {spareParts.map((sp) => (
                        <option key={sp.code} value={sp.code}>
                          [{sp.code}] {sp.name} - Stock: {sp.currentStock} (Prix: {sp.unitPrice} TND)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">Qté</label>
                    <input
                      type="number"
                      min="1"
                      value={partQtyToAdd}
                      onChange={(e) => setPartQtyToAdd(Number(e.target.value))}
                      className="w-full border border-neutral-200 rounded-lg p-1.5 bg-white outline-none text-xs text-center font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPartToForm}
                    disabled={!selectedPartToAdd}
                    className="bg-neutral-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-neutral-700 disabled:opacity-50 cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>

                {formPartsUsed.length > 0 && (
                  <div className="space-y-1.5 pt-2 max-h-32 overflow-y-auto">
                    {formPartsUsed.map((pUsed) => {
                      const spInfo = spareParts.find((s) => s.code === pUsed.partCode);
                      return (
                        <div key={pUsed.partCode} className="flex justify-between items-center bg-white p-2 rounded-lg border border-neutral-100 text-xs">
                          <span className="font-semibold text-neutral-700">
                            {spInfo ? spInfo.name : pUsed.partCode}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-neutral-500">
                              {pUsed.quantity} u x {spInfo ? spInfo.unitPrice : 0} TND ={" "}
                              {pUsed.quantity * (spInfo ? spInfo.unitPrice : 0)} TND
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePartFromForm(pUsed.partCode)}
                              className="text-red-600 font-bold hover:text-red-800 cursor-pointer"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-right font-bold text-neutral-800 pr-2 pt-1 border-t border-neutral-100">
                      Coût total estimé des pièces: {calculatedPartsCost.toLocaleString()} TND
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Rapport de clôture (Clôturé uniquement)</label>
                <input
                  type="text"
                  placeholder="Notes finales de diagnostic ou observations de réparation"
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
    </div>
  );
}
