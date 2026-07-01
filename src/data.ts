/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Equipment,
  Intervention,
  SparePart,
  Vendor,
  MaintenanceContract,
  BudgetYear,
  ComplianceCheck,
  Workshop
} from "./types";

export const WORKSHOPS: Workshop[] = [
  "Service Rapide",
  "Atelier Mécanique",
  "Atelier Diagnostic",
  "Carrosserie",
  "Lavage",
  "Réception Après-Vente",
  "Magasin Pièces de Rechange",
  "Maintenance Bâtiment"
];

export const INITIAL_EQUIPMENTS: Equipment[] = [
  {
    code: "EQ-SR-01",
    name: "Pont Élévateur 2 Colonnes Ravaglioli 4T",
    workshop: "Service Rapide",
    status: "Opérationnel",
    purchaseDate: "2023-03-15",
    warrantyEnd: "2025-03-15", // Expired
    purchasePrice: 14500,
    location: "Baie Service Rapide 1",
    serialNumber: "RAV-2023-9910",
    critical: true,
    lastInspectionDate: "2026-04-10",
    inspectionIntervalMonths: 6,
    mtbfTargetHours: 1200,
    mttrTargetHours: 3
  },
  {
    code: "EQ-SR-02",
    name: "Démonte-Pneus Automatique Corghi",
    workshop: "Service Rapide",
    status: "Opérationnel",
    purchaseDate: "2023-05-10",
    warrantyEnd: "2025-05-10",
    purchasePrice: 8500,
    location: "Zone Pneumatiques",
    serialNumber: "COR-5512-T3",
    critical: false,
    lastInspectionDate: "2025-11-15",
    inspectionIntervalMonths: 12,
    mtbfTargetHours: 800,
    mttrTargetHours: 4
  },
  {
    code: "EQ-AM-01",
    name: "Banc de Géométrie 3D John Bean",
    workshop: "Atelier Mécanique",
    status: "Opérationnel",
    purchaseDate: "2024-02-20",
    warrantyEnd: "2026-02-20",
    purchasePrice: 28000,
    location: "Baie Géométrie 3D",
    serialNumber: "JB-3D-8821",
    critical: true,
    lastInspectionDate: "2026-01-20",
    inspectionIntervalMonths: 6,
    mtbfTargetHours: 1500,
    mttrTargetHours: 5
  },
  {
    code: "EQ-AM-02",
    name: "Pont Ciseaux Encastré Ravaglioli",
    workshop: "Atelier Mécanique",
    status: "Dégradé",
    purchaseDate: "2023-08-11",
    warrantyEnd: "2025-08-11",
    purchasePrice: 19800,
    location: "Baie Alignement Mécanique 4",
    serialNumber: "RAV-CS-7711",
    critical: true,
    lastInspectionDate: "2026-04-10",
    inspectionIntervalMonths: 6,
    mtbfTargetHours: 1000,
    mttrTargetHours: 4
  },
  {
    code: "EQ-AD-01",
    name: "Valise Diagnostic Chery i-Auto Diagnostic Tool V5",
    workshop: "Atelier Diagnostic",
    status: "Opérationnel",
    purchaseDate: "2025-01-15",
    warrantyEnd: "2027-01-15", // Warranty active!
    purchasePrice: 9200,
    location: "Armoire Diagnostic Électrique",
    serialNumber: "CHY-DIAG-00441",
    critical: true,
    lastInspectionDate: "2026-01-10",
    inspectionIntervalMonths: 12,
    mtbfTargetHours: 2000,
    mttrTargetHours: 2
  },
  {
    code: "EQ-CR-01",
    name: "Cabine de Peinture Pressurisée Weinmann",
    workshop: "Carrosserie",
    status: "En Panne", // In Breakdown for demo!
    purchaseDate: "2022-10-05",
    warrantyEnd: "2024-10-05",
    purchasePrice: 75000,
    location: "Zone Tôlerie/Peinture",
    serialNumber: "WM-CAB-44012",
    critical: true,
    lastInspectionDate: "2025-10-05",
    inspectionIntervalMonths: 12,
    mtbfTargetHours: 900,
    mttrTargetHours: 8
  },
  {
    code: "EQ-LV-01",
    name: "Portique de Lavage Haute Pression Kärcher C16",
    workshop: "Lavage",
    status: "Opérationnel",
    purchaseDate: "2024-06-30",
    warrantyEnd: "2026-06-30", // Just expired or expiring very soon
    purchasePrice: 32000,
    location: "Tunnel de Lavage",
    serialNumber: "KRC-HP-3004",
    critical: true,
    lastInspectionDate: "2026-05-18",
    inspectionIntervalMonths: 6,
    mtbfTargetHours: 600,
    mttrTargetHours: 6
  },
  {
    code: "EQ-RA-01",
    name: "Banc de Freinage et Suspension Muller",
    workshop: "Réception Après-Vente",
    status: "Opérationnel",
    purchaseDate: "2023-11-12",
    warrantyEnd: "2025-11-12",
    purchasePrice: 22500,
    location: "Baie de Réception Active",
    serialNumber: "MUL-BFS-9011",
    critical: true,
    lastInspectionDate: "2026-05-10",
    inspectionIntervalMonths: 6,
    mtbfTargetHours: 1100,
    mttrTargetHours: 4
  },
  {
    code: "EQ-MP-01",
    name: "Terminal d'Inventaire PDA Zebra TC21 (x4)",
    workshop: "Magasin Pièces de Rechange",
    status: "Opérationnel",
    purchaseDate: "2024-09-10",
    warrantyEnd: "2026-09-10", // Warranty active (expiring soon)
    purchasePrice: 4800,
    location: "Magasin Principal - Comptoir",
    serialNumber: "ZEB-PDA-TC21-PACK4",
    critical: false,
    lastInspectionDate: "2025-09-10",
    inspectionIntervalMonths: 12,
    mtbfTargetHours: 2500,
    mttrTargetHours: 1
  },
  {
    code: "EQ-BT-01",
    name: "Compresseur d'Air à Vis Atlas Copco GX7",
    workshop: "Maintenance Bâtiment",
    status: "Opérationnel",
    purchaseDate: "2022-12-20",
    warrantyEnd: "2024-12-20",
    purchasePrice: 18500,
    location: "Local Compresseur Externe",
    serialNumber: "ATC-COMP-GX7-2022",
    critical: true,
    lastInspectionDate: "2026-06-15",
    inspectionIntervalMonths: 6,
    mtbfTargetHours: 1400,
    mttrTargetHours: 4
  },
  {
    code: "EQ-BT-02",
    name: "Groupe Électrogène de Secours SDMO 150 kVA",
    workshop: "Maintenance Bâtiment",
    status: "En Maintenance", // In Preventive/Corrective maintenance
    purchaseDate: "2023-01-20",
    warrantyEnd: "2025-01-20",
    purchasePrice: 42000,
    location: "Local Énergie",
    serialNumber: "SDMO-150-TNS",
    critical: true,
    lastInspectionDate: "2025-12-10",
    inspectionIntervalMonths: 6,
    mtbfTargetHours: 1800,
    mttrTargetHours: 6
  }
];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  {
    code: "PR-SR-FL1",
    name: "Filtre à Huile - Kit d'Entretien Pont Élévateur",
    currentStock: 4,
    reorderPoint: 5, // Alert low stock!
    unitPrice: 85,
    location: "Rayon Maintenance A-1",
    category: "Filtres & Fluides",
    compatibleEquipments: ["EQ-SR-01", "EQ-AM-02"]
  },
  {
    code: "PR-SR-SEAL",
    name: "Joint d'Étanchéité Vérin Hydraulique 40mm",
    currentStock: 12,
    reorderPoint: 4,
    unitPrice: 45,
    location: "Rayon Maintenance B-3",
    category: "Hydraulique",
    compatibleEquipments: ["EQ-SR-01", "EQ-AM-02"]
  },
  {
    code: "PR-CR-FILT",
    name: "Filtre de Plafond Cabine de Peinture Weinmann",
    currentStock: 2,
    reorderPoint: 4, // Alert low stock!
    unitPrice: 320,
    location: "Local Technique Carrosserie",
    category: "Filtration Air",
    compatibleEquipments: ["EQ-CR-01"]
  },
  {
    code: "PR-BT-VALV",
    name: "Soupape de Sécurité Compresseur Atlas Copco",
    currentStock: 1,
    reorderPoint: 2, // Alert low stock!
    unitPrice: 150,
    location: "Rayon Maintenance A-5",
    category: "Pneumatique",
    compatibleEquipments: ["EQ-BT-01"]
  },
  {
    code: "PR-BT-BELT",
    name: "Courroie Trapézoïdale Atlas Copco GX7",
    currentStock: 6,
    reorderPoint: 3,
    unitPrice: 95,
    location: "Rayon Maintenance A-6",
    category: "Transmission",
    compatibleEquipments: ["EQ-BT-01"]
  },
  {
    code: "PR-LV-NOZ",
    name: "Buse Haute Pression Rotative Kärcher",
    currentStock: 8,
    reorderPoint: 3,
    unitPrice: 110,
    location: "Rayon Maintenance C-2",
    category: "Buses & Raccords",
    compatibleEquipments: ["EQ-LV-01"]
  },
  {
    code: "PR-GEN-BAT",
    name: "Batterie de Démarrage 12V 100Ah SDMO",
    currentStock: 3,
    reorderPoint: 1,
    unitPrice: 380,
    location: "Local Énergie - Étagère 1",
    category: "Électricité",
    compatibleEquipments: ["EQ-BT-02"]
  },
  {
    code: "PR-DIAG-CBL",
    name: "Câble de Connexion OBD2 Renforcé Chery i-Auto",
    currentStock: 2,
    reorderPoint: 1,
    unitPrice: 220,
    location: "Rayon Maintenance D-1",
    category: "Électronique",
    compatibleEquipments: ["EQ-AD-01"]
  }
];

