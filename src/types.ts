/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Workshop =
  | "Service Rapide"
  | "Atelier Mécanique"
  | "Atelier Diagnostic"
  | "Carrosserie"
  | "Lavage"
  | "Réception Après-Vente"
  | "Magasin Pièces de Rechange"
  | "Maintenance Bâtiment";

export type EquipmentStatus = "Opérationnel" | "Dégradé" | "En Panne" | "En Maintenance" | "Hors Service";

export interface Equipment {
  code: string; // unique code, e.g. EQ-SR-01
  name: string;
  workshop: Workshop;
  status: EquipmentStatus;
  purchaseDate: string;
  warrantyEnd: string;
  purchasePrice: number; // in TND
  location: string;
  serialNumber: string;
  critical: boolean;
  lastInspectionDate?: string;
  inspectionIntervalMonths?: number;
  mtbfTargetHours: number; // Target Mean Time Between Failures
  mttrTargetHours: number; // Target Mean Time To Repair
  criticite?: "A - Critique" | "B - Moyen" | "C - Faible";
  warrantyDetails?: string;
  vendorId?: string;
  responsableName?: string;
  documents?: { name: string; type: "Procédure" | "Instruction" | "Manuel" | "Plan" | "Réglementaire"; dateAdded: string; version: string; size: string }[];
  photos?: string[];
}

export type InterventionType = "Préventif" | "Correctif" | "Réglementaire";
export type InterventionStatus = "Nouvelle" | "Planifiée" | "En cours" | "En attente" | "Terminée" | "Clôturée" | "Annulée" | "Planifié" | "Terminé" | "Annulé";

export interface PartUsed {
  partCode: string;
  quantity: number;
}

export interface Intervention {
  id: string;
  equipmentCode: string;
  type: InterventionType;
  title: string;
  description: string;
  dateIntervention: string;
  durationHours: number;
  costParts: number;
  costLabor: number;
  technician: string;
  status: InterventionStatus;
  partsUsed: PartUsed[];
  notes?: string;
  executorType?: "Interne" | "Externe";
  externalProvider?: string;
  priority?: "Faible" | "Moyenne" | "Haute" | "Critique";
  validationBy?: string;
  checklist?: { task: string; done: boolean }[];
  signature?: { name: string; date: string; dataUrl?: string };
  photos?: string[];
  photosBefore?: string[];
  photosAfter?: string[];
  realDurationMinutes?: number;
}

export interface SparePart {
  code: string; // e.g. PR-LIFT-01
  name: string;
  currentStock: number;
  reorderPoint: number;
  unitPrice: number; // in TND
  location: string; // e.g. Rayon A-4
  category: string;
  compatibleEquipments: string[]; // Equipment codes
}

export interface Vendor {
  id: string;
  name: string;
  serviceType: string;
  phone: string;
  email: string;
  contactPerson: string;
  rating: number; // 1 to 5 stars
}

export interface MaintenanceContract {
  id: string;
  title: string;
  vendorId: string;
  costAnnual: number;
  startDate: string;
  endDate: string;
  status: "Actif" | "Expiré" | "En révision";
  frequency: "Mensuel" | "Trimestriel" | "Semestriel" | "Annuel";
  coveredEquipments: string[]; // Equipment codes
}

export interface BudgetYear {
  year: number;
  totalBudget: number;
  allocatedByWorkshop: Record<Workshop, number>;
  spentByWorkshop: Record<Workshop, number>;
}

export interface ComplianceCheck {
  id: string;
  equipmentCode: string;
  title: string; // e.g. Contrôle réglementaire des ponts élévateurs
  bodyName: string; // e.g. Apave Tunisie, SGS
  inspectionDate: string;
  nextInspectionDate: string;
  status: "Conforme" | "Non conforme" | "En attente d'action";
  reportRef: string;
}

export interface AlertNotification {
  id: string;
  type: "low_stock" | "warranty_expiring" | "preventive_overdue" | "budget_exceeded" | "compliance_warning";
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  dateCreated: string;
  resolved: boolean;
  linkedRef?: string; // code or id
}

export interface PurchaseRequest {
  id: string;
  equipmentName: string;
  needReason: string;
  urgency: "Faible" | "Moyenne" | "Critique";
  quantity: number;
  vendorId: string;
  requestedBy: string;
  dateRequested: string;
  status: "En attente" | "Approuvé" | "Commandé" | "Reçu" | "Refusé";
  estimatedCost: number;
  category?: "Équipement" | "Infrastructure" | "Service";
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userRole: string;
  action: string;
  details: string;
  type: "equipment" | "intervention" | "spare_part" | "purchase" | "budget" | "compliance" | "other";
}

