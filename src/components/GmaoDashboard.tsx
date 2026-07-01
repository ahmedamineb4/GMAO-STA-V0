/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
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
  LineChart,
  Line
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
  Info
} from "lucide-react";
import { Equipment, Intervention, SparePart, ComplianceCheck, BudgetYear, Workshop } from "../types";

interface GmaoDashboardProps {
  equipments: Equipment[];
  interventions: Intervention[];
  spareParts: SparePart[];
  compliance: ComplianceCheck[];
  budget: BudgetYear;
  onNavigate: (tab: string) => void;
}

export default function GmaoDashboard({
  equipments,
  interventions,
  spareParts,
  compliance,
  budget,
  onNavigate
}: GmaoDashboardProps) {
  // Current static date for comparisons (given as July 2026 in environment context)
  const TODAY = "2026-07-01";

  // 1. Calculations & Metrics
  const metrics = useMemo(() => {
    // Exclude "Hors Service" (Out of Service) equipments from availability and reliability KPIs
    const activeEquipments = equipments.filter((eq) => eq.status !== "Hors Service");
    const totalEquipments = activeEquipments.length;

    // Availability calculation
    // Opérationnel = 100%, Dégradé = 90%, En Maintenance = 30%, En Panne = 0%
    const availSum = activeEquipments.reduce((acc, eq) => {
      if (eq.status === "Opérationnel") return acc + 100;
      if (eq.status === "Dégradé") return acc + 90;
      if (eq.status === "En Maintenance") return acc + 30;
      return acc; // En Panne = 0
    }, 0);
    const avgAvailability = totalEquipments ? Math.round(availSum / totalEquipments) : 95;

    // MTTR: Average duration of completed Corrective interventions
    const correctives = interventions.filter(
      (int) => int.type === "Correctif" && int.status === "Terminé"
    );
    const totalCorrectiveHours = correctives.reduce((acc, c) => acc + c.durationHours, 0);
    const mttr = correctives.length ? (totalCorrectiveHours / correctives.length).toFixed(1) : "3.5";

    // MTBF: Average of target MTBFs for operational/active equipments as an approximation
    const mtbf = activeEquipments.length
      ? Math.round(activeEquipments.reduce((acc, eq) => acc + eq.mtbfTargetHours, 0) / activeEquipments.length)
      : 1200;

    // Preventive completion rate: completed preventives / (completed + planned preventives)
    const preventives = interventions.filter((int) => int.type === "Préventif");
    const completedPrev = preventives.filter((int) => int.status === "Terminé").length;
    const activePrev = preventives.filter((int) => int.status === "Planifié" || int.status === "En cours").length;
    const prevRate = completedPrev + activePrev > 0
      ? Math.round((completedPrev / (completedPrev + activePrev)) * 100)
      : 85;

    // Financial calculations
    const totalSpent = interventions
      .filter((int) => int.status === "Terminé" || int.status === "En cours")
      .reduce((acc, int) => acc + int.costParts + int.costLabor, 0);

    const budgetRemaining = budget.totalBudget - totalSpent;

    return {
      avgAvailability,
      mttr,
      mtbf,
      prevRate,
      totalSpent,
      budgetRemaining,
      totalEquipments
    };
  }, [equipments, interventions, budget]);

  // 2. Generate Real-time Alerts
  const alerts = useMemo(() => {
    const list: Array<{
      id: string;
      category: "Pneu" | "Stock" | "Garantie" | "Budget" | "Réglementaire" | "Panne";
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
          desc: `${eq.name} (${eq.workshop}) est actuellement hors-service.`,
          severity: "critical"
        });
      }
    });

    // Low stock alert
    spareParts.forEach((part) => {
      if (part.currentStock <= part.reorderPoint) {
        list.push({
          id: `s-${part.code}`,
          category: "Stock",
          title: `Stock Bas : ${part.code}`,
          desc: `La pièce "${part.name}" est à un stock de ${part.currentStock} (Seuil d'alerte: ${part.reorderPoint}).`,
          severity: "warning"
        });
      }
    });

    // Expiring Warranty
    equipments.forEach((eq) => {
      const warrantyDate = new Date(eq.warrantyEnd);
      const todayDate = new Date(TODAY);
      const diffTime = warrantyDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Expired but maybe we only show if it was within last 3 months
        if (Math.abs(diffDays) < 180 && eq.critical) {
          list.push({
            id: `w-exp-${eq.code}`,
            category: "Garantie",
            title: `Garantie Expirée : ${eq.code}`,
            desc: `La garantie de ${eq.name} a expiré le ${eq.warrantyEnd}.`,
            severity: "info"
          });
        }
      } else if (diffDays <= 45) {
        list.push({
          id: `w-soon-${eq.code}`,
          category: "Garantie",
          title: `Échéance Garantie Proche : ${eq.code}`,
          desc: `Garantie de ${eq.name} expire dans ${diffDays} jours (${eq.warrantyEnd}).`,
          severity: "warning"
        });
      }
    });

    // Budget overruns
    Object.keys(budget.spentByWorkshop).forEach((ws) => {
      const wName = ws as Workshop;
      const allocated = budget.allocatedByWorkshop[wName];
      const spent = budget.spentByWorkshop[wName];
      if (spent > allocated) {
        list.push({
          id: `b-${wName}`,
          category: "Budget",
          title: `Budget Dépassé : ${wName}`,
          desc: `Dépenses à ${spent.toLocaleString()} TND contre un alloué de ${allocated.toLocaleString()} TND.`,
          severity: "critical"
        });
      }
    });

    // Regulatory Overdue
    compliance.forEach((cmp) => {
      const nextDate = new Date(cmp.nextInspectionDate);
      const todayDate = new Date(TODAY);
      if (nextDate < todayDate) {
        list.push({
          id: `c-${cmp.id}`,
          category: "Réglementaire",
          title: `Contrôle Échu : ${cmp.title}`,
          desc: `Échéance dépassée pour ${cmp.equipmentCode} (${cmp.nextInspectionDate}).`,
          severity: "critical"
        });
      } else {
        const diffTime = nextDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          list.push({
            id: `c-soon-${cmp.id}`,
            category: "Réglementaire",
            title: `Contrôle imminent : ${cmp.title}`,
            desc: `À inspecter dans ${diffDays} jours par ${cmp.bodyName}.`,
            severity: "warning"
          });
        }
      }
    });

    return list;
  }, [equipments, spareParts, compliance, budget]);

  // 3. Charts Data Preparation
  // A. Spent vs Allocated by workshop
  const budgetChartData = useMemo(() => {
    return Object.keys(budget.allocatedByWorkshop).map((ws) => ({
      name: ws.replace("Atelier ", "").replace("Magasin ", ""),
      Alloué: budget.allocatedByWorkshop[ws as Workshop],
      Consommé: budget.spentByWorkshop[ws as Workshop]
    }));
  }, [budget]);

  // B. Top 5 Costliest equipments in repairs
  const topCostlyEquipments = useMemo(() => {
    const costMap: Record<string, { code: string; name: string; cost: number }> = {};
    equipments.forEach((e) => {
      costMap[e.code] = { code: e.code, name: e.name, cost: 0 };
    });

    interventions.forEach((int) => {
      if (costMap[int.equipmentCode]) {
        costMap[int.equipmentCode].cost += int.costParts + int.costLabor;
      }
    });

    return Object.values(costMap)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map((item) => ({
        code: item.code,
        name: item.name.length > 25 ? `${item.name.substring(0, 22)}...` : item.name,
        Coût: item.cost
      }));
  }, [equipments, interventions]);

  // C. Interventions count by type for pie chart
  const interventionDistribution = useMemo(() => {
    const typesCount = { Correctif: 0, Préventif: 0, Réglementaire: 0 };
    interventions.forEach((int) => {
      typesCount[int.type] = (typesCount[int.type] || 0) + 1;
    });
    return [
      { name: "Correctif", value: typesCount.Correctif, color: "#D11A2A" },
      { name: "Préventif", value: typesCount.Préventif, color: "#475569" },
      { name: "Réglementaire", value: typesCount.Réglementaire, color: "#0ea5e9" }
    ];
  }, [interventions]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-red-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-neutral-800">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-chery-red via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2 text-chery-red bg-red-950/60 border border-red-900/60 w-fit px-3 py-1 rounded-full text-xs font-semibold mb-2 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-pulse-subtle" />
              Pilotage Excellence Chery Tunisie
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Tableau de Bord de Maintenance
            </h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
              Bienvenue M. <strong>Ahmed Amine Ben Salah</strong>. Suivi complet des indices de fiabilité,
              KPIs de disponibilité technique, suivi budgétaire et génération automatique du modèle Excel pour STA Tunisie.
            </p>
          </div>
          <button
            onClick={() => onNavigate("excel")}
            className="flex items-center gap-2 bg-chery-red hover:bg-chery-dark text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-red-900/20 transition-all text-sm group self-start md:self-auto cursor-pointer"
          >
            Générer le Classeur Excel
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-green-50 text-green-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Disponibilité Globale
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {metrics.avgAvailability}%
            </span>
            <span className="text-xs text-green-600 font-medium flex items-center mt-0.5">
              Target: 95%
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-chery-red rounded-xl">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              MTTR Moyen
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {metrics.mttr} h
            </span>
            <span className="text-xs text-red-600 font-medium flex items-center mt-0.5">
              Cible: &lt; 4.0h (Diagnostic rapide)
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Réalisation Préventive
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {metrics.prevRate}%
            </span>
            <span className="text-xs text-blue-600 font-medium flex items-center mt-0.5">
              Taux d'accomplissement
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-neutral-100 text-neutral-700 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Budget Consommé
            </span>
            <span className="text-xl font-bold font-mono tracking-tight text-neutral-800">
              {metrics.totalSpent.toLocaleString()} TND
            </span>
            <span className="text-xs text-neutral-500 font-medium flex items-center mt-0.5">
              Sur {budget.totalBudget.toLocaleString()} TND alloué
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content: Charts & Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts: Left & Center (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Budget VS Consommé par Service */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-800">
                  Suivi Budgétaire par Service (2026)
                </h3>
                <p className="text-xs text-neutral-500">
                  Comparatif en TND entre l'alloué et le consommé par atelier
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-medium text-neutral-600">
                  <span className="h-2.5 w-2.5 rounded-xs bg-slate-500 inline-block"></span>
                  Alloué
                </span>
                <span className="flex items-center gap-1 font-medium text-neutral-600">
                  <span className="h-2.5 w-2.5 rounded-xs bg-chery-red inline-block"></span>
                  Consommé
                </span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", color: "#fff", borderRadius: "10px", fontSize: "12px" }}
                  />
                  <Bar dataKey="Alloué" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Consommé" fill="#D11A2A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 2: Top Costly Assets */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
              <h3 className="text-base font-bold text-neutral-800 mb-1">
                Top 5 Équipements les plus coûteux
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Cumul des coûts de pièces et main d'œuvre en TND
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCostlyEquipments} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="code" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", color: "#fff", borderRadius: "10px", fontSize: "11px" }}
                      formatter={(value: any) => [`${value} TND`, "Coût"]}
                    />
                    <Bar dataKey="Coût" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Distribution of Interventions */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-800 mb-1">
                  Distribution des Interventions
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                  Répartition par type (Correctif, Préventif, Réglementaire)
                </p>
              </div>
              <div className="flex items-center justify-around gap-2">
                <div className="h-36 w-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={interventionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {interventionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                  {interventionDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
                      <span className="text-neutral-600 font-medium">{entry.name}:</span>
                      <span className="font-bold text-neutral-800">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Alerts Feed: Right (Col span 1) */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-5 flex flex-col h-[610px]">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-chery-red" />
                Alertes de Maintenance
              </h3>
              <p className="text-xs text-neutral-500">
                {alerts.length} anomalies ou échéances en cours
              </p>
            </div>
            <span className="bg-red-50 text-chery-red text-xs font-semibold px-2 py-1 rounded-full">
              {alerts.filter((a) => a.severity === "critical").length} critiques
            </span>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 text-neutral-400">
                <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                <p className="text-sm font-semibold text-neutral-600">Tout est sous contrôle</p>
                <p className="text-xs">Aucune alerte active détectée sur la concession.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs transition-all relative ${
                    alert.severity === "critical"
                      ? "bg-red-50/50 border-red-100 text-neutral-800"
                      : alert.severity === "warning"
                      ? "bg-amber-50/50 border-amber-100 text-neutral-800"
                      : "bg-blue-50/30 border-blue-100 text-neutral-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide text-[9px] ${
                        alert.severity === "critical"
                          ? "bg-red-200 text-red-900"
                          : alert.severity === "warning"
                          ? "bg-amber-200 text-amber-900"
                          : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {alert.category}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {alert.severity === "critical" ? "Critique" : alert.severity === "warning" ? "Attention" : "Info"}
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-800">{alert.title}</h4>
                  <p className="text-neutral-500 mt-1 leading-relaxed">{alert.desc}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4 flex gap-2">
            <button
              onClick={() => onNavigate("inventaire")}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-center text-xs py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Voir le Stock
            </button>
            <button
              onClick={() => onNavigate("interventions")}
              className="flex-1 bg-chery-red hover:bg-chery-dark text-white text-center text-xs py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Lancer un Correctif
            </button>
          </div>
        </div>
      </div>

      {/* Workshop Performance Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-5">
        <h3 className="text-base font-bold text-neutral-800 mb-1">
          Comparateur de Performance des Ateliers Chery STA
        </h3>
        <p className="text-xs text-neutral-500 mb-4">
          Indicateurs de fiabilité, taux de prévention, budget et pannes en cours par service
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Service / Atelier</th>
                <th className="py-3 px-4 text-center">Équipements</th>
                <th className="py-3 px-4 text-center">Disponibilité moy.</th>
                <th className="py-3 px-4 text-center">Pannes en cours</th>
                <th className="py-3 px-4 text-center">Interventions (12m)</th>
                <th className="py-3 px-4 text-right">Budget Alloué</th>
                <th className="py-3 px-4 text-right">Dépenses Cumulées</th>
                <th className="py-3 px-4 text-center">Alerte Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium">
              {Object.keys(budget.allocatedByWorkshop).map((workshopName) => {
                const wName = workshopName as Workshop;
                const eqInWorkshop = equipments.filter((e) => e.workshop === wName);
                const activeEqInWorkshop = eqInWorkshop.filter((e) => e.status !== "Hors Service");
                const countEq = eqInWorkshop.length;

                // Avg availability of workshop (excluding "Hors Service" from calculation)
                const totalEq = activeEqInWorkshop.length;
                const activeEqCount = activeEqInWorkshop.filter((e) => e.status === "Opérationnel").length;
                const degradedEqCount = activeEqInWorkshop.filter((e) => e.status === "Dégradé").length;
                const mtCount = activeEqInWorkshop.filter((e) => e.status === "En Maintenance").length;
                const sumAvail = (activeEqCount * 100) + (degradedEqCount * 90) + (mtCount * 30);
                const avgAvail = totalEq ? Math.round(sumAvail / totalEq) : 100;

                const activeFailures = eqInWorkshop.filter((e) => e.status === "En Panne").length;

                const interventionsCount = interventions.filter(
                  (i) => eqInWorkshop.some((e) => e.code === i.equipmentCode)
                ).length;

                const allocated = budget.allocatedByWorkshop[wName];
                const spent = budget.spentByWorkshop[wName];
                const overBudget = spent > allocated;

                return (
                  <tr key={wName} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-800">{wName}</td>
                    <td className="py-3 px-4 text-center text-neutral-600">{countEq}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-1 rounded-sm ${
                          avgAvail >= 95
                            ? "text-green-700 bg-green-50"
                            : avgAvail >= 85
                            ? "text-amber-700 bg-amber-50"
                            : "text-red-700 bg-red-50 animate-pulse-subtle"
                        }`}
                      >
                        {avgAvail}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {activeFailures > 0 ? (
                        <span className="bg-red-500 text-white font-bold font-mono px-2 py-0.5 rounded-full text-[10px]">
                          {activeFailures} PANNE
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-neutral-600">{interventionsCount}</td>
                    <td className="py-3 px-4 text-right font-mono text-neutral-700">
                      {allocated.toLocaleString()} TND
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-neutral-800">
                      {spent.toLocaleString()} TND
                    </td>
                    <td className="py-3 px-4 text-center">
                      {overBudget ? (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded-sm text-[10px] font-semibold">
                          Dépassement
                        </span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-sm text-[10px] font-semibold">
                          Correct
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