export const INITIAL_INTERVENTIONS: Intervention[] = [
  {
    id: "INT-2026-001",
    equipmentCode: "EQ-SR-01",
    type: "Préventif",
    title: "Entretien semestriel et graissage des colonnes",
    description: "Vérification des câbles de synchronisation, graissage des patins de glissement, contrôle du niveau d'huile hydraulique.",
    dateIntervention: "2026-04-10",
    durationHours: 2.5,
    costParts: 85,
    costLabor: 120,
    technician: "Ridha Ben Abdallah",
    status: "Terminé",
    partsUsed: [{ partCode: "PR-SR-SEAL", quantity: 1 }],
    notes: "R.A.S. Câbles en excellent état. Niveau d'huile complété."
  },
  {
    id: "INT-2026-002",
    equipmentCode: "EQ-CR-01",
    type: "Correctif",
    title: "Panne de chauffage cabine - Brûleur fioul",
    description: "Le brûleur ne se déclenche pas. Alerte de sécurité sur le tableau de commande. Dysfonctionnement de l'électrode d'allumage.",
    dateIntervention: "2026-06-29",
    durationHours: 6.0,
    costParts: 640,
    costLabor: 350,
    technician: "Externe (Weinmann Service)",
    status: "En cours", // Active failure
    partsUsed: [{ partCode: "PR-CR-FILT", quantity: 2 }],
    notes: "Attente de la pièce de rechange (électrode de rechange d'origine) commandée chez Weinmann."
  },
  {
    id: "INT-2026-003",
    equipmentCode: "EQ-BT-01",
    type: "Préventif",
    title: "Vidange et remplacement des filtres compresseur",
    description: "Remplacement de l'huile de lubrification, du filtre à huile, du filtre à air et du séparateur.",
    dateIntervention: "2026-06-15",
    durationHours: 3.0,
    costParts: 280,
    costLabor: 150,
    technician: "Amine Ben Salah",
    status: "Terminé",
    partsUsed: [{ partCode: "PR-BT-BELT", quantity: 1 }],
    notes: "Compresseur testé sous 10 bar, pas de fuite. Courroie changée préventivement."
  },
  {
    id: "INT-2026-004",
    equipmentCode: "EQ-BT-02",
    type: "Correctif",
    title: "Défaut de charge batterie groupe électrogène",
    description: "La batterie ne tient pas la charge. Le chargeur automatique du coffret de transfert de source ne charge plus.",
    dateIntervention: "2026-06-30",
    durationHours: 4.0,
    costParts: 380,
    costLabor: 180,
    technician: "Belhassen Trabelsi",
    status: "En cours",
    partsUsed: [{ partCode: "PR-GEN-BAT", quantity: 1 }],
    notes: "Remplacement de la batterie effectué. Contrôle en cours du pont de diodes de l'alternateur de charge."
  },
  {
    id: "INT-2026-005",
    equipmentCode: "EQ-LV-01",
    type: "Réglementaire",
    title: "Étalonnage pressostat et contrôle vannes de sécurité",
    description: "Vérification des dispositifs de sécurité contre les surpressions et étalonnage des capteurs du portique.",
    dateIntervention: "2026-05-18",
    durationHours: 2.0,
    costParts: 110,
    costLabor: 100,
    technician: "Yassine Gharbi",
    status: "Terminé",
    partsUsed: [{ partCode: "PR-LV-NOZ", quantity: 1 }],
    notes: "Contrôle conforme, certificat d'essai tamponné par le technicien Kärcher."
  },
  {
    id: "INT-2026-006",
    equipmentCode: "EQ-AM-01",
    type: "Préventif",
    title: "Calibration annuelle des têtes de lecture 3D",
    description: "Mise à niveau des capteurs d'angle, recalibrage de la mire centrale, mise à jour de la base de données Chery 2026.",
    dateIntervention: "2026-01-20",
    durationHours: 5.0,
    costParts: 0,
    costLabor: 400,
    technician: "Externe (Distributeur John Bean)",
    status: "Terminé",
    partsUsed: [],
    notes: "Certificat de calibration délivré avec succès. Base de données Chery à jour."
  },
  {
    id: "INT-2026-007",
    equipmentCode: "EQ-SR-02",
    type: "Correctif",
    title: "Fuite d'air sur le vérin de décollage",
    description: "Perte de pression progressive lors de l'appui sur la pédale de décollage du pneu. Joint d'étanchéité pneumatique endommagé.",
    dateIntervention: "2025-11-15",
    durationHours: 3.5,
    costParts: 45,
    costLabor: 140,
    technician: "Ridha Ben Abdallah",
    status: "Terminé",
    partsUsed: [],
    notes: "Remplacement du joint de piston de pédale. Test de décollage concluant."
  },
  {
    id: "INT-2026-008",
    equipmentCode: "EQ-RA-01",
    type: "Préventif",
    title: "Contrôle semestriel banc de freinage Muller",
    description: "Vérification de l'usure des rouleaux, contrôle du capteur d'effort de freinage, lubrification de la chaîne de transmission.",
    dateIntervention: "2026-05-10",
    durationHours: 2.5,
    costParts: 0,
    costLabor: 150,
    technician: "Yassine Gharbi",
    status: "Terminé",
    partsUsed: [],
    notes: "Rouleaux en bon état (adhérence conforme), tension de chaîne ajustée."
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: "VND-APAVE",
    name: "Apave Tunisie",
    serviceType: "Organisme d'Inspection Réglementaire",
    phone: "+216 71 889 400",
    email: "contact@apave.com.tn",
    contactPerson: "Kamel Ben Amor",
    rating: 5
  },
  {
    id: "VND-SGS",
    name: "SGS Tunisie",
    serviceType: "Contrôles réglementaires et Étalonnage",
    phone: "+216 71 206 500",
    email: "tunis.control@sgs.com",
    contactPerson: "Monia Jendoubi",
    rating: 4
  },
  {
    id: "VND-SOCO",
    name: "Socomat SAS Tunisie",
    serviceType: "Fournisseur d'équipements de garage & SAV",
    phone: "+216 71 332 550",
    email: "sav@socomat.tn",
    contactPerson: "Walid Mansour",
    rating: 4
  },
  {
    id: "VND-TUNCOMP",
    name: "Tunisie Compresseurs",
    serviceType: "Spécialiste compresseurs & Réseaux d'air",
    phone: "+216 71 556 123",
    email: "technique@tuncomp.com",
    contactPerson: "Mohamed Ali Sassi",
    rating: 5
  },
  {
    id: "VND-AUTOEQUIP",
    name: "Automotive Equipment Engineering",
    serviceType: "Calibration d'appareils de diagnostic et géométrie",
    phone: "+216 71 668 991",
    email: "support@autoequip.tn",
    contactPerson: "Fares Gharbi",
    rating: 4
  }
];

