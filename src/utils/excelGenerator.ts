/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from "xlsx";
import {
  Equipment,
  Intervention,
  SparePart,
  MaintenanceContract,
  BudgetYear,
  ComplianceCheck,
  Vendor,
  Project,
  Audit5S,
  LeanItem,
  SafetyRecord,
  QualityRecord,
  EnvironmentLog
} from "../types";

/**
 * Automatically adjusts column widths so that no content is clipped/truncated.
 */
function autoFitColumns(ws: XLSX.WorkSheet, minWidth = 12) {
  if (!ws["!ref"]) return;
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const cols: { wch: number }[] = [];
  
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxLen = minWidth;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellRef];
      if (cell) {
        let valStr = "";
        if (cell.v !== undefined && cell.v !== null) {
          valStr = String(cell.v);
        } else if (cell.f !== undefined) {
          valStr = "FORMULA_PLACEHOLDER";
        }
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      }
    }
    // Limit to maximum 55 characters to avoid excessively wide columns
    cols.push({ wch: Math.min(maxLen + 3, 55) });
  }
  ws["!cols"] = cols;
}

/**
 * Sets comfortable professional row heights for headers and data rows.
 */
function setProfessionalRowHeights(ws: XLSX.WorkSheet, headerRowsCount = 4) {
  if (!ws["!ref"]) return;
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const rows: { hpt: number }[] = [];
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    if (R < 2) {
      rows.push({ hpt: 28 }); // Title band
    } else if (R === 3) {
      rows.push({ hpt: 24 }); // Headers
    } else {
      rows.push({ hpt: 19 }); // Data rows
    }
  }
  ws["!rows"] = rows;
}

