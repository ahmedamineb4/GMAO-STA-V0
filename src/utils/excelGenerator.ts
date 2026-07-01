/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from "xlsx";
import { Equipment, Intervention, SparePart, MaintenanceContract, BudgetYear, ComplianceCheck, Vendor } from "../types";

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

  // ---------------------------------------------------------
  // SHEET 1: EQUIPEMENTS
  // ---------------------------------------------------------
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
    "Garantie Status"
  ];

  const eqRows = equipments.map((eq, index) => {
    const rowNum = index + 2; // Row 1 is header
    // We add an Excel formula to check if warranty is expired relative to current date (or a static mock check in Excel)
    // Excel formula for warranty status: =SI(F2<AUJOURDHUI();"Garantie Expirée";"Sous Garantie")
    return [
      eq.code,
      eq.name,
      eq.workshop,
      eq.status,
      eq.purchaseDate,
      eq.warrantyEnd,
      eq.purchasePrice,
      eq.location,
      eq.serialNumber,
      eq.critical ? "OUI" : "NON",
      eq.lastInspectionDate || "N/A",
      eq.inspectionIntervalMonths || 0,
      eq.mtbfTargetHours,
      eq.mttrTargetHours,
      { f: `IF(F${rowNum}<TODAY(),"Garantie Expirée","Sous Garantie")` } // Formula for Excel (using English function name for compatibility)
    ];
  });

  const wsEquipments = XLSX.utils.aoa_to_sheet([eqHeaders, ...eqRows]);
  XLSX.utils.book_append_sheet(wb, wsEquipments, "EQUIPEMENTS");


  // ---------------------------------------------------------
  // SHEET 2: INTERVENTIONS
  // ---------------------------------------------------------
  const intHeaders = [
    "ID Intervention",
    "Code Équipement",
    "Type d'Intervention",
    "Titre / Descriptif",
    "Date d'Intervention",
    "Durée (Heures)",
    "Coût Pièces (TND)",
    "Coût M.O. (TND)",
    "Coût Total (TND)",
    "Technicien / Prestataire",
    "Statut",
    "Notes"
  ];

  const intRows = interventions.map((int, index) => {
    const rowNum = index + 2;
    // Excel formula: Coût Total = Coût Pièces + Coût M.O.
    return [
      int.id,
      int.equipmentCode,
      int.type,
      int.title,
      int.dateIntervention,
      int.durationHours,
      int.costParts,
      int.costLabor,
      { f: `G${rowNum}+H${rowNum}` }, // G is CostParts, H is CostLabor
      int.technician,
      int.status,
      int.notes || ""
    ];
  });

  const wsInterventions = XLSX.utils.aoa_to_sheet([intHeaders, ...intRows]);
  XLSX.utils.book_append_sheet(wb, wsInterventions, "INTERVENTIONS");


  // ---------------------------------------------------------
  // SHEET 3: PIECES_RECHANGE
  // ---------------------------------------------------------
  const partHeaders = [
    "Code Pièce",
    "Désignation de la Pièce",
    "Stock Actuel",
    "Seuil d'Alerte (Min)",
    "Prix Unitaire (TND)",
    "Alerte Réappro",
    "Valeur Stock (TND)",
    "Emplacement Magasin",
    "Catégorie"
  ];

  const partRows = spareParts.map((part, index) => {
    const rowNum = index + 2;
    // Alerte Réappro: =IF(C2<=D2,"COMMANDE REQUISE","Stock Conforme")
    // Valeur Stock: =C2*E2
    return [
      part.code,
      part.name,
      part.currentStock,
      part.reorderPoint,
      part.unitPrice,
      { f: `IF(C${rowNum}<=D${rowNum},"Alerte Stock Bas","Stock OK")` },
      { f: `C${rowNum}*E${rowNum}` },
      part.location,
      part.category
    ];
  });

  const wsSpareParts = XLSX.utils.aoa_to_sheet([partHeaders, ...partRows]);
  XLSX.utils.book_append_sheet(wb, wsSpareParts, "PIECES_RECHANGE");


  // ---------------------------------------------------------
  // SHEET 4: CONTRATS_FOURNISSEURS
  // ---------------------------------------------------------
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
      c.id,
      c.title,
      vendor ? vendor.name : c.vendorId,
      c.costAnnual,
      c.startDate,
      c.endDate,
      c.status,
      c.frequency,
      c.coveredEquipments.join(", ")
    ];
  });

  const wsContracts = XLSX.utils.aoa_to_sheet([contractHeaders, ...contractRows]);
  XLSX.utils.book_append_sheet(wb, wsContracts, "FOURNISSEURS_CONTRATS");


  // ---------------------------------------------------------
  // SHEET 5: CONFORMITE_REGLEMENTAIRE
  // ---------------------------------------------------------
  const compHeaders = [
    "ID Contrôle",
    "Code Équipement",
    "Libellé du Contrôle",
    "Organisme Agrée",
    "Date de l'Inspection",
    "Prochaine Date d'Inspection",
    "Statut de Conformité",
    "Référence Rapport",
    "Alerte Échéance"
  ];

  const compRows = compliance.map((cmp, index) => {
    const rowNum = index + 2;
    // Alerte Échéance: =IF(F2<TODAY(),"URGENT: EXPIRÉ",IF(F2<TODAY()+30,"À planifier (moins de 30j)","Conforme"))
    return [
      cmp.id,
      cmp.equipmentCode,
      cmp.title,
      cmp.bodyName,
      cmp.inspectionDate,
      cmp.nextInspectionDate,
      cmp.status,
      cmp.reportRef,
      { f: `IF(F${rowNum}<TODAY(),"EXPIRE / REFAIRE",IF(F${rowNum}<TODAY()+30,"Échéance Proche (<30j)","À jour")` }
    ];
  });

  const wsCompliance = XLSX.utils.aoa_to_sheet([compHeaders, ...compRows]);
  XLSX.utils.book_append_sheet(wb, wsCompliance, "CONTROLES_REGLEMENTAIRES");


  // ---------------------------------------------------------
  // SHEET 6: SUIVI_BUDGETAIRE
  // ---------------------------------------------------------
  const budgetHeaders = [
    "Atelier / Service",
    "Budget Alloué (TND)",
    "Dépenses Actuelles (TND)",
    "Reste Budget (TND)",
    "Alerte Dépassement",
    "Taux de Consommation (%)"
  ];

  const workshopsList = Object.keys(budget.allocatedByWorkshop) as Array<keyof typeof budget.allocatedByWorkshop>;
  const budgetRows = workshopsList.map((wsName, index) => {
    const rowNum = index + 2;
    const allocated = budget.allocatedByWorkshop[wsName];
    const spent = budget.spentByWorkshop[wsName];
    // Reste Budget: =B2-C2
    // Alerte Dépassement: =IF(C2>B2,"Dépassement Budgétaire !!!","Budget OK")
    // Taux Consommation: =C2/B2
    return [
      wsName,
      allocated,
      spent,
      { f: `B${rowNum}-C${rowNum}` },
      { f: `IF(C${rowNum}>B${rowNum},"DEPASSEMENT !!!","Budget OK")` },
      { f: `C${rowNum}/B${rowNum}` }
    ];
  });

  // Add a total row at the end of Budget sheet
  const totalRowNum = budgetRows.length + 2;
  const totalRow = [
    "TOTAL GENERAL",
    { f: `SUM(B2:B${totalRowNum - 1})` },
    { f: `SUM(C2:C${totalRowNum - 1})` },
    { f: `B${totalRowNum}-C${totalRowNum}` },
    { f: `IF(C${totalRowNum}>B${totalRowNum},"DEPASSEMENT TOTAL !!!","Budget Total OK")` },
    { f: `C${totalRowNum}/B${totalRowNum}` }
  ];

  const wsBudget = XLSX.utils.aoa_to_sheet([budgetHeaders, ...budgetRows, totalRow]);
  XLSX.utils.book_append_sheet(wb, wsBudget, "SUIVI_BUDGETAIRE");


  // Write binary Excel and trigger download
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
  const downloadUrl = URL.createObjectURL(dataBlob);
  const tempLink = document.createElement("a");
  tempLink.href = downloadUrl;
  tempLink.setAttribute("download", "GMAO_STA_Chery_Tunisie_2026.xlsx");
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}
