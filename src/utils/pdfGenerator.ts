import jsPDFDefault, { jsPDF as jsPDFNamed } from "jspdf";
import { Equipment, Intervention } from "../types";

// Flexible fallback for ESM / CommonJS bundlers (Vite local dev server)
const jsPDF = jsPDFNamed || jsPDFDefault;
type jsPDF = InstanceType<typeof jsPDFDefault>;

/**
 * Draws a professional header with STA Chery branding on a jsPDF instance
 */
function drawHeader(doc: jsPDF, title: string, subtitle?: string) {
  // STA Cherry Brand color: deep cherry red (#CC0000)
  doc.setFillColor(204, 0, 0);
  doc.rect(14, 12, 182, 4, "F");

  // Title brand
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(204, 0, 0);
  doc.text("SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", 14, 23);

  // Sub-brand / Department
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Département Maintenance Industrielle & SAV - Service GMAO", 14, 28);

  // Document Title Banner
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 32, 182, 12, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(title.toUpperCase(), 18, 40);

  if (subtitle) {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 110);
    // Align subtitle to the right side of the banner
    doc.text(subtitle, 196 - doc.getTextWidth(subtitle), 40);
  }

  // Thin separator
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 48, 196, 48);
}

/**
 * Draws a footer with page number and general info
 */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const footerY = 285;
  doc.setDrawColor(225, 225, 225);
  doc.line(14, footerY - 5, 196, footerY - 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("STA CHERY - Application GMAO Interne v2.0 - Document confidentiel", 14, footerY);
  
  const pgStr = `Page ${pageNum} / ${totalPages}`;
  doc.text(pgStr, 196 - doc.getTextWidth(pgStr), footerY);
}

/**
 * Helper to wrap text into multiple lines safely
 */
function wrapAndPrintText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  if (!text) return y;
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

/**
 * 1. Generates an Equipment History PDF
 */