export function generateSTAExcelFile(
  equipments: Equipment[],
  interventions: Intervention[],
  spareParts: SparePart[] | undefined,
  contracts: MaintenanceContract[],
  vendors: Vendor[],
  compliance: ComplianceCheck[],
  budget: BudgetYear
) {
  const wb = XLSX.utils.book_new();
  const currentDateStr = new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR");

  // =========================================================================
  // SHEET 0: SOMMAIRE / EXECUTIVE DASHBOARD
  // =========================================================================
  const summaryAoa = [
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["SYSTÈME DE GESTION DE MAINTENANCE ASSISTÉE PAR ORDINATEUR (GMAO)", ""],
    ["Date de génération de l'archive :", currentDateStr],
    ["", ""],
    ["INDICATEURS CLÉS DU PARC (SYNTHÈSE)", ""],
    ["Total Équipements Référencés", { v: equipments.length, t: "n", z: '#,##0" unités"' }],
    ["Total Fiches d'Intervention", { v: interventions.length, t: "n", z: '#,##0" fiches"' }],
    ["Total Contrats Actifs", { v: contracts.length, t: "n", z: '#,##0" contrats"' }],
    ["Vérifications Réglementaires Périodiques", { v: compliance.length, t: "n", z: '#,##0" contrôles"' }],
    ["Budget Annuel Global Alloué (2026)", { v: Object.values(budget.allocatedByWorkshop).reduce((a, b) => a + b, 0), t: "n", z: '#,##0.00" TND"' }],
    ["Total Dépenses Cumulées (2026)", { v: Object.values(budget.spentByWorkshop || {}).reduce((a, b) => a + b, 0), t: "n", z: '#,##0.00" TND"' }],
    ["", ""],
    ["ORGANISATION DU CLASSEUR", ""],
    ["Nom de l'onglet", "Description du contenu et usage opérationnel"],
    ["SOMMAIRE", "Tableau de bord général de synthèse et index des données exportées"],
    ["EQUIPEMENTS", "Registre exhaustif du parc d'équipements, ateliers, criticité et état de garantie"],
    ["INTERVENTIONS", "Historique de maintenance corrective et préventive avec calcul des coûts M.O."],
    ["FOURNISSEURS_CONTRATS", "Fiche des prestataires externes agréés et suivi des abonnements contractuels"],
    ["CONTROLES_REGLEMENTAIRES", "Suivi des visites obligatoires de sécurité, organismes agréés et échéances à venir"],
    ["SUIVI_BUDGETAIRE", "Consommation budgétaire par atelier avec indicateurs de dépassement automatique"]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  autoFitColumns(wsSummary, 25);
  // Custom height for Summary rows
  const sRows: { hpt: number }[] = [];
  for (let r = 0; r < summaryAoa.length; r++) {
    if (r < 2) sRows.push({ hpt: 26 });
    else sRows.push({ hpt: 19 });
  }
  wsSummary["!rows"] = sRows;
  XLSX.utils.book_append_sheet(wb, wsSummary, "SOMMAIRE");

  // =========================================================================
  // SHEET 1: EQUIPEMENTS
  // =========================================================================
  const eqHeaders = [
    "Code Équipement",
    "Nom de l'Équipement",
    "Atelier / Service",
    "Statut de Fonctionnement",
    "Date d'Achat",
    "Date Fin Garantie",
    "Prix d'Achat (TND)",
    "Localisation",
    "Numéro de Série",
    "Critique ?",
    "Dernier Contrôle",
    "Intervalle (Mois)",
    "MTBF Cible (h)",
    "MTTR Cible (h)",
    "Statut Garantie (Calculé)"
  ];

  const eqRows = equipments.map((eq, index) => {
    const rowNum = index + 5; // Rows 1-3 are title band, Row 4 is Header
    return [
      { v: eq.code, t: "s" },
      { v: eq.name, t: "s" },
      { v: eq.workshop, t: "s" },
      { v: eq.status, t: "s" },
      { v: eq.purchaseDate, t: "s" },
      { v: eq.warrantyEnd, t: "s" },
      { v: eq.purchasePrice, t: "n", z: '#,##0.00" TND"' },
      { v: eq.location, t: "s" },
      { v: eq.serialNumber || "N/A", t: "s" },
      { v: eq.critical ? "OUI" : "NON", t: "s" },
      { v: eq.lastInspectionDate || "N/A", t: "s" },
      { v: eq.inspectionIntervalMonths || 0, t: "n", z: '0" mois"' },
      { v: eq.mtbfTargetHours, t: "n", z: '#,##0" h"' },
      { v: eq.mttrTargetHours, t: "n", z: '#,##0.0" h"' },
      { f: `IF(F${rowNum}<TODAY(),"Garantie Expirée","Sous Garantie")`, t: "s" }
    ];
  });

  const wsEquipments = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["REGISTRE COMPLET DU PARC D'ÉQUIPEMENTS", ""],
    ["", ""],
    eqHeaders,
    ...eqRows
  ]);
  autoFitColumns(wsEquipments, 14);
  setProfessionalRowHeights(wsEquipments, 4);
  XLSX.utils.book_append_sheet(wb, wsEquipments, "EQUIPEMENTS");

  // =========================================================================
  // SHEET 2: INTERVENTIONS
  // =========================================================================
  const intHeaders = [
    "ID Intervention",
    "Code Équipement",
    "Type",
    "Titre de l'Intervention",
    "Date d'Intervention",
    "Durée (Heures)",
    "Coût Pièces (TND)",
    "Coût M.O. (TND)",
    "Coût Total (TND)",
    "Technicien / Prestataire",
    "Statut",
    "Notes Opérationnelles"
  ];

  const intRows = interventions.map((int, index) => {
    const rowNum = index + 5; // Rows 1-3 are title band, Row 4 is Header
    return [
      { v: int.id, t: "s" },
      { v: int.equipmentCode, t: "s" },
      { v: int.type, t: "s" },
      { v: int.title, t: "s" },
      { v: int.dateIntervention, t: "s" },
      { v: int.durationHours, t: "n", z: '0.0" h"' },
      { v: int.costParts, t: "n", z: '#,##0.00" TND"' },
      { v: int.costLabor, t: "n", z: '#,##0.00" TND"' },
      { f: `G${rowNum}+H${rowNum}`, t: "n", z: '#,##0.00" TND"' },
      { v: int.technician, t: "s" },
      { v: int.status, t: "s" },
      { v: int.notes || "", t: "s" }
    ];
  });

  const wsInterventions = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["HISTORIQUE ET REGISTRE DES INTERVENTIONS GMAO", ""],
    ["", ""],
    intHeaders,
    ...intRows
  ]);
  autoFitColumns(wsInterventions, 12);
  setProfessionalRowHeights(wsInterventions, 4);
  XLSX.utils.book_append_sheet(wb, wsInterventions, "INTERVENTIONS");

  // =========================================================================
  // SHEET 4: FOURNISSEURS_CONTRATS
  // =========================================================================
  const contractHeaders = [
    "ID Contrat",
    "Titre du Contrat",
    "Fournisseur / Prestataire",
    "Coût Annuel (TND)",
    "Date de Début",
    "Date de Fin",
    "Statut",
    "Périodicité",
    "Équipements Couverts"
  ];

  const contractRows = contracts.map((c) => {
    const vendor = vendors.find((v) => v.id === c.vendorId);
    return [
      { v: c.id, t: "s" },
      { v: c.title, t: "s" },
      { v: vendor ? vendor.name : c.vendorId, t: "s" },
      { v: c.costAnnual, t: "n", z: '#,##0.00" TND"' },
      { v: c.startDate, t: "s" },
      { v: c.endDate, t: "s" },
      { v: c.status, t: "s" },
      { v: c.frequency, t: "s" },
      { v: c.coveredEquipments.join(", "), t: "s" }
    ];
  });

  const wsContracts = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["SUIVI DES CONTRATS ET FOURNISSEURS DE SERVICES", ""],
    ["", ""],
    contractHeaders,
    ...contractRows
  ]);
  autoFitColumns(wsContracts, 14);
  setProfessionalRowHeights(wsContracts, 4);
  XLSX.utils.book_append_sheet(wb, wsContracts, "FOURNISSEURS_CONTRATS");

  // =========================================================================
  // SHEET 5: CONTROLES_REGLEMENTAIRES
  // =========================================================================
  const compHeaders = [
    "ID Contrôle",
    "Code Équipement",
    "Libellé du Contrôle réglementaire",
    "Organisme Agréé",
    "Date d'Inspection",
    "Échéance (Prochaine inspection)",
    "Statut de Conformité",
    "Référence Rapport",
    "Alerte Échéance (Calculée)"
  ];

  const compRows = compliance.map((cmp, index) => {
    const rowNum = index + 5; // Rows 1-3 are title band, Row 4 is Header
    return [
      { v: cmp.id, t: "s" },
      { v: cmp.equipmentCode, t: "s" },
      { v: cmp.title, t: "s" },
      { v: cmp.bodyName, t: "s" },
      { v: cmp.inspectionDate, t: "s" },
      { v: cmp.nextInspectionDate, t: "s" },
      { v: cmp.status, t: "s" },
      { v: cmp.reportRef, t: "s" },
      { f: `IF(F${rowNum}<TODAY(),"❌ URGENT: EXPIRÉ",IF(F${rowNum}<TODAY()+30,"⚠️ Échéance Proche (<30j)","✅ À jour"))`, t: "s" }
    ];
  });

  const wsCompliance = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["PLAN DE CONFORMITÉ & CONTRÔLES RÉGLEMENTAIRES OBLIGATOIRES", ""],
    ["", ""],
    compHeaders,
    ...compRows
  ]);
  autoFitColumns(wsCompliance, 14);
  setProfessionalRowHeights(wsCompliance, 4);
  XLSX.utils.book_append_sheet(wb, wsCompliance, "CONTROLES_REGLEMENTAIRES");

  // =========================================================================
  // SHEET 6: SUIVI_BUDGETAIRE
  // =========================================================================
  const budgetHeaders = [
    "Atelier / Service de la STA",
    "Budget Annuel Alloué (TND)",
    "Dépenses Cumulées (TND)",
    "Budget Restant Disponible (TND)",
    "Alerte Dépassement",
    "Taux de Consommation (%)"
  ];

  const workshopsList = Object.keys(budget.allocatedByWorkshop) as Array<keyof typeof budget.allocatedByWorkshop>;
  const budgetRows = workshopsList.map((wsName, index) => {
    const rowNum = index + 5; // Rows 1-3 are title band, Row 4 is Header
    const allocated = budget.allocatedByWorkshop[wsName];
    const spent = budget.spentByWorkshop[wsName] || 0;
    return [
      { v: wsName, t: "s" },
      { v: allocated, t: "n", z: '#,##0.00" TND"' },
      { v: spent, t: "n", z: '#,##0.00" TND"' },
      { f: `B${rowNum}-C${rowNum}`, t: "n", z: '#,##0.00" TND"' },
      { f: `IF(C${rowNum}>B${rowNum},"❌ DÉPASSEMENT !!!","✅ Budget OK")`, t: "s" },
      { f: `IF(B${rowNum}>0,C${rowNum}/B${rowNum},0)`, t: "n", z: "0.0%" }
    ];
  });

  // Calculate coordinates for the final summary row
  const totalRowNum = budgetRows.length + 5; // Rows 1-3 are title band, Row 4 is Header, then data, then total row
  const totalRow = [
    { v: "TOTAL GÉNÉRAL STA", t: "s" },
    { f: `SUM(B5:B${totalRowNum - 1})`, t: "n", z: '#,##0.00" TND"' },
    { f: `SUM(C5:C${totalRowNum - 1})`, t: "n", z: '#,##0.00" TND"' },
    { f: `B${totalRowNum}-C${totalRowNum}`, t: "n", z: '#,##0.00" TND"' },
    { f: `IF(C${totalRowNum}>B${totalRowNum},"❌ DÉPASSEMENT GLOBAL","✅ Budget Total OK")`, t: "s" },
    { f: `IF(B${totalRowNum}>0,C${totalRowNum}/B${totalRowNum},0)`, t: "n", z: "0.0%" }
  ];

  const wsBudget = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["SUIVI BUDGETAIRE & ANALYSE FINANCIÈRE PAR ATELIER", ""],
    ["", ""],
    budgetHeaders,
    ...budgetRows,
    totalRow
  ]);
  autoFitColumns(wsBudget, 16);
  setProfessionalRowHeights(wsBudget, 4);
  XLSX.utils.book_append_sheet(wb, wsBudget, "SUIVI_BUDGETAIRE");

  // =========================================================================
  // EXCEL FILE GENERATION & TRIGGER DOWNLOAD
  // =========================================================================
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
  const downloadUrl = URL.createObjectURL(dataBlob);
  const tempLink = document.createElement("a");
  tempLink.href = downloadUrl;
  tempLink.setAttribute("download", `GMAO_STA_Chery_Tunisie_2026_Export.xlsx`);
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}

