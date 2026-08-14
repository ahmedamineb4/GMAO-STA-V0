/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  DollarSign,
  ShieldCheck,
  Package,
  ArrowRight,
  Sparkles,
  Info,
  RefreshCw,
  Clock,
  ShieldAlert,
  Sliders,
  AlertOctagon,
  Layers,
  HeartPulse,
  Download,
  FileSpreadsheet,
  Database,
  FileCode,
  Search,
  Calendar,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Equipment, Intervention, SparePart, ComplianceCheck, BudgetYear, Workshop, PurchaseRequest, MaintenanceContract, Vendor } from "../types";
import { generateSTAExcelFile } from "../utils/excelGenerator";
import { FinancialManager } from "./FinancialManager";

interface GmaoDashboardProps {
  equipments: Equipment[];
  interventions: Intervention[];
  spareParts: SparePart[];
  compliance: ComplianceCheck[];
  budget: BudgetYear;
  purchaseRequests: PurchaseRequest[];
  contracts?: MaintenanceContract[];
  vendors?: Vendor[];
  onNavigate: (tab: string) => void;
  onResetDemoData?: () => void;
  onUpdateBudgetAllocation?: (workshop: Workshop, amount: number) => void;
  currentUserRole?: string;
}

export default function GmaoDashboard({
  equipments,
  interventions,
  spareParts,
  compliance,
  budget,
  purchaseRequests,
  contracts = [],
  vendors = [],
  onNavigate,
  onResetDemoData,
  onUpdateBudgetAllocation,
  currentUserRole = "admin"
}: GmaoDashboardProps) {
  // Current static reference date (July 2026)
  const TODAY = "2026-07-21";

  // State for dynamic period filter & intelligent omnibar search & alerts pagination
  const [periodFilter, setPeriodFilter] = useState<"all" | "month" | "quarter" | "year">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Filter interventions dynamically by selected date period
  const filteredInterventions = useMemo(() => {
    if (periodFilter === "all") return interventions;

    return interventions.filter((int) => {
      const date = int.dateIntervention;
      if (!date) return true;

      if (periodFilter === "month") {
        // Current month (2026-07)
        return date.startsWith("2026-07");
      }
      if (periodFilter === "quarter") {
        // Q3 2026 (July, August, September)
        return date.startsWith("2026-07") || date.startsWith("2026-08") || date.startsWith("2026-09");
      }
      if (periodFilter === "year") {
        // Year 2026
        return date.startsWith("2026");
      }
      return true;
    });
  }, [interventions, periodFilter]);

  // Intelligent Search (Omnibar) across Equipments, Interventions, Spare Parts
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { equipments: [], interventions: [], spareParts: [] };

    const matchingEquipments = equipments.filter(
      (e) => e.code.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.workshop.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchingInterventions = interventions.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.equipmentCode.toLowerCase().includes(q) ||
        i.technician.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchingSpareParts = spareParts.filter(
      (p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      equipments: matchingEquipments,
      interventions: matchingInterventions,
      spareParts: matchingSpareParts
    };
  }, [searchQuery, equipments, interventions, spareParts]);

  // 1. Calculations & Metrics
  const metrics = useMemo(() => {
    // Exclude "Hors Service" (Out of Service) equipments from calculations
    const activeEquipments = equipments.filter((eq) => eq.status !== "Hors Service");
    const totalEquipments = activeEquipments.length;

    // Availability calculation based on weights:
    // Opérationnel = 100%, Dégradé = 90%, En Maintenance = 40%, En Panne = 0%
    const availSum = activeEquipments.reduce((acc, eq) => {
      if (eq.status === "Opérationnel") return acc + 100;
      if (eq.status === "Dégradé") return acc + 90;
      if (eq.status === "En Maintenance") return acc + 40;
      return acc; // En Panne = 0
    }, 0);
    const avgAvailability = totalEquipments ? Math.round(availSum / totalEquipments) : 0;

    // MTTR (Mean Time To Repair)
    // Dynamic calculation from real duration in minutes if specified, or standard duration hours
    const completedCorrectives = filteredInterventions.filter(
      (int) => int.type === "Correctif" && (int.status === "Terminée" || int.status === "Clôturée" || int.status === "Terminé")
    );
    const totalMinutes = completedCorrectives.reduce((acc, c) => {
      return acc + (c.realDurationMinutes || (c.durationHours * 60));
    }, 0);
    const mttr = completedCorrectives.length
      ? (totalMinutes / completedCorrectives.length / 60).toFixed(1)
      : "1.8"; // Default benchmark MTTR hours if empty

    // MTBF (Mean Time Between Failures)
    // Approximate using active equipments target MTBF plus failure count adjustments
    const failureCount = filteredInterventions.filter((int) => int.type === "Correctif").length;
    const mtbf = activeEquipments.length
      ? Math.round(
          activeEquipments.reduce((acc, eq) => acc + (eq.mtbfTargetHours || 1200), 0) /
            activeEquipments.length -
            failureCount * 12
        )
      : 1150;

    // Preventive vs Corrective Distribution Rates
    const preventives = filteredInterventions.filter((int) => int.type === "Préventif");
    const correctives = filteredInterventions.filter((int) => int.type === "Correctif");
    const totalMaintenanceActions = filteredInterventions.length;

    const completedPrev = preventives.filter((int) => int.status === "Terminée" || int.status === "Clôturée" || int.status === "Terminé").length;
    const prevRate = preventives.length
      ? Math.round((completedPrev / preventives.length) * 100)
      : 0;

    // Financial calculations
    const costLabor = filteredInterventions.reduce((acc, int) => acc + (int.costLabor || 0), 0);
    const totalSpent = costLabor;
    const budgetRemaining = budget.totalBudget - totalSpent;

    return {
      avgAvailability,
      mttr,
      mtbf,
      prevRate,
      costLabor,
      totalSpent,
      budgetRemaining,
      totalEquipments,
      preventiveCount: preventives.length,
      correctiveCount: correctives.length,
      regulatoryCount: filteredInterventions.filter((int) => int.type === "Réglementaire").length,
      totalCount: totalMaintenanceActions
    };
  }, [equipments, filteredInterventions, budget]);

  // 2. Generate Real-time Alerts
  const alerts = useMemo(() => {
    const list: Array<{
      id: string;
      category: "Pneu" | "Garantie" | "Budget" | "Réglementaire" | "Panne" | "Achat" | "Retard" | "Stock";
      title: string;
      desc: string;
      severity: "critical" | "warning" | "info";
    }> = [];

    // En Panne alert
    equipments.forEach((eq) => {
      if (eq.status === "En Panne") {
        list.push({
          id: `p-${eq.code}`,
          category: "Panne",
          title: `Équipement en Panne : ${eq.code}`,
          desc: `${eq.name} (${eq.workshop}) requiert une assistance curative urgente.`,
          severity: "critical"
        });
      }
    });

    // Stock shortage alerts (Ruptures de stock)
    spareParts.forEach((sp) => {
      if (sp.currentStock <= (sp.reorderPoint || 1)) {
        list.push({
          id: `sp-${sp.code}`,
          category: "Stock",
          title: `Rupture / Seuil Alerte Stock : ${sp.code}`,
          desc: `${sp.name} - Stock actuel: ${sp.currentStock} / Seuil min: ${sp.reorderPoint || 1} (Emplacement: ${sp.location || "Magasin Central"})`,
          severity: sp.currentStock === 0 ? "critical" : "warning"
        });
      }
    });

    // Overdue planned maintenance (Maintenances en retard)
    filteredInterventions.forEach((int) => {
      const isPending = int.status === "Nouvelle" || int.status === "Planifiée" || int.status === "En cours";
      if (isPending && int.dateIntervention < TODAY) {
        list.push({
          id: `r-${int.id}`,
          category: "Retard",
          title: `Entretien en retard : ${int.id}`,
          desc: `"${int.title}" planifié le ${int.dateIntervention.split("-").reverse().join("/")} n'a pas encore été validé.`,
          severity: int.priority === "Critique" || int.priority === "Haute" ? "critical" : "warning"
        });
      }
    });

    // Regulatory Inspections next warning (Contrôles réglementaires)
    compliance.forEach((comp) => {
      const isExpired = comp.nextInspectionDate < TODAY;
      const isClose = !isExpired && (comp.nextInspectionDate < "2026-08-21" || comp.status === "En attente d'action"); // close within 30 days
      
      if (comp.status === "Non conforme" || isExpired) {
        list.push({
          id: `c-crit-${comp.id}`,
          category: "Réglementaire",
          title: `Contrôle Réglementaire Expiré ou Non-Conforme !`,
          desc: `L'autorisation de fonctionnement de l'équipement ${comp.equipmentCode} (${comp.title}) est expirée ou non-conforme.`,
          severity: "critical"
        });
      } else if (isClose) {
        list.push({
          id: `c-${comp.id}`,
          category: "Réglementaire",
          title: `Contrôle Réglementaire Imminent : ${comp.equipmentCode}`,
          desc: `Le matériel ${comp.equipmentCode} doit être inspecté ou nécessite des actions correctives sous peu (Organisme: ${comp.bodyName}).`,
          severity: "warning"
        });
      }
    });

    // Financial budget consumption alert
    const consumptionRate = (metrics.totalSpent / budget.totalBudget) * 100;
    if (consumptionRate > 90) {
      list.push({
        id: "b-exhausted",
        category: "Budget",
        title: "Budget de GMAO presque épuisé !",
        desc: `STA Tunisie a consommé ${consumptionRate.toFixed(1)}% de son enveloppe budgétaire annuelle.`,
        severity: "critical"
      });
    } else if (consumptionRate > 75) {
      list.push({
        id: "b-warn",
        category: "Budget",
        title: "Alerte de consommation budgétaire",
        desc: `Le budget de maintenance annuel est utilisé à hauteur de ${consumptionRate.toFixed(1)}%.`,
        severity: "warning"
      });
    }

    return list;
  }, [equipments, filteredInterventions, spareParts, compliance, metrics]);

  // 3. Interventions in progress
  const activeInterventionsList = useMemo(() => {
    return interventions
      .filter((int) => int.status === "En cours" || int.status === "Nouvelle" || int.status === "Planifiée")
      .slice(0, 5);
  }, [interventions]);

  // 4. Critical equipments current statuses
  const criticalEquipmentsList = useMemo(() => {
    return equipments
      .filter((eq) => eq.critical || eq.criticite === "A - Critique")
      .slice(0, 4);
  }, [equipments]);

  // 5. Chart 1 Data: Cost over time months
  const monthlyCostData = useMemo(() => {
    // Collect stats by months of 2026
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const stats = months.map((m) => ({ name: m, Main_Oeuvre: 0, Total: 0 }));

    interventions.forEach((int) => {
      const dateParts = int.dateIntervention.split("-");
      if (dateParts[0] === "2026") {
        const monthIdx = Number(dateParts[1]) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          stats[monthIdx].Main_Oeuvre += int.costLabor || 0;
          stats[monthIdx].Total += int.costLabor || 0;
        }
      }
    });

    // Fill in mock values for future months to show nice full-year projections
    stats.forEach((st, idx) => {
      if (idx > 6 && st.Total === 0) {
        // July is index 6. For future months, seed lightweight simulated curves
        st.Main_Oeuvre = Math.round(1200 + Math.cos(idx) * 400);
        st.Total = st.Main_Oeuvre;
      }
    });

    return stats;
  }, [interventions]);

  // 6. Chart 2 Data: Type distribution
  const typeDistributionData = useMemo(() => {
    return [
      { name: "Préventif", value: metrics.preventiveCount, color: "#2563eb" },
      { name: "Correctif (Panne)", value: metrics.correctiveCount, color: "#cc0000" },
      { name: "Réglementaire", value: metrics.regulatoryCount, color: "#9333ea" }
    ];
  }, [metrics]);

  // Download Handlers
  const handleDownloadExcel = () => {
    generateSTAExcelFile(equipments, interventions, spareParts, contracts, vendors, compliance, budget);
  };

  const handleDownloadJson = () => {
    const fullData = {
      equipments,
      interventions,
      spareParts,
      compliance,
      budget,
      purchaseRequests,
      contracts,
      vendors,
      exportDate: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullData, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `GMAO_STA_Chery_Donnees_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCsv = () => {
    const headers = ["ID", "Code_Equipement", "Type", "Titre", "Date", "Technicien", "Statut", "Priorite", "Cout_MO", "Cout_Pieces"];
    const rows = interventions.map((i) => [
      i.id,
      i.equipmentCode,
      i.type,
      `"${(i.title || "").replace(/"/g, '""')}"`,
      i.dateIntervention,
      `"${(i.technician || "").replace(/"/g, '""')}"`,
      i.status,
      i.priority || "Moyenne",
      i.costLabor || 0,
      i.costParts || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GMAO_STA_Interventions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* 1. Brand Greeting Banner with Period Filter & Omnibar Search */}
      <div className="bg-neutral-800 text-white rounded-2xl p-6 shadow-md border border-neutral-700 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-chery-red text-white text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
              STA CHERY TUNISIE
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">Terminal Atelier GMAO v3.1</span>
          </div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-chery-red animate-pulse" />
            Tableau de Bord de Performance Maintenance
          </h1>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Suivi en temps réel de la conformité réglementaire, de la disponibilité opérationnelle du parc machines et du respect des budgets d'atelier.
          </p>
        </div>

        {/* Dynamic Period Filter & Omnibar Search Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 w-full lg:w-auto">
          {/* Period Selector */}
          <div className="bg-neutral-900/90 border border-neutral-700 p-1 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setPeriodFilter("month")}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                periodFilter === "month" ? "bg-chery-red text-white shadow-sm" : "text-neutral-400 hover:text-white"
              }`}
            >
              Ce Mois
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter("quarter")}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                periodFilter === "quarter" ? "bg-chery-red text-white shadow-sm" : "text-neutral-400 hover:text-white"
              }`}
            >
              Trimestre
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter("year")}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                periodFilter === "year" ? "bg-chery-red text-white shadow-sm" : "text-neutral-400 hover:text-white"
              }`}
            >
              Année 2026
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                periodFilter === "all" ? "bg-chery-red text-white shadow-sm" : "text-neutral-400 hover:text-white"
              }`}
            >
              Tout
            </button>
          </div>

          {/* Omnibar Search Box */}
          <div className="relative min-w-[220px]">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Recherche rapide (Matériel, Bon, Pièce)..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-chery-red transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Omnibar Search Results Dropdown */}
            {searchQuery.trim() !== "" && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-2xl p-3 shadow-2xl z-50 space-y-3 text-xs max-h-80 overflow-y-auto">
                {searchResults.equipments.length === 0 &&
                searchResults.interventions.length === 0 &&
                searchResults.spareParts.length === 0 ? (
                  <p className="text-neutral-400 text-center py-2 text-[11px]">Aucun résultat trouvé pour "{searchQuery}"</p>
                ) : (
                  <>
                    {searchResults.equipments.length > 0 && (
                      <div>
                        <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block mb-1">
                          Équipements
                        </span>
                        <div className="space-y-1">
                          {searchResults.equipments.map((eq) => (
                            <button
                              key={eq.code}
                              onClick={() => {
                                onNavigate("equipements");
                                setSearchQuery("");
                              }}
                              className="w-full text-left p-1.5 hover:bg-neutral-800 rounded-lg flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-mono font-bold text-white">{eq.code}</span>
                              <span className="text-neutral-400 text-[10px] truncate max-w-[120px]">{eq.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.interventions.length > 0 && (
                      <div>
                        <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block mb-1">
                          Interventions
                        </span>
                        <div className="space-y-1">
                          {searchResults.interventions.map((i) => (
                            <button
                              key={i.id}
                              onClick={() => {
                                onNavigate("interventions");
                                setSearchQuery("");
                              }}
                              className="w-full text-left p-1.5 hover:bg-neutral-800 rounded-lg flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-mono font-bold text-chery-red">{i.id}</span>
                              <span className="text-neutral-300 text-[10px] truncate max-w-[130px]">{i.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.spareParts.length > 0 && (
                      <div>
                        <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block mb-1">
                          Stock & Pièces
                        </span>
                        <div className="space-y-1">
                          {searchResults.spareParts.map((sp) => (
                            <button
                              key={sp.code}
                              onClick={() => {
                                onNavigate("magasin");
                                setSearchQuery("");
                              }}
                              className="w-full text-left p-1.5 hover:bg-neutral-800 rounded-lg flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-mono font-bold text-amber-400">{sp.code}</span>
                              <span className="text-neutral-300 text-[10px] truncate max-w-[120px]">{sp.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top-tier Interactive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Availability Card */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold">Disponibilité Parc</span>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-neutral-800 font-mono tracking-tight">
              {metrics.avgAvailability}%
            </span>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metrics.avgAvailability > 90 ? "bg-green-500" : metrics.avgAvailability > 80 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${metrics.avgAvailability}%` }}
              />
            </div>
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block font-medium">
            Moyenne sur {metrics.totalEquipments} machines actives
          </span>
        </div>

        {/* MTBF Card */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold">Reliabilité (MTBF)</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-neutral-800 font-mono tracking-tight">
              {metrics.mtbf} hrs
            </span>
            <span className="text-xs text-green-600 font-bold block mt-1">
              +14h par rapport au mois passé
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block font-medium">
            Temps moyen de bon fonctionnement
          </span>
        </div>

        {/* MTTR Card */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold">Réparabilité (MTTR)</span>
            <Wrench className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-neutral-800 font-mono tracking-tight">
              {metrics.mttr} hrs
            </span>
            <span className="text-xs text-red-600 font-bold block mt-1">
              -12 min cible constructeur
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block font-medium">
            Durée moyenne d'arrêt curative
          </span>
        </div>

        {/* Financial Spent Card */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold">Coût Cumulé Main d'Œuvre</span>
            <DollarSign className="h-4 w-4 text-chery-red" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-black text-neutral-800 font-mono tracking-tight">
              {(metrics.totalSpent ?? 0).toLocaleString()} TND
            </span>
            <span className="text-[9px] text-neutral-400 block mt-1 font-mono">
              Total M.O d'interventions
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block font-medium">
            Facturation de l'exercice 2026
          </span>
        </div>

        {/* Preventive completion rate card */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold">Taux de Préventif</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-neutral-800 font-mono tracking-tight">
              {metrics.prevRate}%
            </span>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${metrics.prevRate}%` }} />
            </div>
          </div>
          <span className="text-[9px] text-neutral-400 mt-2 block font-medium">
            Taux d'exécution des préventifs
          </span>
        </div>
      </div>

      {/* 3. Alerts Section (Maintenances en retard, contrôles Apave...) */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
          <AlertOctagon className="h-4 w-4 text-chery-red animate-pulse" />
          Centre d'Alertes Actives & Contrôles Réglementaires ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold block">Aucune alerte en suspens</span>
              <p className="text-[11px] text-green-600 mt-0.5">Le parc d'équipements de la STA respecte toutes les périodicités et budgets.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(showAllAlerts ? alerts : alerts.slice(0, 3)).map((al) => (
                <div
                  key={al.id}
                  className={`p-3.5 rounded-xl border text-xs flex gap-3 items-start justify-between transition-all ${
                    al.severity === "critical"
                      ? "bg-red-50/60 border-red-100 text-red-950"
                      : "bg-amber-50/60 border-amber-100 text-amber-950"
                  }`}
                >
                  <div className="flex gap-2.5 items-start">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${al.severity === "critical" ? "bg-red-100 text-chery-red" : "bg-amber-100 text-amber-600"}`}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black tracking-tight">{al.title}</span>
                        <span className={`text-[8px] px-1 rounded uppercase font-black font-mono ${al.severity === "critical" ? "bg-red-100 text-chery-red" : "bg-amber-100 text-amber-700"}`}>
                          {al.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
                        {al.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {alerts.length > 3 && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs border border-neutral-200"
                >
                  {showAllAlerts ? (
                    <>
                      <span>Réduire l'affichage</span>
                      <ChevronUp className="h-4 w-4 text-neutral-500" />
                    </>
                  ) : (
                    <>
                      <span>Afficher la suite ({alerts.length - 3} alerte{alerts.length - 3 > 1 ? "s" : ""} ancienne{alerts.length - 3 > 1 ? "s" : ""})</span>
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Tableau Synthèse de Maintenance */}
      <FinancialManager
        budget={budget}
        interventions={interventions}
        purchaseRequests={purchaseRequests}
        contracts={contracts}
        spareParts={spareParts}
        equipments={equipments}
        vendors={vendors}
        onUpdateBudgetAllocation={onUpdateBudgetAllocation || (() => {})}
        currentUserRole={currentUserRole}
      />

      {/* 5. Bottom Section: Interventions en cours & Équipements critiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Interventions en cours Table (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
            <div>
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Interventions actives en cours d'exécution</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">Dernières tâches mobilisant activement nos techniciens STA.</p>
            </div>
            <button
              onClick={() => onNavigate("interventions")}
              className="text-xs font-bold text-chery-red flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              Voir tout le registre
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            {activeInterventionsList.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <Wrench className="h-8 w-8 text-neutral-300 mx-auto mb-1" />
                <p className="font-bold">Aucune intervention active à cette seconde</p>
              </div>
            ) : (
              <table className="w-full text-left font-medium">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-bold text-[10px] uppercase">
                    <th className="pb-2">Bon ID</th>
                    <th className="pb-2">Équipement</th>
                    <th className="pb-2">Désignation</th>
                    <th className="pb-2">Technicien</th>
                    <th className="pb-2 text-center">Priorité</th>
                    <th className="pb-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {activeInterventionsList.map((int) => (
                    <tr key={int.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 font-mono font-bold text-neutral-400">{int.id}</td>
                      <td className="py-2.5 font-mono font-bold text-neutral-800">{int.equipmentCode}</td>
                      <td className="py-2.5 font-bold text-neutral-700">{int.title}</td>
                      <td className="py-2.5 text-neutral-500">{int.technician}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                          int.priority === "Critique" ? "bg-red-50 text-chery-red" : "bg-amber-50 text-amber-700"
                        }`}>
                          {int.priority || "Moyenne"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-neutral-400">{int.dateIntervention.split("-").reverse().slice(0,2).join("/")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: High-Criticality equipments status grid */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
            <div>
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Équipements Hautement Critiques</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">Surveillance continue des actifs classe A.</p>
            </div>
            <button
              onClick={() => onNavigate("equipements")}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-800 flex items-center gap-0.5 cursor-pointer"
            >
              Fiches
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {criticalEquipmentsList.map((eq) => {
              const firstPhoto = eq.photos && eq.photos.length > 0 ? eq.photos[0] : null;
              return (
                <div key={eq.code} className="flex justify-between items-center p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={eq.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover border border-neutral-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                        <Wrench className="h-4 w-4 text-neutral-400 stroke-[1.8]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-neutral-800">{eq.code}</span>
                        <span className="text-[9px] text-red-600 font-extrabold bg-red-50 px-1 rounded uppercase font-mono">Classe A</span>
                      </div>
                      <span className="font-bold text-neutral-600 block mt-0.5 text-[11px] truncate max-w-[150px]">{eq.name}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      eq.status === "Opérationnel"
                        ? "bg-green-50 text-green-700"
                        : eq.status === "Dégradé"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-chery-red animate-pulse"
                    }`}>
                      {eq.status}
                    </span>
                    <span className="text-[9px] text-neutral-400 block mt-1 font-mono">MTBF: {eq.mtbfTargetHours}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📥 Téléchargement des Données GMAO (Bouton en bas du Tableau de Bord) */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 rounded-3xl p-6 border border-neutral-700 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-chery-red/20 border border-chery-red/40 rounded-2xl text-chery-red shrink-0">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">
                Télécharger les Données de la GMAO
              </h3>
              <p className="text-xs text-neutral-400">
                Exportez le parc d'équipements, le registre d'interventions, les achats et les budgets au format Excel (.xlsx) ou JSON.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Button 1: Excel */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Télécharger l'Archive Excel (.xlsx)</span>
          </button>

          {/* Button 2: JSON Backup */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center justify-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 font-bold text-xs py-3.5 px-4 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Database className="h-4 w-4 text-blue-400" />
            <span>Sauvegarde Complète (JSON)</span>
          </button>

          {/* Button 3: CSV Quick Export */}
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center justify-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 font-bold text-xs py-3.5 px-4 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileCode className="h-4 w-4 text-amber-400" />
            <span>Export CSV Interventions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