export function generateEquipmentBreakdownPDF(equipment: Equipment, interventions: Intervention[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const title = `FICHE HISTORIQUE DE PANNE ET RÉPARATION`;
  const subTitle = `Réf: ${equipment.code}`;
  
  drawHeader(doc, title, subTitle);

  // --- Equipment details box ---
  doc.setFillColor(248, 250, 252); // soft slate color
  doc.setDrawColor(230, 235, 240);
  doc.rect(14, 52, 182, 34, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("INFORMATIONS ÉQUIPEMENT", 18, 58);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text(`Nom : ${equipment.name}`, 18, 64);
  doc.text(`Atelier : ${equipment.workshop}`, 18, 69);
  doc.text(`Localisation : ${equipment.location}`, 18, 74);
  doc.text(`S/N Série : ${equipment.serialNumber}`, 18, 79);

  // Column 2
  const statusColor = equipment.status === "Opérationnel" ? "OPÉRATIONNEL" : equipment.status.toUpperCase();
  doc.text(`Statut Actuel : ${statusColor}`, 110, 64);
  doc.text(`Criticité : ${equipment.criticite || (equipment.critical ? "A - Critique" : "B - Moyen")}`, 110, 69);
  doc.text(`Date d'Achat : ${equipment.purchaseDate}`, 110, 74);
  doc.text(`Garantie jusqu'au : ${equipment.warrantyEnd}`, 110, 79);

  // --- Key Metrics ---
  doc.setFillColor(254, 242, 242); // very soft red
  doc.setDrawColor(252, 165, 165);
  doc.rect(14, 90, 182, 14, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(153, 27, 27); // deep red
  doc.text("INDICATEURS DE SÉCURITÉ DE L'ÉQUIPEMENT", 18, 95);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  
  // Calculate average repair time (MTTR) and breakdown count for this equipment
  const eqInterventions = interventions.filter(i => i.equipmentCode === equipment.code);
  const correctives = eqInterventions.filter(i => i.type === "Correctif");
  const totalLaborCost = eqInterventions.reduce((sum, i) => sum + (i.costLabor || 0), 0);

  doc.text(`Total Interventions : ${eqInterventions.length}`, 18, 100);
  doc.text(`Pannes (Correctif) : ${correctives.length}`, 75, 100);
  doc.text(`Coût Total Main d'Œuvre : ${totalLaborCost.toLocaleString()} TND`, 130, 100);

  // --- Tabular Interventions History ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("HISTORIQUE DÉTAILLÉ DES INTERVENTIONS ET ACTIONS CORRECTIVES", 14, 112);

  // Draw Table Header
  let currentY = 117;
  doc.setFillColor(220, 38, 38); // Header row color
  doc.rect(14, currentY, 182, 7, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Code/Date", 16, currentY + 5);
  doc.text("Type / Titre de l'intervention", 42, currentY + 5);
  doc.text("Technicien", 115, currentY + 5);
  doc.text("Durée (h)", 147, currentY + 5);
  doc.text("Coût (TND)", 172, currentY + 5);

  currentY += 7;

  if (eqInterventions.length === 0) {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Aucune intervention de maintenance enregistrée pour le moment.", 18, currentY + 10);
  } else {
    eqInterventions.forEach((int, idx) => {
      // Manage page overflow
      if (currentY > 260) {
        drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());
        doc.addPage();
        drawHeader(doc, title, subTitle);
        
        // Re-draw table header
        currentY = 54;
        doc.setFillColor(220, 38, 38);
        doc.rect(14, currentY, 182, 7, "F");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("Code/Date", 16, currentY + 5);
        doc.text("Type / Titre de l'intervention", 42, currentY + 5);
        doc.text("Technicien", 115, currentY + 5);
        doc.text("Durée (h)", 147, currentY + 5);
        doc.text("Coût (TND)", 172, currentY + 5);
        currentY += 7;
      }

      // Zebra striping
      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
      } else {
        doc.setFillColor(240, 240, 240);
      }
      doc.rect(14, currentY, 182, 10, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(50, 50, 50);
      doc.text(int.id, 16, currentY + 4);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(int.dateIntervention, 16, currentY + 8);

      // Title & Type
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(int.type === "Correctif" ? 204 : 30, int.type === "Correctif" ? 0 : 30, int.type === "Correctif" ? 0 : 30);
      doc.text(`[${int.type}]`, 42, currentY + 4);
      
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      let shortTitle = int.title;
      if (shortTitle.length > 40) shortTitle = shortTitle.substring(0, 37) + "...";
      doc.text(shortTitle, 62, currentY + 4);

      // Description snippet
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(110, 110, 110);
      let shortDesc = int.description;
      if (shortDesc.length > 55) shortDesc = shortDesc.substring(0, 52) + "...";
      doc.text(shortDesc, 42, currentY + 8);

      // Technician
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(int.technician || "N/A", 115, currentY + 6);

      // Duration
      doc.text(`${int.durationHours} h`, 147, currentY + 6);

      // Cost
      doc.setFont("Helvetica", "bold");
      doc.text(`${int.costLabor} TND`, 172, currentY + 6);

      currentY += 10;
    });
  }

  // Draw signatures part at bottom of the main page or next page
  if (currentY > 210) {
    drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());
    doc.addPage();
    drawHeader(doc, title, subTitle);
    currentY = 54;
  }

  // Signature Block
  const sigY = 220;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, sigY, 196, sigY);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("Contrôle Qualité & Clôture GMAO", 14, sigY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("L'historique ci-dessus reflète l'intégralité des opérations de maintenance imputées à cette machine.", 14, sigY + 11);

  // Signatures columns
  doc.setFont("Helvetica", "bold");
  doc.text("Le Chef d'Atelier Émetteur", 20, sigY + 22);
  doc.text("Visa Chef de Service Maintenance", 120, sigY + 22);

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Date et signature :", 20, sigY + 27);
  doc.text("Date, signature et cachet :", 120, sigY + 27);

  // draw page count for the last page
  drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());

  doc.save(`Historique_Pannes_${equipment.code}.pdf`);
}

/**
 * 2. Generates an Individual Intervention Sheet (Fiche d'intervention - 100% Guaranteed Single A4 Page)
 */
export function generateInterventionReportPDF(intervention: Intervention, equipment: Equipment) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const leftX = 12;
  const rightX = 198;
  const contentWidth = rightX - leftX; // 186mm

  // --- 1. BRAND HEADER (Y: 10 -> 34) ---
  // Chery Red top bar
  doc.setFillColor(200, 16, 46);
  doc.rect(leftX, 10, contentWidth, 3, "F");

  // Company Brand Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(200, 16, 46);
  doc.text("SOCIÉTÉ TUNISIENNE D'AUTOMOBILES (STA CHERY)", leftX, 18);

  // Sub-brand / Direction
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Département Après-Vente & Maintenance Industrielle • Direction Technique STA", leftX, 22.5);

  // Document Title Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(leftX, 25, contentWidth, 9, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(leftX, 25, contentWidth, 9, "D");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("BON DE TRAVAIL & RAPPORT D'INTERVENTION", leftX + 4, 31);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(200, 16, 46);
  const rightBannerText = `Rapport N° : ${intervention.id}   |   Date : ${intervention.dateIntervention}`;
  doc.text(rightBannerText, rightX - doc.getTextWidth(rightBannerText) - 4, 31);

  // --- 2. DOUBLE COLUMN: INTERVENTION & EQUIPMENT (Y: 37 -> 71, Height: 34mm) ---
  const boxY = 37;
  const boxHeight = 34;
  const colWidth = 91; // 91 + 4 gap + 91 = 186mm

  // Left Box: Intervention details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftX, boxY, colWidth, boxHeight, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. DÉTAILS DE L'INTERVENTION", leftX + 4, boxY + 5.5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`• Type : `, leftX + 4, boxY + 11);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(intervention.type === "Correctif" ? 200 : 30, intervention.type === "Correctif" ? 16 : 41, intervention.type === "Correctif" ? 46 : 59);
  doc.text(`${intervention.type}`, leftX + 17, boxY + 11);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`• Statut : `, leftX + 45, boxY + 11);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(intervention.status === "Clôturée" ? 16 : 180, intervention.status === "Clôturée" ? 124 : 100, intervention.status === "Clôturée" ? 65 : 10);
  doc.text(`${intervention.status}`, leftX + 57, boxY + 11);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`• Technicien : ${intervention.technician || "Non spécifié"}`, leftX + 4, boxY + 16.5);
  doc.text(`• Exécutant : ${intervention.executorType || "Interne"} ${intervention.externalProvider ? `(${intervention.externalProvider})` : ""}`, leftX + 4, boxY + 22);
  doc.text(`• Urgence / Prio : ${intervention.priority || "Moyenne"}`, leftX + 4, boxY + 27.5);
  doc.text(`• Durée : ${intervention.durationHours || 0} h   •   Coût M.O : ${intervention.costLabor || 0} TND`, leftX + 4, boxY + 32);

  // Right Box: Equipment details
  const rightColX = leftX + colWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightColX, boxY, colWidth, boxHeight, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. ÉQUIPEMENT CONCERNÉ", rightColX + 4, boxY + 5.5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  let eqNameShort = equipment.name;
  if (eqNameShort.length > 28) eqNameShort = eqNameShort.substring(0, 26) + "...";
  doc.text(`• Machine : [${equipment.code}] ${eqNameShort}`, rightColX + 4, boxY + 11);
  doc.text(`• Atelier : ${equipment.workshop}`, rightColX + 4, boxY + 16.5);
  doc.text(`• Localisation : ${equipment.location || "Non spécifiée"}`, rightColX + 4, boxY + 22);
  doc.text(`• N° de Série : ${equipment.serialNumber || "N/A"}`, rightColX + 4, boxY + 27.5);
  doc.text(`• Criticité : ${equipment.criticite || (equipment.critical ? "A - Critique" : "B - Normal")}   •   Garantie : ${equipment.warrantyEnd || "N/A"}`, rightColX + 4, boxY + 32);

  // --- 3. NATURE DU PROBLÈME / OBJET (Y: 74 -> 94, Height: 20mm) ---
  const objY = 74;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftX, objY, contentWidth, 20, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("3. OBJET & DESCRIPTION DU DYSFONCTIONNEMENT", leftX + 4, objY + 5);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(200, 16, 46);
  let titleStr = `Désignation : ${intervention.title}`;
  if (titleStr.length > 95) titleStr = titleStr.substring(0, 92) + "...";
  doc.text(titleStr, leftX + 4, objY + 10);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let descStr = intervention.description || "Aucune description complémentaire fournie.";
  const wrappedDesc = doc.splitTextToSize(descStr, contentWidth - 8);
  const maxLines = wrappedDesc.slice(0, 2);
  let dY = objY + 14.5;
  maxLines.forEach((l: string) => {
    doc.text(l, leftX + 4, dY);
    dY += 4;
  });

  // --- 4. TABLEAU DES TRAVAUX EXÉCUTÉS & PIÈCES (Y: 97 -> 155, Height: 58mm) ---
  const tableY = 97;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("4. TRAVAUX RÉALISÉS, CHECK-LIST & FOURNITURES", leftX, tableY + 3);

  // Table Header (Chery Red)
  const thY = tableY + 5;
  doc.setFillColor(200, 16, 46);
  doc.rect(leftX, thY, contentWidth, 5.5, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("N°", leftX + 3, thY + 4);
  doc.text("Description de l'Opération / Tâche de Maintenance", leftX + 18, thY + 4);
  doc.text("Pièces / Fournitures", leftX + 120, thY + 4);
  doc.text("État / Visa", leftX + 162, thY + 4);

  // Rows (Max 5 rows, compact 6mm each)
  let rowY = thY + 5.5;
  const checklist = intervention.checklist || [];
  const partsUsed = intervention.partsUsed || [];
  const totalDisplayRows = 5;

  for (let i = 0; i < totalDisplayRows; i++) {
    const item = checklist[i];
    const part = partsUsed[i];

    // Background striping
    if (i % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(leftX, rowY, contentWidth, 6, "F");
    doc.setDrawColor(235, 238, 242);
    doc.line(leftX, rowY + 6, rightX, rowY + 6);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`T-${String(i + 1).padStart(2, "0")}`, leftX + 3, rowY + 4.2);

    if (item) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      let tText = item.task;
      if (tText.length > 58) tText = tText.substring(0, 55) + "...";
      doc.text(tText, leftX + 18, rowY + 4.2);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      if (item.done) {
        doc.setTextColor(16, 124, 65);
        doc.text("✓ FAIT", leftX + 164, rowY + 4.2);
      } else {
        doc.setTextColor(180, 100, 10);
        doc.text("EN ATTENTE", leftX + 164, rowY + 4.2);
      }
    } else {
      // Empty line for manual notes
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(203, 213, 225);
      doc.text(". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .", leftX + 18, rowY + 4);
      doc.text("[  ] Conforme", leftX + 164, rowY + 4.2);
    }

    // Part column
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    if (part) {
      let pStr = `${part.quantity}x ${part.partCode}`;
      if (pStr.length > 24) pStr = pStr.substring(0, 22) + "..";
      doc.text(pStr, leftX + 120, rowY + 4.2);
    } else if (i === 0 && partsUsed.length === 0) {
      doc.text("Fournitures atelier", leftX + 120, rowY + 4.2);
    } else {
      doc.text("-", leftX + 120, rowY + 4.2);
    }

    rowY += 6;
  }

  // --- 5. OBSERVATIONS & BILAN FINANCIER (Y: 158 -> 198, Height: 40mm) ---
  const diagY = 158;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftX, diagY, contentWidth, 24, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("5. RAPPORT DE DIAGNOSTIC, CAUSE RACINE & RECOMMANDATIONS", leftX + 4, diagY + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const diagNotes = intervention.notes || "Les travaux ont été exécutés conformément aux standards techniques de la STA Chery. L'équipement est testé et déclaré opérationnel.";
  const wrappedNotes = doc.splitTextToSize(diagNotes, contentWidth - 8).slice(0, 3);
  let nY = diagY + 10;
  wrappedNotes.forEach((line: string) => {
    doc.text(line, leftX + 4, nY);
    nY += 4;
  });

  // Financial Cost Recap Bar (Y: 185 -> 198)
  const costBarY = 185;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(leftX, costBarY, contentWidth, 13, 2, 2, "FD");
  doc.setDrawColor(203, 213, 225);

  const totalInterventionCost = (intervention.costLabor || 0) + (intervention.costParts || 0);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("SYNTHÈSE IMPUTATION :", leftX + 4, costBarY + 8);

  doc.setFont("Helvetica", "normal");
  doc.text(`Temps : ${intervention.durationHours || 0} h`, leftX + 50, costBarY + 8);
  doc.text(`M.O : ${(intervention.costLabor || 0).toLocaleString()} TND`, leftX + 85, costBarY + 8);
  doc.text(`Pièces : ${(intervention.costParts || 0).toLocaleString()} TND`, leftX + 125, costBarY + 8);

  doc.setFont("Helvetica", "bold");
  doc.setTextColor(200, 16, 46);
  doc.text(`TOTAL : ${totalInterventionCost.toLocaleString()} TND`, leftX + 158, costBarY + 8);

  // --- 6. VALIDATION & SIGNATURES (Y: 202 -> 248, Height: 46mm) ---
  const sigSectionY = 202;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("6. VALIDATION TECHNIQUE, VISA & CLÔTURE DU BON", leftX, sigSectionY + 3);

  const sigBoxY = sigSectionY + 6;
  const sigBoxHeight = 40;

  // Left Signature: Technician
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(leftX, sigBoxY, colWidth, sigBoxHeight, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("VISA DU TECHNICIEN INTERVENANT", leftX + 4, sigBoxY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nom : ${intervention.technician || "Ahmed Amine"}`, leftX + 4, sigBoxY + 11.5);
  doc.text(`Date d'exécution : ${intervention.dateIntervention}`, leftX + 4, sigBoxY + 16.5);

  if (intervention.signature) {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(16, 124, 65);
    doc.text(`✓ Signé numériquement par ${intervention.signature.name}`, leftX + 4, sigBoxY + 22);

    if (intervention.signature.dataUrl) {
      try {
        doc.addImage(intervention.signature.dataUrl, "PNG", leftX + 4, sigBoxY + 24, 38, 12);
      } catch (e) {
        doc.text("[Signature électronique certifiée]", leftX + 4, sigBoxY + 28);
      }
    }
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Signature manuscrite du technicien :", leftX + 4, sigBoxY + 22);
    doc.line(leftX + 4, sigBoxY + 34, leftX + colWidth - 8, sigBoxY + 34);
  }

  // Right Signature: Supervisor / Chef d'Atelier
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightColX, sigBoxY, colWidth, sigBoxHeight, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("VISA CHEF D'ATELIER / SERVICE GMAO", rightColX + 4, sigBoxY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Valideur : ${intervention.validationBy || "Bureau Méthodes & SAV"}`, rightColX + 4, sigBoxY + 11.5);
  doc.text(`Statut final : Clôturé & Conforme aux normes STA`, rightColX + 4, sigBoxY + 16.5);

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Cachet et signature du responsable :", rightColX + 4, sigBoxY + 22);
  doc.line(rightColX + 4, sigBoxY + 34, rightColX + colWidth - 8, sigBoxY + 34);

  // --- 7. OFFICIAL COMPACT FOOTER (Y: 280 -> 287) ---
  const hasPhotos = ((intervention.photosBefore?.length || 0) > 0) || ((intervention.photosAfter?.length || 0) > 0) || ((intervention.photos?.length || 0) > 0);
  const totalPages = hasPhotos ? 2 : 1;

  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.line(leftX, footerY, rightX, footerY);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("SOCIÉTÉ TUNISIENNE D'AUTOMOBILES • PORTAIL GMAO STA CHERY v1.0 • DOCUMENT OFFICIEL DE TRAÇABILITÉ", leftX, footerY + 4.5);

  doc.setFont("Helvetica", "bold");
  doc.text(`Page 1 / ${totalPages}`, rightX - doc.getTextWidth(`Page 1 / ${totalPages}`), footerY + 4.5);

  // --- OPTIONAL PAGE 2: PHOTOGRAPHIC ANNEX (BEFORE & AFTER) ---
  if (hasPhotos) {
    doc.addPage();
    drawHeader(doc, `ANNEXE PHOTOGRAPHIQUE - BON N° ${intervention.id}`, `Machine : [${equipment.code}] ${equipment.name} • Date : ${intervention.dateIntervention}`);

    let pY = 50;

    // Photos Avant Section
    const beforeList = intervention.photosBefore || [];
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9); // Amber
    doc.text(`1. PHOTOS AVANT INTERVENTION (CONSTAT / DÉFAILLANCE) [${beforeList.length}]`, leftX, pY);
    pY += 6;

    if (beforeList.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Aucune photo avant intervention attachée à ce dossier.", leftX + 4, pY);
      pY += 12;
    } else {
      let curX = leftX;
      beforeList.slice(0, 3).forEach((imgData, i) => {
        try {
          doc.setFillColor(254, 243, 199);
          doc.rect(curX - 1, pY - 1, 56, 42, "F");
          doc.addImage(imgData, "JPEG", curX, pY, 54, 40);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(180, 83, 9);
          doc.text(`Photo Avant #${i + 1}`, curX + 2, pY + 44);
        } catch (e) {
          doc.text(`[Photo Avant #${i + 1}]`, curX, pY + 10);
        }
        curX += 60;
      });
      pY += 50;
    }

    // Photos Après Section
    const afterList = intervention.photosAfter || (!intervention.photosBefore ? (intervention.photos || []) : []);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(16, 124, 65); // Green
    doc.text(`2. PHOTOS APRÈS INTERVENTION (RÉPARATION / REMISE EN SERVICE) [${afterList.length}]`, leftX, pY);
    pY += 6;

    if (afterList.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Aucune photo après intervention attachée à ce dossier.", leftX + 4, pY);
      pY += 12;
    } else {
      let curX = leftX;
      afterList.slice(0, 3).forEach((imgData, i) => {
        try {
          doc.setFillColor(220, 252, 231);
          doc.rect(curX - 1, pY - 1, 56, 42, "F");
          doc.addImage(imgData, "JPEG", curX, pY, 54, 40);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(16, 124, 65);
          doc.text(`Photo Après #${i + 1}`, curX + 2, pY + 44);
        } catch (e) {
          doc.text(`[Photo Après #${i + 1}]`, curX, pY + 10);
        }
        curX += 60;
      });
      pY += 50;
    }

    // Page 2 Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(leftX, footerY, rightX, footerY);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("SOCIÉTÉ TUNISIENNE D'AUTOMOBILES • PORTAIL GMAO STA CHERY v1.0 • PREUVES VISUELLES", leftX, footerY + 4.5);

    doc.setFont("Helvetica", "bold");
    doc.text(`Page 2 / ${totalPages}`, rightX - doc.getTextWidth(`Page 2 / ${totalPages}`), footerY + 4.5);
  }

  // Single page download trigger
  doc.save(`Bon_Intervention_${intervention.id}.pdf`);
}