/**
 * Generates and downloads a standardized Excel template (.xlsx) for batch equipment import.
 */
export function generateEquipmentImportTemplate(): void {
  const wb = XLSX.utils.book_new();

  const headers = [
    "Code_Equipement*",
    "Nom_Equipement*",
    "Atelier*",
    "Marque_Modele",
    "Numero_Serie",
    "Emplacement",
    "Statut",
    "Criticite",
    "Prix_Achat_TND",
    "Date_Achat",
    "Duree_Garantie_Mois",
    "Intervalle_Inspect_Mois",
    "Responsable"
  ];

  const sampleRows = [
    [
      "EQ-SR-06",
      "Pont Élevateur Ciseaux N°3",
      "Service Rapide",
      "RAVAGLIOLI RAV300",
      "SN-2026-9812",
      "Travée 4 - Zone Levage",
      "Opérationnel",
      "A - Critique",
      14500,
      "2025-06-15",
      24,
      6,
      "Technicien Senior SR"
    ],
    [
      "EQ-MEC-05",
      "Banc d'Équilibrage Électronique",
      "Atelier Mécanique",
      "CORGHI EM9280",
      "SN-2025-7741",
      "Zone Équilibrage",
      "Opérationnel",
      "B - Moyen",
      8200,
      "2025-03-10",
      12,
      12,
      "Responsable Atelier"
    ],
    [
      "EQ-DIAG-04",
      "Valise de Diagnostic Chery iAuto",
      "Atelier Diagnostic",
      "CHERY DIAG V3.2",
      "SN-2026-0033",
      "Poste Électronique 2",
      "Opérationnel",
      "A - Critique",
      12000,
      "2026-01-10",
      36,
      3,
      "Expert Diagnostic"
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["MODÈLE OFFICIEL D'IMPORTATION MASSIVE DES ÉQUIPEMENTS & MACHINES GMAO", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Instructions : Remplissez les lignes à partir de la ligne 5. Les champs suivis d'une * sont obligatoires. Conservez la structure des colonnes.", "", "", "", "", "", "", "", "", "", "", "", ""],
    headers,
    ...sampleRows
  ]);

  autoFitColumns(ws, 16);
  setProfessionalRowHeights(ws, 4);

  XLSX.utils.book_append_sheet(wb, ws, "MODELE_IMPORT_EQUIPEMENTS");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `MODELE_IMPORT_EQUIPEMENTS_STA_CHERY.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a complete Excel report (.xlsx) for Projects & Continuous Improvement.
 */
export function generateProjectsAndImprovementExcelFile(
  projects: Project[],
  audits5s: Audit5S[] = [],
  leanItems: LeanItem[] = [],
  safetyRecords: SafetyRecord[] = [],
  qualityRecords: QualityRecord[] = [],
  environmentLogs: EnvironmentLog[] = []
) {
  const wb = XLSX.utils.book_new();
  const currentDateStr = new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR");

  // Summary Metrics
  const activeProjects = projects.filter((p) => p.status === "En cours").length;
  const completedProjects = projects.filter((p) => p.status === "Terminé").length;
  const totalPlannedBudget = projects.reduce((acc, p) => acc + (p.budgetPlanned || 0), 0);
  const totalRealBudget = projects.reduce((acc, p) => acc + (p.budgetReal || 0), 0);
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progressPercent || 0), 0) / projects.length) : 0;

  // =========================================================================
  // 1. SHEET: SOMMAIRE / EXECUTIVE DASHBOARD
  // =========================================================================
  const summaryAoa = [
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["RAPPORT D'ÉTAT DES PROJETS ET DE L'AMÉLIORATION CONTINUE", ""],
    ["Date de génération de l'export :", currentDateStr],
    ["", ""],
    ["1. INDICATEURS CLÉS DES PROJETS STRATÉGIQUES", ""],
    ["Nombre Total de Projets Référencés", { v: projects.length, t: "n", z: '#,##0" projets"' }],
    ["Projets En Cours d'Exécution", { v: activeProjects, t: "n", z: '#,##0" projets"' }],
    ["Projets Clôturés / Terminés", { v: completedProjects, t: "n", z: '#,##0" projets"' }],
    ["Budget Global Prévu (CAPEX / OPEX)", { v: totalPlannedBudget, t: "n", z: '#,##0.00" TND"' }],
    ["Budget Réel Engagé / Consommé", { v: totalRealBudget, t: "n", z: '#,##0.00" TND"' }],
    ["Écart Budgétaire Global", { v: totalPlannedBudget - totalRealBudget, t: "n", z: '#,##0.00" TND"' }],
    ["Taux d'Avancement Moyen des Projets", { v: avgProgress / 100, t: "n", z: "0.0%" }],
    ["", ""],
    ["2. SYNTHÈSE AMÉLIORATION CONTINUE & QUALITÉ/SST", ""],
    ["Audits 5S Réalisés", { v: audits5s.length, t: "n", z: '#,##0" audits"' }],
    ["Actions LEAN & Chantiers Kaizen", { v: leanItems.length, t: "n", z: '#,##0" actions"' }],
    ["Fiches Sécurité & SST (Prévention)", { v: safetyRecords.length, t: "n", z: '#,##0" fiches"' }],
    ["Fiches Qualité & Non-Conformités", { v: qualityRecords.length, t: "n", z: '#,##0" fiches"' }],
    ["Suivi Environnemental & Énergie", { v: environmentLogs.length, t: "n", z: '#,##0" relevés"' }],
    ["", ""],
    ["INDEX DES ONGLETS DU CLASSEUR EXCEL", ""],
    ["Nom de l'onglet", "Description des données contenues"],
    ["SOMMAIRE", "Synthèse globale des indicateurs de projets et amélioration continue"],
    ["ETAT_DES_PROJETS", "Registre complet des projets, statuts, budgets prévus vs réels et responsables"],
    ["TACHES_ET_PLANNING", "Détail des tâches, plannings, priorités et avancement individuel"],
    ["MATRICE_DES_RISQUES", "Inventaire des risques identifiés, probabilité, impact et plans d'action"],
    ["BUDGETS_PROJETS", "Lignes de dépenses, devis, commandes CAPEX/OPEX par projet"],
    ["AUDITS_5S", "Résultats détaillés des audits 5S par atelier (Seiri, Seiton, Seiso, etc.)"],
    ["LEAN_KAIZEN", "Actions de réduction des gaspillages (Muda) et chantiers Kaizen"],
    ["SECURITE_SST", "Registre des contrôles de sécurité, EPI, extincteurs et incidents"],
    ["QUALITE_ENVIRONNEMENT", "Suivi des non-conformités, traçabilité et bilans environnementaux"]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  autoFitColumns(wsSummary, 25);
  setProfessionalRowHeights(wsSummary, 4);
  XLSX.utils.book_append_sheet(wb, wsSummary, "SOMMAIRE");

  // =========================================================================
  // 2. SHEET: ETAT_DES_PROJETS
  // =========================================================================
  const projectRows = projects.map((p) => {
    const taskCount = (p.tasks || []).length;
    const completedTaskCount = (p.tasks || []).filter((t) => t.status === "Terminé").length;
    const riskCount = (p.risks || []).length;
    const highRiskCount = (p.risks || []).filter((r) => r.impact === "Fort" || r.impact === "Critique").length;
    const suppliersStr = (p.suppliers || []).join(", ") || "N/A";
    const budgetGap = (p.budgetPlanned || 0) - (p.budgetReal || 0);

    return [
      p.id,
      p.name,
      p.status,
      p.priority,
      p.manager,
      p.department,
      p.startDate,
      p.endDate,
      (p.progressPercent || 0) / 100,
      p.budgetPlanned || 0,
      p.budgetReal || 0,
      budgetGap,
      `${completedTaskCount} / ${taskCount}`,
      `${highRiskCount} / ${riskCount}`,
      suppliersStr,
      p.description || ""
    ];
  });

  const wsProjects = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["REGISTRE GÉNÉRAL D'ÉTAT DES PROJETS & MODERNISATION", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    [
      "Code Projet",
      "Nom du Projet",
      "Statut",
      "Priorité",
      "Chef de Projet",
      "Département / Atelier",
      "Date Début",
      "Fin Prévue",
      "Avancement (%)",
      "Budget Prévu (TND)",
      "Budget Réel (TND)",
      "Écart Budgétaire (TND)",
      "Tâches (Réalisées / Total)",
      "Risques Majeurs (Fort-Critique / Total)",
      "Fournisseurs & Prestataires",
      "Description / Objectif"
    ],
    ...projectRows
  ]);

  if (wsProjects["!ref"]) {
    const range = XLSX.utils.decode_range(wsProjects["!ref"]);
    for (let R = 4; R <= range.e.r; ++R) {
      const cellProg = wsProjects[XLSX.utils.encode_cell({ r: R, c: 8 })];
      if (cellProg) cellProg.z = "0.0%";

      const cellPlanned = wsProjects[XLSX.utils.encode_cell({ r: R, c: 9 })];
      if (cellPlanned) cellPlanned.z = '#,##0.00" TND"';

      const cellReal = wsProjects[XLSX.utils.encode_cell({ r: R, c: 10 })];
      if (cellReal) cellReal.z = '#,##0.00" TND"';

      const cellGap = wsProjects[XLSX.utils.encode_cell({ r: R, c: 11 })];
      if (cellGap) cellGap.z = '#,##0.00" TND"';
    }
  }

  autoFitColumns(wsProjects, 15);
  setProfessionalRowHeights(wsProjects, 4);
  XLSX.utils.book_append_sheet(wb, wsProjects, "ETAT_DES_PROJETS");

  // =========================================================================
  // 3. SHEET: TACHES_ET_PLANNING
  // =========================================================================
  const taskRows: any[] = [];
  projects.forEach((p) => {
    (p.tasks || []).forEach((t) => {
      taskRows.push([
        p.id,
        p.name,
        t.name,
        t.manager || p.manager,
        t.priority,
        t.status,
        t.startDate,
        t.endDate,
        t.durationDays || 0,
        (t.progressPercent || 0) / 100
      ]);
    });
  });

  const wsTasks = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", "", ""],
    ["DÉTAIL DES TÂCHES ET PLANNING DE PROJETS", "", "", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", "", "", ""],
    [
      "Code Projet",
      "Nom du Projet",
      "Intitulé de la Tâche",
      "Responsable",
      "Priorité",
      "Statut Tâche",
      "Date Début",
      "Date Fin",
      "Durée (Jours)",
      "Progression (%)"
    ],
    ...(taskRows.length > 0 ? taskRows : [["N/A", "Aucune tâche enregistrée", "", "", "", "", "", "", 0, 0]])
  ]);

  if (wsTasks["!ref"]) {
    const range = XLSX.utils.decode_range(wsTasks["!ref"]);
    for (let R = 4; R <= range.e.r; ++R) {
      const cellProg = wsTasks[XLSX.utils.encode_cell({ r: R, c: 9 })];
      if (cellProg) cellProg.z = "0.0%";
    }
  }

  autoFitColumns(wsTasks, 15);
  setProfessionalRowHeights(wsTasks, 4);
  XLSX.utils.book_append_sheet(wb, wsTasks, "TACHES_ET_PLANNING");

  // =========================================================================
  // 4. SHEET: MATRICE_DES_RISQUES
  // =========================================================================
  const riskRows: any[] = [];
  projects.forEach((p) => {
    (p.risks || []).forEach((r) => {
      riskRows.push([
        p.id,
        p.name,
        r.risk,
        r.probability,
        r.impact,
        r.priority || "Modérée",
        r.preventiveAction || "N/A",
        r.responsible || p.manager,
        r.state || "Identifié"
      ]);
    });
  });

  const wsRisks = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", ""],
    ["MATRICE ET SUIVI DES RISQUES PROJETS", "", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", "", ""],
    [
      "Code Projet",
      "Nom du Projet",
      "Risque Identifié",
      "Probabilité",
      "Impact",
      "Niveau de Priorité",
      "Mesures Préventives & Plan d'Action",
      "Responsable du Risque",
      "État du Risque"
    ],
    ...(riskRows.length > 0 ? riskRows : [["N/A", "Aucun risque enregistré", "", "", "", "", "", "", ""]])
  ]);

  autoFitColumns(wsRisks, 15);
  setProfessionalRowHeights(wsRisks, 4);
  XLSX.utils.book_append_sheet(wb, wsRisks, "MATRICE_DES_RISQUES");

  // =========================================================================
  // 5. SHEET: BUDGETS_PROJETS
  // =========================================================================
  const budgetItemRows: any[] = [];
  projects.forEach((p) => {
    (p.budgetItems || []).forEach((b) => {
      budgetItemRows.push([
        p.id,
        p.name,
        b.title,
        b.type,
        b.supplier || "N/A",
        b.amount || 0,
        b.date || p.startDate,
        b.status || "Validé"
      ]);
    });
  });

  const wsBudgets = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", ""],
    ["DÉTAIL DES POSTES BUDGÉTAIRES PROJETS (CAPEX/OPEX)", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", ""],
    [
      "Code Projet",
      "Nom du Projet",
      "Intitulé de la Dépense / Devis",
      "Type de Dépense",
      "Fournisseur / Prestataire",
      "Montant (TND)",
      "Date Enregistrement",
      "Statut"
    ],
    ...(budgetItemRows.length > 0 ? budgetItemRows : [["N/A", "Aucun poste de dépense enregistré", "", "", "", 0, "", ""]])
  ]);

  if (wsBudgets["!ref"]) {
    const range = XLSX.utils.decode_range(wsBudgets["!ref"]);
    for (let R = 4; R <= range.e.r; ++R) {
      const cellAmount = wsBudgets[XLSX.utils.encode_cell({ r: R, c: 5 })];
      if (cellAmount) cellAmount.z = '#,##0.00" TND"';
    }
  }

  autoFitColumns(wsBudgets, 15);
  setProfessionalRowHeights(wsBudgets, 4);
  XLSX.utils.book_append_sheet(wb, wsBudgets, "BUDGETS_PROJETS");

  // =========================================================================
  // 6. SHEET: AUDITS_5S
  // =========================================================================
  const audit5sRows = audits5s.map((a) => [
    a.id,
    a.date,
    a.workshop,
    a.auditor,
    a.seiriScore,
    a.seitonScore,
    a.seisoScore,
    a.seiketsuScore,
    a.shitsukeScore,
    (a.totalScore || 0) / 100,
    a.status,
    a.actionPlan || "",
    a.comments || ""
  ]);

  const ws5s = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["SUIVI DES AUDITS 5S (RANGEMENT ET STANDARDISATION)", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", "", "", "", "", "", ""],
    [
      "Code Audit",
      "Date",
      "Atelier / Zone",
      "Auditeur",
      "1S Seiri (/20)",
      "2S Seiton (/20)",
      "3S Seiso (/20)",
      "4S Seiketsu (/20)",
      "5S Shitsuke (/20)",
      "Score Total (%)",
      "Conformité",
      "Plan d'Action Correctif",
      "Commentaires"
    ],
    ...(audit5sRows.length > 0 ? audit5sRows : [["N/A", "", "", "", 0, 0, 0, 0, 0, 0, "N/A", "Aucun audit 5S", ""]])
  ]);

  if (ws5s["!ref"]) {
    const range = XLSX.utils.decode_range(ws5s["!ref"]);
    for (let R = 4; R <= range.e.r; ++R) {
      const cellScore = ws5s[XLSX.utils.encode_cell({ r: R, c: 9 })];
      if (cellScore) cellScore.z = "0.0%";
    }
  }

  autoFitColumns(ws5s, 14);
  setProfessionalRowHeights(ws5s, 4);
  XLSX.utils.book_append_sheet(wb, ws5s, "AUDITS_5S");

  // =========================================================================
  // 7. SHEET: LEAN_KAIZEN
  // =========================================================================
  const leanRows = leanItems.map((l) => [
    l.id,
    l.type,
    l.title,
    l.workshop,
    l.author,
    l.dateAdded,
    l.mudaCategory || "N/A",
    l.impactScore || "Moyen",
    l.estimatedSavingTnd || 0,
    l.status,
    l.description || ""
  ]);

  const wsLean = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", "", "", ""],
    ["REGISTRE CHANTIERS LEAN, KAIZEN ET CHASSE AUX GASPILLAGES (MUDA)", "", "", "", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", "", "", "", ""],
    [
      "Code Action",
      "Type de Chantier",
      "Intitulé de l'Action / Suggestion",
      "Atelier",
      "Auteur / Porteur",
      "Date Création",
      "Catégorie Gaspillage (Muda)",
      "Impact Estimé",
      "Gains Potentiels (TND)",
      "Statut d'Avancement",
      "Description"
    ],
    ...(leanRows.length > 0 ? leanRows : [["N/A", "", "Aucune action LEAN enregistrée", "", "", "", "", "", 0, "N/A", ""]])
  ]);

  if (wsLean["!ref"]) {
    const range = XLSX.utils.decode_range(wsLean["!ref"]);
    for (let R = 4; R <= range.e.r; ++R) {
      const cellSaving = wsLean[XLSX.utils.encode_cell({ r: R, c: 8 })];
      if (cellSaving) cellSaving.z = '#,##0.00" TND"';
    }
  }

  autoFitColumns(wsLean, 15);
  setProfessionalRowHeights(wsLean, 4);
  XLSX.utils.book_append_sheet(wb, wsLean, "LEAN_KAIZEN");

  // =========================================================================
  // 8. SHEET: SECURITE_SST
  // =========================================================================
  const safetyRows = safetyRecords.map((s) => [
    s.id,
    s.type,
    s.date,
    s.location,
    s.severity,
    s.responsible,
    s.status,
    s.actionPlan || "",
    s.description || ""
  ]);

  const wsSafety = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", ""],
    ["REGISTRE DE SÉCURITÉ, PRÉVENTION SST ET CONTRÔLES D'ÉQUIPEMENTS", "", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", "", ""],
    [
      "Code Fiche",
      "Type de Contrôle / Incident",
      "Date",
      "Emplacement / Zone",
      "Niveau de Gravité",
      "Responsable Suivi",
      "Statut",
      "Plan d'Action Correctif",
      "Description / Constat"
    ],
    ...(safetyRows.length > 0 ? safetyRows : [["N/A", "", "", "", "", "", "N/A", "Aucune fiche sécurité", ""]])
  ]);

  autoFitColumns(wsSafety, 15);
  setProfessionalRowHeights(wsSafety, 4);
  XLSX.utils.book_append_sheet(wb, wsSafety, "SECURITE_SST");

  // =========================================================================
  // 9. SHEET: QUALITE_ENVIRONNEMENT
  // =========================================================================
  const qualityRows = qualityRecords.map((q) => [
    q.id,
    "Qualité",
    q.type,
    q.title,
    q.workshop,
    q.date,
    q.responsible,
    q.status,
    q.details || ""
  ]);

  const envRows = environmentLogs.map((e) => [
    e.id,
    "Environnement",
    e.category,
    `Suivi ${e.category}`,
    "Atelier / Site Central",
    e.date,
    "Responsable HSE",
    `${e.value} ${e.unit}`,
    `Coût/Économie: ${e.costOrSavingTnd} TND - ${e.notes || ""}`
  ]);

  const combinedQualEnvRows = [...qualityRows, ...envRows];

  const wsQualEnv = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", "", "", "", "", "", "", "", ""],
    ["SUIVI ASSURANCE QUALITÉ, NON-CONFORMITÉS ET IMPACT ENVIRONNEMENTAL", "", "", "", "", "", "", "", ""],
    ["Export du : " + currentDateStr, "", "", "", "", "", "", "", ""],
    [
      "Code Fiche",
      "Domaine",
      "Type / Catégorie",
      "Titre / Objet",
      "Atelier / Zone",
      "Date",
      "Responsable",
      "Statut / Valeur",
      "Détails / Relevés"
    ],
    ...(combinedQualEnvRows.length > 0 ? combinedQualEnvRows : [["N/A", "N/A", "", "Aucun enregistrement qualité/environnement", "", "", "", "", ""]])
  ]);

  autoFitColumns(wsQualEnv, 15);
  setProfessionalRowHeights(wsQualEnv, 4);
  XLSX.utils.book_append_sheet(wb, wsQualEnv, "QUALITE_ENVIRONNEMENT");

  // Write and download XLSX file
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileNameDate = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `ETAT_PROJETS_ET_AMELIORATION_CONTINUE_STA_CHERY_${fileNameDate}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses an Excel or CSV file containing equipment records and converts them to Equipment array.
 */
export async function parseEquipmentExcelFile(file: File): Promise<Equipment[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to JSON rows
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          return resolve([]);
        }

        // Find header row (search for row containing "code" or "nom")
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
          const rowStr = (rawJson[i] || []).join(" ").toLowerCase();
          if (rowStr.includes("code") || rowStr.includes("nom") || rowStr.includes("atelier")) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          headerRowIdx = 0;
        }

        const headers = (rawJson[headerRowIdx] || []).map((h: any) =>
          String(h || "").trim().toLowerCase().replace(/\*/g, "").replace(/\s+/g, "_")
        );

        const dataRows = rawJson.slice(headerRowIdx + 1);
        const parsedEquipments: Equipment[] = [];

        dataRows.forEach((row, idx) => {
          if (!row || row.length === 0) return;

          // Helper to get value by matching header alias
          const getVal = (aliases: string[]): string => {
            for (const alias of aliases) {
              const colIdx = headers.findIndex((h: string) => h.includes(alias));
              if (colIdx !== -1 && row[colIdx] !== undefined && row[colIdx] !== null) {
                return String(row[colIdx]).trim();
              }
            }
            return "";
          };

          const code = getVal(["code_equipement", "code", "ref", "id"]) || `EQ-IMP-${Date.now()}-${idx + 1}`;
          const name = getVal(["nom_equipement", "nom", "designation", "equipement", "libelle"]) || `Équipement Importé N°${idx + 1}`;
          const workshopRaw = getVal(["atelier", "service", "zone", "departement"]) || "Service Rapide";
          const brandModel = getVal(["marque_modele", "marque", "modele"]) || "Non spécifié";
          const serialNumber = getVal(["numero_serie", "serie", "sn", "n_serie"]) || `SN-IMP-${idx + 100}`;
          const location = getVal(["emplacement", "localisation", "site"]) || "Atelier Principal";
          const statusRaw = getVal(["statut", "etat"]) || "Opérationnel";
          const criticiteRaw = getVal(["criticite", "critical"]) || "B - Moyen";
          const priceRaw = parseFloat(getVal(["prix_achat_tnd", "prix", "cout", "montant"])) || 10000;
          const purchaseDate = getVal(["date_achat", "date"]) || new Date().toISOString().split("T")[0];
          const guaranteeMonths = parseInt(getVal(["duree_garantie_mois", "garantie"])) || 24;
          const intervalMonths = parseInt(getVal(["intervalle_inspect_mois", "intervalle"])) || 6;
          const responsable = getVal(["responsable", "technicien"]) || "Responsable Atelier";

          // Calculate warranty end date
          const pDate = new Date(purchaseDate);
          if (!isNaN(pDate.getTime())) {
            pDate.setMonth(pDate.getMonth() + guaranteeMonths);
          }
          const warrantyEnd = !isNaN(pDate.getTime())
            ? pDate.toISOString().split("T")[0]
            : "2027-12-31";

          // Map workshop
          let workshop = "Service Rapide" as any;
          const wsLower = workshopRaw.toLowerCase();
          if (wsLower.includes("mecan")) workshop = "Atelier Mécanique";
          else if (wsLower.includes("diag")) workshop = "Atelier Diagnostic";
          else if (wsLower.includes("carros")) workshop = "Carrosserie";
          else if (wsLower.includes("lav")) workshop = "Lavage";
          else if (wsLower.includes("recept") || wsLower.includes("vente")) workshop = "Réception Après-Vente";
          else if (wsLower.includes("magasin") || wsLower.includes("piec")) workshop = "Magasin Pièces de Rechange";
          else if (wsLower.includes("batiment") || wsLower.includes("infra")) workshop = "Maintenance Bâtiment";

          // Map status
          let status = "Opérationnel" as any;
          const stLower = statusRaw.toLowerCase();
          if (stLower.includes("panne")) status = "En Panne";
          else if (stLower.includes("maint")) status = "En Maintenance";
          else if (stLower.includes("degrad")) status = "Dégradé";
          else if (stLower.includes("hors")) status = "Hors Service";

          // Map criticite
          let criticite = "B - Moyen" as any;
          let critical = false;
          if (criticiteRaw.toLowerCase().includes("a") || criticiteRaw.toLowerCase().includes("crit")) {
            criticite = "A - Critique";
            critical = true;
          } else if (criticiteRaw.toLowerCase().includes("c") || criticiteRaw.toLowerCase().includes("faibl")) {
            criticite = "C - Faible";
            critical = false;
          }

          parsedEquipments.push({
            code: code.toUpperCase(),
            name,
            workshop,
            status,
            purchaseDate,
            warrantyEnd,
            purchasePrice: priceRaw,
            location,
            serialNumber,
            critical,
            criticite,
            inspectionIntervalMonths: intervalMonths,
            mtbfTargetHours: 1200,
            mttrTargetHours: 4,
            responsableName: responsable,
            warrantyDetails: `Garantie constructeur ${guaranteeMonths} mois`
          });
        });

        resolve(parsedEquipments);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
