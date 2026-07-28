/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  BookOpen,
  HelpCircle,
  CheckCircle,
  Table,
  Cpu,
  Info,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Zap,
  Sparkles,
  BarChart2,
  TrendingDown,
  AlertTriangle,
  History,
  TrendingUp,
  LineChart as LineIcon,
  Search,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";
import { generateSTAExcelFile } from "../utils/excelGenerator";
import { Equipment, Intervention, SparePart, MaintenanceContract, BudgetYear, ComplianceCheck, Vendor } from "../types";

interface ExcelBlueprintProps {
  equipments: Equipment[];
  interventions: InterventionsPropType[]; // Backward compatible
  spareParts?: SparePart[];
  contracts: MaintenanceContract[];
  vendors: Vendor[];
  compliance: ComplianceCheck[];
  budget: BudgetYear;
}

type InterventionsPropType = any;

export default function ExcelBlueprint({
  equipments,
  interventions,
  spareParts,
  contracts,
  vendors,
  compliance,
  budget
}: ExcelBlueprintProps) {
  // Main sub-views inside the Reports tab:
  // "analytics" = Live Reports & Analytics
  // "blueprint" = Excel Specifications & Guide
  const [reportSubTab, setReportSubTab] = useState<"analytics" | "blueprint">("analytics");
  const [activeTab, setActiveTab] = useState<string>("equipements");
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  // Filter for monthly report details
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // July is default (6 is July, 0-indexed)

  const MONTHS_LIST_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const handleDownload = () => {
    generateSTAExcelFile(equipments, interventions, undefined, contracts, vendors, compliance, budget);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // --- ANALYTICS CALCULATIONS ---

  // 1. Monthly Report calculations for selectedMonth
  const monthlyMetrics = useMemo(() => {
    const monthNumStr = String(selectedMonth + 1).padStart(2, "0");
    const monthInterventions = interventions.filter((int) => {
      const parts = int.dateIntervention.split("-");
      return parts[0] === "2026" && parts[1] === monthNumStr;
    });

    const preventives = monthInterventions.filter((i) => i.type === "Préventif");
    const correctives = monthInterventions.filter((i) => i.type === "Correctif");
    const regulatory = monthInterventions.filter((i) => i.type === "Réglementaire");

    const costLabor = monthInterventions.reduce((sum, i) => sum + (i.costLabor || 0), 0);
    const totalCost = costLabor;

    return {
      interventionsCount: monthInterventions.length,
      preventivesCount: preventives.length,
      correctivesCount: correctives.length,
      regulatoryCount: regulatory.length,
      costLabor,
      totalCost
    };
  }, [interventions, selectedMonth]);

  // 2. Frequency of failures by Equipment
  const failureFrequencyList = useMemo(() => {
    const counts: Record<string, number> = {};
    // Seed all equipments with 0
    equipments.forEach((eq) => {
      counts[eq.code] = 0;
    });

    // Count corrective interventions
    interventions.forEach((int) => {
      if (int.type === "Correctif" && counts[int.equipmentCode] !== undefined) {
        counts[int.equipmentCode] += 1;
      }
    });

    return Object.entries(counts)
      .map(([code, count]) => {
        const eqName = equipments.find((e) => e.code === code)?.name || "N/A";
        return { code, count, eqName };
      })
      .sort((a, b) => b.count - a.count);
  }, [equipments, interventions]);

  // 3. Availability by Equipment Details
  const availabilityDetailsList = useMemo(() => {
    return equipments.map((eq) => {
      let score = 100;
      if (eq.status === "Opérationnel") score = 100;
      else if (eq.status === "Dégradé") score = 90;
      else if (eq.status === "En Maintenance") score = 40;
      else if (eq.status === "En Panne") score = 0;

      return {
        code: eq.code,
        name: eq.name,
        workshop: eq.workshop,
        status: eq.status,
        score
      };
    }).sort((a, b) => a.score - b.score);
  }, [equipments]);

  // 4. Budget vs Spent Chart Data
  const budgetChartData = useMemo(() => {
    return Object.keys(budget.allocatedByWorkshop).map((wKey) => {
      const allocated = budget.allocatedByWorkshop[wKey] || 0;
      const spent = budget.spentByWorkshop[wKey] || 0;
      return {
        name: wKey.replace("Atelier ", "Atl. "),
        Alloué: allocated,
        Consommé: spent
      };
    });
  }, [budget]);

  const sheetsSpecs = [
    {
      id: "equipements",
      name: "1. EQUIPEMENTS",
      role: "Inventaire et fiche d'identité technique de l'ensemble du parc machines et outillages de la concession.",
      dropdowns: [
        { name: "Atelier / Service", values: ["Service Rapide", "Atelier Mécanique", "Atelier Diagnostic", "Carrosserie", "Lavage", "Réception Après-Vente", "Magasin Pièces de Rechange", "Maintenance Bâtiment"] },
        { name: "Statut", values: ["Opérationnel", "Dégradé", "En Maintenance", "En Panne"] }
      ],
      columns: [
        { col: "A", name: "Code Équipement", type: "Texte unique", validation: "Longueur de texte 4-10 (ex: EQ-SR-01)", formula: "Saisie manuelle" },
        { col: "B", name: "Nom de l'Équipement", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "C", name: "Atelier / Service", type: "Texte (Liste)", validation: "Validation par liste déroulante des services", formula: "Liste déroulante" },
        { col: "D", name: "Statut de Fonctionnement", type: "Texte (Liste)", validation: "Validation par liste déroulante des statuts", formula: "Liste déroulante" },
        { col: "E", name: "Date d'Achat", type: "Date", validation: "Format Date (JJ/MM/AAAA)", formula: "Saisie manuelle" },
        { col: "F", name: "Date Fin Garantie", type: "Date", validation: "Format Date (JJ/MM/AAAA)", formula: "Saisie manuelle" },
        { col: "G", name: "Prix d'Achat (TND)", type: "Décimal", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "H", name: "Localisation", type: "Texte", validation: "Saisie libre (ex: Baie 1)", formula: "Saisie manuelle" },
        { col: "I", name: "Numéro de Série", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "J", name: "Critique ?", type: "Texte (OUI/NON)", validation: "Validation par liste {OUI;NON}", formula: "Saisie manuelle" },
        { col: "K", name: "Dernier Contrôle", type: "Date", validation: "Format Date", formula: "Saisie manuelle" },
        { col: "L", name: "Intervalle (Mois)", type: "Entier", validation: "Nombre supérieur ou égal à 0", formula: "Saisie manuelle" },
        { col: "M", name: "MTBF Cible (h)", type: "Entier", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "N", name: "MTTR Cible (h)", type: "Entier", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "O", name: "Statut Garantie", type: "Texte calculé", validation: "Automatique", formula: '=SI(F2<AUJOURDHUI();"Garantie Expirée";"Sous Garantie")' }
      ],
      formatting: [
        { condition: "Équipement en Panne", formula: '=$D2="En Panne"', style: "Remplissage rouge clair (#FFEBEC), texte rouge foncé (#8F101B)" },
        { condition: "Équipement Critique", formula: '=$J2="OUI"', style: "Bordure épaisse rouge ou texte rouge en gras" },
        { condition: "Garantie Expirée", formula: '=$O2="Garantie Expirée"', style: "Texte gris italique" }
      ]
    },
    {
      id: "interventions",
      name: "2. INTERVENTIONS",
      role: "Historique complet de toutes les opérations de maintenance curative, préventive et réglementaire effectuées sur la concession.",
      dropdowns: [
        { name: "Type", values: ["Préventif", "Correctif", "Réglementaire"] },
        { name: "Statut", values: ["Planifié", "En cours", "Terminé", "Annulé"] }
      ],
      columns: [
        { col: "A", name: "ID Intervention", type: "Texte", validation: "ex: INT-2026-001", formula: "Saisie manuelle" },
        { col: "B", name: "Code Équipement", type: "Texte", validation: "Doit exister dans EQUIPEMENTS (Validation via RECHV)", formula: "Saisie manuelle ou Liste déroulante" },
        { col: "C", name: "Type d'Intervention", type: "Texte (Liste)", validation: "Liste déroulante des types", formula: "Liste déroulante" },
        { col: "D", name: "Titre / Descriptif", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "E", name: "Date d'Intervention", type: "Date", validation: "Format Date (JJ/MM/AAAA)", formula: "Saisie manuelle" },
        { col: "F", name: "Durée (Heures)", type: "Décimal", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "G", name: "Coût Pièces (TND)", type: "Décimal", validation: "Nombre supérieur ou égal à 0", formula: "Saisie manuelle" },
        { col: "H", name: "Coût M.O. (TND)", type: "Décimal", validation: "Nombre supérieur ou égal à 0", formula: "Saisie manuelle" },
        { col: "I", name: "Coût Total (TND)", type: "Décimal calculé", validation: "Automatique", formula: "=G2+H2" },
        { col: "J", name: "Technicien / Prestataire", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "K", name: "Statut du Bon", type: "Texte (Liste)", validation: "Liste déroulante des statuts", formula: "Liste déroulante" },
        { col: "L", name: "Notes de Diagnostic", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" }
      ],
      formatting: [
        { condition: "Intervention en cours", formula: '=$K2="En cours"', style: "Remplissage bleu très clair, texte bleu foncé" },
        { condition: "Intervention Planifiée", formula: '=$K2="Planifié"', style: "Remplissage jaune très clair, texte orange" },
        { condition: "Coût élevé (> 1000 TND)", formula: '=$I2>1000', style: "Texte rouge foncé en gras, avec icône de mise en garde" }
      ]
    },
    {
      id: "compliance",
      name: "4. CONTROLES_REGLEMENTAIRES",
      role: "Registre de conformité légale et suivi des PV d'épreuves obligatoires délivrés par les organismes certifiés.",
      dropdowns: [
        { name: "Statut", values: ["Conforme", "Non conforme", "En attente d'action"] }
      ],
      columns: [
        { col: "A", name: "ID Contrôle", type: "Texte", validation: "ex: CMP-2026-01", formula: "Saisie manuelle" },
        { col: "B", name: "Code Équipement", type: "Texte", validation: "Doit exister dans EQUIPEMENTS", formula: "Saisie manuelle" },
        { col: "C", name: "Libellé du Contrôle", type: "Texte", validation: "Saisie libre (ex: Épreuve hydraulique)", formula: "Saisie manuelle" },
        { col: "D", name: "Organisme Agrée", type: "Texte (Liste)", validation: "Validation Apave, SGS, etc.", formula: "Saisie manuelle" },
        { col: "E", name: "Date de l'Inspection", type: "Date", validation: "Format Date", formula: "Saisie physique" },
        { col: "F", name: "Prochaine Date", type: "Date", validation: "Date d'échéance future", formula: "Calculé ou Saisie" },
        { col: "G", name: "Statut de Conformité", type: "Texte (Liste)", validation: "Liste déroulante de conformité", formula: "Liste déroulante" },
        { col: "H", name: "Référence Rapport", type: "Texte", validation: "Saisie de la réf du PV physique", formula: "Saisie manuelle" },
        { col: "I", name: "Alerte Échéance", type: "Texte calculé", validation: "Automatique", formula: '=SI(F2<AUJOURDHUI();"EXPIRE / REFAIRE";SI(F2<AUJOURDHUI()+30;"Échéance Proche (<30j)";"À jour"))' }
      ],
      formatting: [
        { condition: "Contrôle Échu (Périmé)", formula: '=$F2<AUJOURDHUI()', style: "Remplissage rouge foncé, texte blanc gras. Risque juridique !" },
        { condition: "Échéance à moins de 30 jours", formula: '=$F2<AUJOURDHUI()+30', style: "Remplissage orange clair, texte orange foncé" }
      ]
    },
    {
      id: "budget",
      name: "5. SUIVI_BUDGETAIRE",
      role: "Maîtrise financière du budget annuel de maintenance par service avec alerte automatique de dépassement.",
      dropdowns: [],
      columns: [
        { col: "A", name: "Atelier / Service", type: "Texte unique", validation: "Uniques par ligne", formula: "Saisie des 8 ateliers" },
        { col: "B", name: "Budget Alloué (TND)", type: "Décimal", validation: "Nombre supérieur à 0", formula: "Saisie de la direction générale" },
        { col: "C", name: "Dépenses Actuelles (TND)", type: "Décimal calculé", validation: "Automatique", formula: '=SOMME.SI(INTERVENTIONS!B:B;EQUIPEMENTS!A:A;INTERVENTIONS!I:I)' },
        { col: "D", name: "Reste Budget (TND)", type: "Décimal calculé", validation: "Automatique", formula: "=B2-C2" },
        { col: "E", name: "Alerte Dépassement", type: "Texte calculé", validation: "Automatique", formula: '=SI(C2>B2;"DEPASSEMENT !!!";"Budget OK")' },
        { col: "F", name: "Taux Consommation (%)", type: "Pourcentage", validation: "Automatique", formula: "=C2/B2" }
      ],
      formatting: [
        { condition: "Budget Dépassé !", formula: '=$E2="DEPASSEMENT !!!"', style: "Remplissage rouge vif, texte rouge gras" },
        { condition: "Consommation saine (< 80%)", formula: '=$F2<0.8', style: "Texte vert" }
      ]
    }
  ];

  const currentSheet = sheetsSpecs.find((s) => s.id === activeTab) || sheetsSpecs[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Download Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-red-950 text-white rounded-2xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-chery-red via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-chery-red font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 animate-pulse-subtle" />
              Générateur de Rapports & Exports Excel
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Générer et Exporter les Données GMAO STA
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Consultez les graphiques de conformité et exportez instantanément un fichier <strong>Excel (.xlsx)</strong> d'origine entièrement pré-configuré avec l'ensemble des données, formules et feuilles d'audit de la STA.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2.5 bg-chery-red hover:bg-chery-dark text-white px-6 py-4 rounded-xl font-extrabold text-sm shadow-xl hover:shadow-red-900/30 transition-all cursor-pointer group self-stretch md:self-auto shrink-0"
          >
            <Download className="h-5 w-5 animate-bounce" />
            Télécharger le Classeur Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Selector: Live Analytics vs Excel Blueprint */}
      <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/50 max-w-md">
        <button
          onClick={() => setReportSubTab("analytics")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            reportSubTab === "analytics"
              ? "bg-white text-neutral-800 shadow-sm border border-neutral-200/40"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Rapports & Analyses Live
        </button>
        <button
          onClick={() => setReportSubTab("blueprint")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            reportSubTab === "blueprint"
              ? "bg-white text-neutral-800 shadow-sm border border-neutral-200/40"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Fiches & Formules Excel
        </button>
      </div>

      {/* Sub-view switcher */}
      {reportSubTab === "analytics" ? (
        /* ANALYTICS VIEW MODULES */
        <div className="space-y-6 animate-fade-in">
          {/* Section A: Monthly Reports and Indicators */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-50 pb-3">
              <div>
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Rapports Mensuels d'Activité</h3>
                <span className="text-sm font-black text-neutral-700 block mt-0.5">Analyses comparatives préventives vs correctives (Exercice 2026)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-bold">Mois d'analyse :</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="border border-neutral-200 rounded-lg text-xs py-1.5 px-2.5 bg-white outline-none font-bold cursor-pointer"
                >
                  {MONTHS_LIST_FR.map((m, idx) => (
                    <option key={idx} value={idx}>{m} 2026</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-4 rounded-xl text-xs">
                <span className="text-neutral-400 font-bold uppercase block text-[9px]">Interventions totales</span>
                <span className="text-xl font-black text-neutral-800 font-mono block mt-1">{monthlyMetrics.interventionsCount} bons</span>
                <span className="text-[10px] text-neutral-400 mt-1 block">Toutes catégories confondues</span>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-xl text-xs">
                <span className="text-neutral-400 font-bold uppercase block text-[9px]">Ratio Préventif / Panne</span>
                <span className="text-xl font-black text-neutral-800 font-mono block mt-1">
                  {monthlyMetrics.preventivesCount} Prv / {monthlyMetrics.correctivesCount} Cur
                </span>
                <span className="text-[10px] text-neutral-400 mt-1 block">Réglementaires : {monthlyMetrics.regulatoryCount}</span>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl text-xs">
                <span className="text-neutral-400 font-bold uppercase block text-[9px]">Facturation Main d'Œuvre</span>
                <span className="text-xl font-black text-neutral-800 font-mono block mt-1">{(monthlyMetrics.costLabor ?? 0).toLocaleString()} TND</span>
                <span className="text-[10px] text-neutral-400 mt-1 block">Heures facturées atelier</span>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl text-xs">
                <span className="text-neutral-400 font-bold uppercase block text-[9px]">Coût Pièces Détachées</span>
                <span className="text-xl font-black text-neutral-800 font-mono block mt-1">{(monthlyMetrics.costParts ?? 0).toLocaleString()} TND</span>
                <span className="text-[10px] text-neutral-400 mt-1 block">Total Consommation magasin</span>
              </div>
            </div>
          </div>

          {/* Section B: Grid for failure frequency & availability tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Failure Counts by Equipment */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-4">
              <div className="border-b border-neutral-50 pb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-chery-red" />
                <div>
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Fréquence des Pannes par Machine</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Nombre d'interventions curatives correctives déclarées.</p>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto text-xs border border-neutral-50 rounded-xl">
                <table className="w-full text-left font-medium">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Désignation</th>
                      <th className="py-2.5 px-3 text-center">Nombre Pannes</th>
                      <th className="py-2.5 px-3 text-center">Sévérité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {failureFrequencyList.map((f) => (
                      <tr key={f.code} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-neutral-400">{f.code}</td>
                        <td className="py-2.5 px-3 text-neutral-700 font-bold">{f.eqName}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-extrabold text-neutral-800">{f.count} pannes</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            f.count > 2
                              ? "bg-red-50 text-chery-red animate-pulse"
                              : f.count > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-green-50 text-green-700"
                          }`}>
                            {f.count > 2 ? "Fréquent" : f.count > 0 ? "Modéré" : "Zéro Panne"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Equipment Availability % details */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-4">
              <div className="border-b border-neutral-50 pb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Détails de Disponibilité unitaire</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Taux de service individuel calculé selon l'état actuel.</p>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto text-xs border border-neutral-50 rounded-xl">
                <table className="w-full text-left font-medium">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Désignation</th>
                      <th className="py-2.5 px-3">Atelier</th>
                      <th className="py-2.5 px-3 text-right">Dispo. (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {availabilityDetailsList.map((av) => (
                      <tr key={av.code} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-neutral-400">{av.code}</td>
                        <td className="py-2.5 px-3 text-neutral-700 font-bold">{av.name}</td>
                        <td className="py-2.5 px-3 text-neutral-400 font-semibold">{av.workshop}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`font-mono font-extrabold ${
                            av.score > 80 ? "text-green-600" : av.score > 30 ? "text-amber-600" : "text-chery-red"
                          }`}>
                            {av.score}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section C: Budget Allocation vs Consumption Chart */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-4">
            <div className="border-b border-neutral-50 pb-2">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Maîtrise budgétaire par Atelier</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">Comparatif graphique de l'enveloppe allouée vs dépenses constatées (TND)</p>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={9} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Alloué" fill="#1e293b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Consommé" fill="#cc0000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* BLUEPRINT SPECIFICATIONS GUIDE SHEET (As previously constructed) */
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-chery-red" />
              Guide et Spécifications Techniques du Classeur Excel
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Parcourez la configuration exacte du classeur, feuille par feuille, pour en comprendre les relations ou saisir directement les formules adaptées.
            </p>
          </div>

          {/* Tabs navigation */}
          <div className="flex flex-wrap border-b border-neutral-100 gap-1.5 pb-2">
            {sheetsSpecs.map((sh) => (
              <button
                key={sh.id}
                onClick={() => setActiveTab(sh.id)}
                className={`text-xs font-bold py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  activeTab === sh.id
                    ? "bg-chery-red text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                {sh.name}
              </button>
            ))}
          </div>

          {/* Specs Content */}
          <div className="space-y-5 animate-fade-in text-xs">
            {/* Objectif */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <span className="font-bold text-neutral-400 uppercase tracking-wider block text-[9px]">
                Rôle de cette feuille Excel
              </span>
              <p className="text-neutral-700 font-medium mt-1 leading-relaxed">{currentSheet.role}</p>
            </div>

            {/* List validation fields */}
            {currentSheet.dropdowns.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-neutral-400" />
                  Listes Déroulantes & Validation de Données
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSheet.dropdowns.map((drop, idx) => (
                    <div key={idx} className="bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 text-xs">
                      <span className="font-bold text-neutral-600 block mb-1">Colonne: {drop.name}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {drop.values.map((v, i) => (
                          <span key={i} className="bg-white px-2 py-0.5 rounded border border-neutral-200 text-[10px] font-mono text-neutral-600">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Columns Specifications Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="h-3.5 w-3.5 text-neutral-400" />
                Structure des colonnes du Tableau
              </h4>
              <div className="overflow-x-auto border border-neutral-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-bold text-[10px]">
                      <th className="py-2.5 px-4 text-center">Col.</th>
                      <th className="py-2.5 px-4">Nom du Champ / En-tête</th>
                      <th className="py-2.5 px-4">Type de Donnée</th>
                      <th className="py-2.5 px-4">Validation Excel</th>
                      <th className="py-2.5 px-4">Formule Excel (Syntaxe FR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 font-medium">
                    {currentSheet.columns.map((col, index) => {
                      const isFormula = col.formula.startsWith("=");

                      return (
                        <tr key={index} className="hover:bg-neutral-50/20">
                          <td className="py-2.5 px-4 text-center font-bold text-neutral-400 font-mono">
                            {col.col}
                          </td>
                          <td className="py-2.5 px-4 text-neutral-800 font-bold">{col.name}</td>
                          <td className="py-2.5 px-4 text-neutral-500 font-semibold">{col.type}</td>
                          <td className="py-2.5 px-4 text-neutral-400 text-[11px] leading-relaxed">
                            {col.validation}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-700">
                            {isFormula ? (
                              <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded border border-neutral-250">
                                <span className="text-chery-red select-all">{col.formula}</span>
                                <button
                                  onClick={() => copyToClipboard(col.formula, `${currentSheet.id}-${col.col}`)}
                                  className="ml-auto text-[10px] bg-neutral-200 hover:bg-neutral-300 px-1 py-0.5 rounded text-neutral-600 transition-colors cursor-pointer"
                                >
                                  {copiedFormula === `${currentSheet.id}-${col.col}` ? "Copié !" : "Copier"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">{col.formula}</span>
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
        </div>
      )}
    </div>
  );
}
