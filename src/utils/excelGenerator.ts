/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from "xlsx";
import { Equipment, Intervention, SparePart, MaintenanceContract, BudgetYear, ComplianceCheck, Vendor } from "../types";

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
  spareParts: SparePart[],
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
    ["Articles Pièces de Rechange (Magasin)", { v: spareParts.length, t: "n", z: '#,##0" articles"' }],
    ["Valeur Totale du Stock Pièces", { v: spareParts.reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0), t: "n", z: '#,##0.00" TND"' }],
    ["Total Contrats Actifs", { v: contracts.length, t: "n", z: '#,##0" contrats"' }],
    ["Vérifications Réglementaires Périodiques", { v: compliance.length, t: "n", z: '#,##0" contrôles"' }],
    ["Budget Annuel Global Alloué (2026)", { v: Object.values(budget.allocatedByWorkshop).reduce((a, b) => a + b, 0), t: "n", z: '#,##0.00" TND"' }],
    ["Total Dépenses Cumulées (2026)", { v: Object.values(budget.spentByWorkshop || {}).reduce((a, b) => a + b, 0), t: "n", z: '#,##0.00" TND"' }],
    ["", ""],
    ["ORGANISATION DU CLASSEUR", ""],
    ["Nom de l'onglet", "Description du contenu et usage opérationnel"],
    ["SOMMAIRE", "Tableau de bord général de synthèse et index des données exportées"],
    ["EQUIPEMENTS", "Registre exhaustif du parc d'équipements, ateliers, criticité et état de garantie"],
    ["INTERVENTIONS", "Historique de maintenance corrective et préventive avec calcul des coûts de pièces et M.O."],
    ["PIECES_RECHANGE", "État du stock, valeurs d'inventaire, seuils critiques et alertes réapprovisionnement"],
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
  // SHEET 3: PIECES_RECHANGE (INVENTAIRE)
  // =========================================================================
  const partHeaders = [
    "Code Pièce",
    "Désignation de la Pièce",
    "Stock Actuel",
    "Seuil d'Alerte (Min)",
    "Prix Unitaire (TND)",
    "Alerte Réappro",
    "Valeur Estimée Stock (TND)",
    "Emplacement",
    "Catégorie"
  ];

  const partRows = spareParts.map((part, index) => {
    const rowNum = index + 5; // Rows 1-3 are title band, Row 4 is Header
    return [
      { v: part.code, t: "s" },
      { v: part.name, t: "s" },
      { v: part.currentStock, t: "n", z: '#,##0' },
      { v: part.reorderPoint, t: "n", z: '#,##0' },
      { v: part.unitPrice, t: "n", z: '#,##0.00" TND"' },
      { f: `IF(C${rowNum}<=D${rowNum},"⚠️ Réapprovisionnement Requis","Stock Conforme")`, t: "s" },
      { f: `C${rowNum}*E${rowNum}`, t: "n", z: '#,##0.00" TND"' },
      { v: part.location, t: "s" },
      { v: part.category, t: "s" }
    ];
  });

  const wsSpareParts = XLSX.utils.aoa_to_sheet([
    ["SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", ""],
    ["ÉTAT DES STOCKS & INVENTAIRE VALORISÉ DU MAGASIN", ""],
    ["", ""],
    partHeaders,
    ...partRows
  ]);
  autoFitColumns(wsSpareParts, 14);
  setProfessionalRowHeights(wsSpareParts, 4);
  XLSX.utils.book_append_sheet(wb, wsSpareParts, "PIECES_RECHANGE");

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
