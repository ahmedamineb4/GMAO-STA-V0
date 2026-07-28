/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  Building2,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Edit3,
  Filter,
  ShieldCheck,
  ShoppingCart,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  BudgetYear,
  Workshop,
  Intervention,
  PurchaseRequest,
  MaintenanceContract,
  SparePart,
  Equipment,
  Vendor
} from "../types";
import { WORKSHOPS } from "../data";

interface FinancialManagerProps {
  budget: BudgetYear;
  interventions: Intervention[];
  purchaseRequests: PurchaseRequest[];
  contracts: MaintenanceContract[];
  spareParts: SparePart[];
  equipments: Equipment[];
  vendors: Vendor[];
  onUpdateBudgetAllocation: (workshop: Workshop, amount: number) => void;
  currentUserRole: string;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({
  budget,
  interventions,
  purchaseRequests,
  contracts,
  spareParts,
  equipments,
  onUpdateBudgetAllocation,
  currentUserRole
}) => {
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>("All");
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [tempAllocation, setTempAllocation] = useState<number>(0);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Consolidated Synthesis Metrics by Workshop
  const summaryData = useMemo(() => {
    // Total Allocated Budget
    const totalAllocated =
      Object.values(budget.allocatedByWorkshop || {}).reduce(
        (a: number, b: number) => a + Number(b),
        0
      ) || budget.totalBudget || 150000;

    let totalEqCount = 0;
    let totalOutCount = 0;
    let totalPrevCount = 0;
    let totalCurCount = 0;
    let totalSpentSum = 0;

    const rows = WORKSHOPS.map((ws) => {
      // Equipments in this workshop
      const wsEquipments = equipments.filter((eq) => eq.workshop === ws);
      const eqCount = wsEquipments.length;
      const outOfServiceCount = wsEquipments.filter(
        (eq) => eq.status === "Hors service" || eq.functionalStatus === "Non"
      ).length;

      // Interventions in this workshop
      const wsInterventions = interventions.filter((inv) => inv.workshop === ws);
      const prevCount = wsInterventions.filter((i) => i.type === "Préventive").length;
      const curCount = wsInterventions.filter((i) => i.type === "Curative").length;
      const interventionsCost = wsInterventions.reduce((sum, i) => sum + (i.cost || 0), 0);

      // Purchases (CAPEX) for this workshop
      const capexCost = purchaseRequests
        .filter(
          (pr) =>
            (pr.status === "Approuvé" || pr.status === "Commandé" || pr.status === "Reçu") &&
            pr.requestedBy.toLowerCase().includes(ws.toLowerCase())
        )
        .reduce((sum, pr) => sum + (pr.estimatedCost || 0) * (pr.quantity || 1), 0);

      // Budget
      const allocated = budget.allocatedByWorkshop?.[ws] || 0;
      const spent = Math.max(budget.spentByWorkshop?.[ws] || 0, interventionsCost + capexCost);
      const remaining = allocated - spent;
      const rate = allocated > 0 ? (spent / allocated) * 100 : 0;

      totalEqCount += eqCount;
      totalOutCount += outOfServiceCount;
      totalPrevCount += prevCount;
      totalCurCount += curCount;
      totalSpentSum += spent;

      return {
        workshop: ws,
        eqCount,
        outOfServiceCount,
        prevCount,
        curCount,
        interventionsCost,
        capexCost,
        allocated,
        spent,
        remaining,
        rate,
        isOverBudget: spent > allocated
      };
    });

    const totalSpentReal = totalSpentSum;
    const totalRemaining = totalAllocated - totalSpentReal;
    const globalRate = totalAllocated > 0 ? (totalSpentReal / totalAllocated) * 100 : 0;
    const globalAvailabilityRate =
      totalEqCount > 0 ? (((totalEqCount - totalOutCount) / totalEqCount) * 100).toFixed(1) : "100";

    return {
      rows: rows.filter(
        (r) => selectedWorkshopFilter === "All" || r.workshop === selectedWorkshopFilter
      ),
      allRows: rows,
      totalAllocated,
      totalSpentReal,
      totalRemaining,
      globalRate,
      totalEqCount,
      totalOutCount,
      totalPrevCount,
      totalCurCount,
      globalAvailabilityRate
    };
  }, [budget, interventions, purchaseRequests, equipments, selectedWorkshopFilter]);

  // Handle Edit Allocation Modal
  const openEditModal = (ws: Workshop) => {
    setEditingWorkshop(ws);
    setTempAllocation(budget.allocatedByWorkshop?.[ws] || 0);
    setShowEditModal(true);
  };

  const handleSaveAllocation = () => {
    if (editingWorkshop) {
      onUpdateBudgetAllocation(editingWorkshop, Number(tempAllocation));
      setShowEditModal(false);
      setEditingWorkshop(null);
    }
  };

  // Export Summary Table to CSV
  const handleExportCSV = () => {
    const headers =
      "Atelier,Nombre Equipements,Hors Service,Interventions Préventives,Interventions Curatives,Budget Alloué (TND),Dépenses Réelles (TND),Solde Restant (TND),Taux Consommation (%)\n";
    const body = summaryData.allRows
      .map(
        (r) =>
          `"${r.workshop}",${r.eqCount},${r.outOfServiceCount},${r.prevCount},${r.curCount},${r.allocated},${r.spent},${r.remaining},${r.rate.toFixed(1)}%`
      )
      .join("\n");

    const blob = new Blob([headers + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Tableau_Synthese_Maintenance_STA_Chery_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-chery-red rounded-xl">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-neutral-800 tracking-tight">
                Tableau Synthèse de Maintenance
              </h2>
              <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                STA CHERY 2026
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Bilan synthétique global des équipements, pannes, interventions et coûts par atelier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-700">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <span>Filtre Atelier:</span>
            <select
              value={selectedWorkshopFilter}
              onChange={(e) => setSelectedWorkshopFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-neutral-900 font-bold"
            >
              <option value="All">Tous les Ateliers</option>
              {WORKSHOPS.map((ws) => (
                <option key={ws} value={ws}>
                  {ws}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter Synthèse (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Equipments */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Parc Équipements</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-800 font-mono">
              {summaryData.totalEqCount}
            </span>
            <span className="text-xs font-bold text-neutral-400">machines</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100">
            <span className="text-neutral-500">Taux de Disponibilité</span>
            <span className="font-bold text-emerald-700">{summaryData.globalAvailabilityRate}%</span>
          </div>
        </div>

        {/* KPI 2: Interventions Total */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Interventions Réalisées</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-800 font-mono">
              {summaryData.totalPrevCount + summaryData.totalCurCount}
            </span>
            <span className="text-xs font-bold text-neutral-400">actes</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 text-neutral-500">
            <span>Préventives: <strong className="text-emerald-700">{summaryData.totalPrevCount}</strong></span>
            <span>Curatives: <strong className="text-chery-red">{summaryData.totalCurCount}</strong></span>
          </div>
        </div>

        {/* KPI 3: Budget Global */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Budget Alloué</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-neutral-800 font-mono">
              {summaryData.totalAllocated.toLocaleString("fr-FR")}
            </span>
            <span className="text-xs font-bold text-neutral-400">TND</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 text-neutral-500">
            <span>Solde Restant</span>
            <span className="font-bold text-emerald-700 font-mono">
              {summaryData.totalRemaining.toLocaleString("fr-FR")} TND
            </span>
          </div>
        </div>

        {/* KPI 4: Dépenses Réelles */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">Dépenses Réelles</span>
            <div className="p-2 bg-red-50 text-chery-red rounded-xl">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-chery-red font-mono">
              {summaryData.totalSpentReal.toLocaleString("fr-FR")}
            </span>
            <span className="text-xs font-bold text-neutral-400">TND</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100">
            <span className="text-neutral-500">Consommation</span>
            <span className={`font-bold ${summaryData.globalRate > 80 ? "text-chery-red" : "text-emerald-600"}`}>
              {summaryData.globalRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* MAIN TABLEAU SYNTHÈSE DE MAINTENANCE */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-neutral-800">
              Tableau Synthèse par Atelier & Département Technique
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Vue consolidée: équipements, état de marche, interventions, budget et coût de maintenance
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Zone / Atelier</th>
                <th className="py-3.5 px-3 text-center">Total Équip.</th>
                <th className="py-3.5 px-3 text-center">Hors Service</th>
                <th className="py-3.5 px-3 text-center">Interv. Préventives</th>
                <th className="py-3.5 px-3 text-center">Interv. Curatives</th>
                <th className="py-3.5 px-4 text-right">Budget Alloué</th>
                <th className="py-3.5 px-4 text-right">Dépenses Engagées</th>
                <th className="py-3.5 px-4 text-right">Solde Dispon.</th>
                <th className="py-3.5 px-4 text-center">Consommation</th>
                <th className="py-3.5 px-3 text-center">Statut</th>
                {currentUserRole === "admin" && <th className="py-3.5 px-3 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs font-medium text-neutral-700">
              {summaryData.rows.map((r) => (
                <tr key={r.workshop} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-neutral-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-chery-red"></span>
                    {r.workshop}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-neutral-800">
                    {r.eqCount}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {r.outOfServiceCount > 0 ? (
                      <span className="bg-red-50 text-chery-red font-mono font-bold px-2 py-0.5 rounded-full border border-red-200 text-[11px]">
                        🚨 {r.outOfServiceCount}
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-mono text-[11px]">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-emerald-700 font-bold">
                    {r.prevCount}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-chery-red font-bold">
                    {r.curCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-800">
                    {r.allocated.toLocaleString("fr-FR")} TND
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-chery-red">
                    {r.spent.toLocaleString("fr-FR")} TND
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {Math.max(0, r.remaining).toLocaleString("fr-FR")} TND
                  </td>
                  <td className="py-3.5 px-4 text-center min-w-[130px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>{r.rate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            r.isOverBudget
                              ? "bg-chery-red"
                              : r.rate > 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, r.rate)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {r.isOverBudget ? (
                      <span className="bg-red-50 text-chery-red border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Dépassement
                      </span>
                    ) : r.rate > 80 ? (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Vigilance
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Conforme
                      </span>
                    )}
                  </td>
                  {currentUserRole === "admin" && (
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => openEditModal(r.workshop)}
                        className="p-1.5 text-neutral-500 hover:text-chery-red hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        title="Ajuster l'allocation budgétaire"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100/90 font-black text-xs text-neutral-900 border-t-2 border-neutral-300">
                <td className="py-4 px-4">TOTAL SYNTHÈSE STA CHERY</td>
                <td className="py-4 px-3 text-center font-mono text-sm">{summaryData.totalEqCount}</td>
                <td className="py-4 px-3 text-center font-mono text-sm text-chery-red">{summaryData.totalOutCount}</td>
                <td className="py-4 px-3 text-center font-mono text-sm text-emerald-700">{summaryData.totalPrevCount}</td>
                <td className="py-4 px-3 text-center font-mono text-sm text-chery-red">{summaryData.totalCurCount}</td>
                <td className="py-4 px-4 text-right font-mono text-sm">
                  {summaryData.totalAllocated.toLocaleString("fr-FR")} TND
                </td>
                <td className="py-4 px-4 text-right font-mono text-sm text-chery-red">
                  {summaryData.totalSpentReal.toLocaleString("fr-FR")} TND
                </td>
                <td className="py-4 px-4 text-right font-mono text-sm text-emerald-700">
                  {summaryData.totalRemaining.toLocaleString("fr-FR")} TND
                </td>
                <td className="py-4 px-4 text-center font-mono text-xs">
                  {summaryData.globalRate.toFixed(1)}%
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-neutral-300 font-bold">
                    {summaryData.globalRate > 100 ? "Découvert" : "Budget Global OK"}
                  </span>
                </td>
                {currentUserRole === "admin" && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL ADJUST BUDGET ALLOCATION */}
      {showEditModal && editingWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-800">Ajustement Allocation Budgétaire</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-500 font-bold mb-1">Atelier Sélectionné</label>
                <input
                  type="text"
                  disabled
                  value={editingWorkshop}
                  className="w-full bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2 font-bold text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-bold mb-1">
                  Nouveau Budget Alloué pour 2026 (TND) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={tempAllocation}
                  onChange={(e) => setTempAllocation(Number(e.target.value))}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 font-mono font-bold text-neutral-900 focus:outline-none focus:border-chery-red"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAllocation}
                className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Enregistrer l'Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