export interface UserRoleProfile {
  id: string;
  label: string;
  rights: string;
  badge: string;
  pin: string;
  userFullName?: string;
  email?: string;
  phone?: string;
  workshop?: string;
  isSystem?: boolean;
}

// ==========================================
// MODULE PROJETS (Project Management)
// ==========================================

export type ProjectPriority = "Faible" | "Moyenne" | "Haute" | "Urgent";
export type ProjectStatus = "Brouillon" | "En cours" | "En pause" | "Terminé" | "Annulé";

export interface ProjectTask {
  id: string;
  projectId: string;
  name: string;
  manager: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  dependencies: string[];
  priority: ProjectPriority;
  status: "À faire" | "En cours" | "Terminé" | "Bloqué";
  progressPercent: number;
}

export interface ProjectBudgetItem {
  id: string;
  projectId: string;
  type: "Devis" | "Commande" | "Dépense" | "CAPEX" | "OPEX";
  title: string;
  supplier: string;
  amount: number;
  date: string;
  roiEstimatedMonths?: number;
  status: "Estimé" | "Validé" | "Payé";
}

export interface ProjectRisk {
  id: string;
  projectId: string;
  risk: string;
  probability: "Faible" | "Moyenne" | "Élevée";
  impact: "Faible" | "Moyen" | "Fort" | "Critique";
  priority: "Basse" | "Modérée" | "Haute" | "Critique";
  preventiveAction: string;
  responsible: string;
  state: "Identifié" | "En cours" | "Mitigé" | "Clôturé";
}

export interface ProjectDoc {
  id: string;
  projectId: string;
  name: string;
  type: "Cahier des charges" | "Plan" | "Photo" | "Compte rendu" | "PV de réception";
  uploadDate: string;
  author: string;
  fileSize?: string;
  url?: string;
  fileData?: string; // Data URL or Base64 string for preview and download
  fileName?: string;
  fileMimeType?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: string;
  department: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budgetPlanned: number; // TND
  budgetReal: number; // TND
  progressPercent: number;
  documents: ProjectDoc[];
  photos: string[];
  suppliers: string[];
  tasks?: ProjectTask[];
  budgetItems?: ProjectBudgetItem[];
  risks?: ProjectRisk[];
}

// ==========================================
// MODULE AMÉLIORATION CONTINUE
// ==========================================

export interface Audit5S {
  id: string;
  date: string;
  workshop: Workshop;
  auditor: string;
  seiriScore: number;    // 0-20 (Seiri - Débarras)
  seitonScore: number;   // 0-20 (Seiton - Rangement)
  seisoScore: number;    // 0-20 (Seiso - Nettoyage)
  seiketsuScore: number; // 0-20 (Seiketsu - Standardisation)
  shitsukeScore: number; // 0-20 (Shitsuke - Respect/Rigueur)
  totalScore: number;    // 0-100%
  beforePhoto?: string;
  afterPhoto?: string;
  actionPlan: string;
  status: "Conforme" | "À corriger" | "Clôturé";
  comments?: string;
}

export interface LeanItem {
  id: string;
  type: "Gaspillage (Muda)" | "Kaizen" | "TPM" | "Suggestion" | "Standardisation";
  mudaCategory?: "Surproduction" | "Attente" | "Transport" | "Processus inutile" | "Stock excessif" | "Mouvements" | "Retouches/Défauts";
  title: string;
  workshop: Workshop;
  description: string;
  author: string;
  dateAdded: string;
  status: "Nouveau" | "En cours" | "Appliqué" | "Standardisé";
  impactScore?: "Faible" | "Moyen" | "Fort";
  estimatedSavingTnd?: number;
}

export interface SafetyRecord {
  id: string;
  type: "Audit Sécurité" | "Incident" | "Quasi-accident" | "Analyse de Risque" | "Vérification Extincteurs" | "Vérification EPI";
  date: string;
  location: string;
  description: string;
  severity: "Mineure" | "Moyenne" | "Grave" | "Critique";
  actionPlan: string;
  responsible: string;
  status: "En cours" | "Réglé" | "Sous contrôle";
  checkExtinguishersCount?: number;
  checkEpiCompliantPercent?: number;
}

export interface QualityRecord {
  id: string;
  type: "Non-conformité" | "Audit interne" | "Action corrective" | "Action préventive" | "Check-list" | "Traçabilité";
  title: string;
  workshop: Workshop;
  date: string;
  details: string;
  responsible: string;
  status: "Ouvert" | "En traitement" | "Résolu" | "Validé";
}

export interface EnvironmentLog {
  id: string;
  category: "Déchets" | "Huiles usagées" | "Batteries" | "Énergie (Électricité)" | "Eau" | "Air Comprimé";
  date: string;
  value: number;
  unit: "kg" | "Litre" | "Unités" | "kWh" | "m³" | "Bar";
  costOrSavingTnd: number;
  notes: string;
}