export const INITIAL_CONTRACTS: MaintenanceContract[] = [
  {
    id: "CON-2026-01",
    title: "Contrat de maintenance préventive Cabine de Peinture",
    vendorId: "VND-SOCO",
    costAnnual: 4800,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "Actif",
    frequency: "Trimestriel",
    coveredEquipments: ["EQ-CR-01"]
  },
  {
    id: "CON-2026-02",
    title: "Contrat de maintenance préventive Compresseur d'air",
    vendorId: "VND-TUNCOMP",
    costAnnual: 2400,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "Actif",
    frequency: "Semestriel",
    coveredEquipments: ["EQ-BT-01"]
  },
  {
    id: "CON-2026-03",
    title: "Contrat d'inspection périodique obligatoire (Ponts élévateurs)",
    vendorId: "VND-APAVE",
    costAnnual: 1800,
    startDate: "2026-03-01",
    endDate: "2027-03-01",
    status: "Actif",
    frequency: "Semestriel",
    coveredEquipments: ["EQ-SR-01", "EQ-AM-02", "EQ-RA-01"]
  }
];

export const INITIAL_COMPLIANCE_CHECKS: ComplianceCheck[] = [
  {
    id: "CMP-2026-01",
    equipmentCode: "EQ-SR-01",
    title: "Contrôle d'épreuve de charge de pont élévateur",
    bodyName: "Apave Tunisie",
    inspectionDate: "2026-04-10",
    nextInspectionDate: "2026-10-10", // Upcoming
    status: "Conforme",
    reportRef: "AP-PV-9921/2026"
  },
  {
    id: "CMP-2026-02",
    equipmentCode: "EQ-AM-02",
    title: "Contrôle électrique et organes de sécurité de pont",
    bodyName: "Apave Tunisie",
    inspectionDate: "2026-04-10",
    nextInspectionDate: "2026-10-10",
    status: "Conforme",
    reportRef: "AP-PV-9922/2026"
  },
  {
    id: "CMP-2026-03",
    equipmentCode: "EQ-CR-01",
    title: "Contrôle réglementaire des rejets et ventilation cabine",
    bodyName: "SGS Tunisie",
    inspectionDate: "2025-10-05",
    nextInspectionDate: "2026-10-05", // Warranty/Inspection Expiring soon!
    status: "En attente d'action",
    reportRef: "SGS-ENV-8841/2025"
  }
];

export const BUDGET_2026: BudgetYear = {
  year: 2026,
  totalBudget: 62000,
  allocatedByWorkshop: {
    "Service Rapide": 8000,
    "Atelier Mécanique": 10000,
    "Atelier Diagnostic": 6000,
    "Carrosserie": 18000,
    "Lavage": 5000,
    "Réception Après-Vente": 4000,
    "Magasin Pièces de Rechange": 3000,
    "Maintenance Bâtiment": 8000
  },
  spentByWorkshop: {
    "Service Rapide": 6250,
    "Atelier Mécanique": 4120,
    "Atelier Diagnostic": 1120,
    "Carrosserie": 18450, // Over budget alert!
    "Lavage": 2220,
    "Réception Après-Vente": 1450,
    "Magasin Pièces de Rechange": 680,
    "Maintenance Bâtiment": 5960
  }
};
