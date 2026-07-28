import { jsPDF } from "jspdf";
import { Equipment, Intervention } from "../types";

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
 * 2. Generates an Individual Intervention Sheet (Fiche d'intervention)
 */
export function generateInterventionReportPDF(intervention: Intervention, equipment: Equipment) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const title = `BON DE TRAVAIL & RAPPORT D'INTERVENTION`;
  const subTitle = `Rapport N° : ${intervention.id}`;

  drawHeader(doc, title, subTitle);

  let currentY = 52;

  // --- Split Layout: left side intervention, right side equipment info ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, currentY, 88, 52, "FD"); // Left Box

  doc.rect(108, currentY, 88, 52, "FD"); // Right Box

  // Left Box Content (Intervention Main)
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("DÉTAILS DU BON DE TRAVAIL", 18, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Type : ${intervention.type}`, 18, currentY + 13);
  doc.text(`Statut : ${intervention.status}`, 18, currentY + 19);
  doc.text(`Date : ${intervention.dateIntervention}`, 18, currentY + 25);
  doc.text(`Technicien : ${intervention.technician}`, 18, currentY + 31);
  doc.text(`Exécutant : ${intervention.executorType || "Interne"}`, 18, currentY + 37);
  if (intervention.externalProvider) {
    doc.text(`Prestataire : ${intervention.externalProvider}`, 18, currentY + 43);
  } else {
    doc.text(`Priorité : ${intervention.priority || "Moyenne"}`, 18, currentY + 43);
  }
  doc.text(`Coût M.O : ${intervention.costLabor} TND`, 18, currentY + 49);

  // Right Box Content (Associated Machine)
  doc.setFont("Helvetica", "bold");
  doc.text("ÉQUIPEMENT CONCERNÉ", 112, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.text(`Code : ${equipment.code}`, 112, currentY + 13);
  doc.text(`Nom : ${equipment.name}`, 112, currentY + 19);
  doc.text(`Atelier : ${equipment.workshop}`, 112, currentY + 25);
  doc.text(`Localisation : ${equipment.location}`, 112, currentY + 31);
  doc.text(`N° Série : ${equipment.serialNumber}`, 112, currentY + 37);
  doc.text(`Criticité : ${equipment.criticite || (equipment.critical ? "A - Critique" : "B - Moyen")}`, 112, currentY + 43);
  doc.text(`Sous Garantie : ${new Date(equipment.warrantyEnd) > new Date("2026-07-01") ? "Oui" : "Non"}`, 112, currentY + 49);

  currentY += 58;

  // --- Intervention Title & Description ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 230, 230);
  doc.rect(14, currentY, 182, 38, "D");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`TITRE : ${intervention.title}`, 18, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Description du problème ou de la demande initiale :", 18, currentY + 12);

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  wrapAndPrintText(doc, intervention.description, 18, currentY + 17, 174, 4);

  currentY += 44;

  // --- Table of Executed Works (Tableau des Travaux Exécutés) ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("TABLEAU DES TRAVAUX ET OPÉRATIONS EXÉCUTÉS", 14, currentY);
  
  currentY += 4.5;
  
  // Table Header
  doc.setFillColor(204, 0, 0); // STA Cherry red branding color
  doc.rect(14, currentY, 182, 7, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Réf", 17, currentY + 4.5);
  doc.text("Description de la Tâche de Maintenance Exécutée", 30, currentY + 4.5);
  doc.text("État / Validation", 162, currentY + 4.5);
  
  currentY += 7;
  
  const checklistItems = intervention.checklist || [];
  
  // Pre-filled items
  checklistItems.forEach((item, index) => {
    // Zebra striping
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
    } else {
      doc.setFillColor(242, 244, 246);
    }
    doc.rect(14, currentY, 182, 7, "F");
    
    doc.setDrawColor(220, 225, 230);
    doc.line(14, currentY + 7, 196, currentY + 7);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`T-${String(index + 1).padStart(2, "0")}`, 17, currentY + 4.5);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    let taskName = item.task;
    if (taskName.length > 75) taskName = taskName.substring(0, 72) + "...";
    doc.text(taskName, 30, currentY + 4.5);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    if (item.done) {
      doc.setTextColor(16, 124, 65); // Green for completed
      doc.text("✓ EFFECTUÉ", 162, currentY + 4.5);
    } else {
      doc.setTextColor(180, 100, 10); // Amber for pending
      doc.text("NON EFFECTUÉ", 162, currentY + 4.5);
    }
    
    currentY += 7;
  });

  // Dotted empty rows for manual input/addition (makes it super practical!)
  const emptyRowsToDraw = Math.max(3, 5 - checklistItems.length);
  for (let i = 0; i < emptyRowsToDraw; i++) {
    const rowNum = checklistItems.length + i + 1;
    doc.setFillColor(255, 255, 255);
    doc.rect(14, currentY, 182, 7, "F");
    
    doc.setDrawColor(220, 225, 230);
    doc.line(14, currentY + 7, 196, currentY + 7);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(`T-${String(rowNum).padStart(2, "0")}`, 17, currentY + 4.5);
    
    // Dotted lines for hand-writing
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .", 30, currentY + 3.5);
    
    doc.text("[  ] Validé", 162, currentY + 4.5);
    
    currentY += 7;
  }

  currentY += 6;

  // --- Diagnostic and notes ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("RAPPORT DE DIAGNOSTIC ET OBSERVATIONS TECHNIQUES", 14, currentY);
  
  currentY += 4;
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, currentY, 182, 22, "D");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const diagNotes = intervention.notes || "Le technicien n'a renseigné aucune observation particulière. Les travaux ont été exécutés conformément aux procédures standards de la STA.";
  wrapAndPrintText(doc, diagNotes, 18, currentY + 6, 174, 4);

  currentY += 28;

  // --- VALIDATION AND SIGNATURES BLOCKS ---
  // If we overflow the page, we push validation block to the next page
  if (currentY > 210) {
    drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());
    doc.addPage();
    drawHeader(doc, title, subTitle);
    currentY = 54;
  }

  // Validation Title
  doc.setFillColor(244, 63, 94); // Light accent color for validation
  doc.rect(14, currentY, 182, 1, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(204, 0, 0);
  doc.text("VALIDATION TECHNIQUE & SIGNATURES", 14, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(`Imputé le : ${intervention.dateIntervention}  •  Responsable de validation : ${intervention.validationBy || "Bureau Méthodes GMAO"}`, 14, currentY + 11);

  // Columns for validation
  const sigBoxY = currentY + 16;
  
  // Left Column: Technician
  doc.setDrawColor(220, 220, 220);
  doc.rect(14, sigBoxY, 86, 32, "D");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("VISA TECHNICIEN INTERVENANT", 18, sigBoxY + 6);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Nom : ${intervention.technician}`, 18, sigBoxY + 12);
  
  if (intervention.signature) {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Signé numériquement le ${intervention.signature.date}`, 18, sigBoxY + 18);
    doc.text(`Certifié conforme par ${intervention.signature.name}`, 18, sigBoxY + 22);

    // Draw raw touch signature if base64 exists
    if (intervention.signature.dataUrl) {
      try {
        doc.addImage(intervention.signature.dataUrl, "PNG", 18, sigBoxY + 23, 30, 8);
      } catch (e) {
        // Fallback if image failed to load or parse
      }
    }
  } else {
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text("Signature manuscrite requise :", 18, sigBoxY + 18);
  }

  // Right Column: Supervisor
  doc.rect(110, sigBoxY, 86, 32, "D");
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("VALIDATION CHEF SERVICE MAINTENANCE", 114, sigBoxY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Visa GMAO STA CHERY`, 114, sigBoxY + 12);

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Signature et cachet du valideur :", 114, sigBoxY + 18);
  doc.text(`Clôture de l'exercice 2026`, 114, sigBoxY + 25);

  drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());

  doc.save(`Fiche_Intervention_${intervention.id}.pdf`);
}
