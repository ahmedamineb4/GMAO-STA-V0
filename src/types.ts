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

export type EquipmentStatus = "Opérationnel" | "Dégradé" | "En Panne" | "En Maintenance";

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
}

export type InterventionType = "Préventif" | "Correctif" | "Réglementaire";
export type InterventionStatus = "Planifié" | "En cours" | "Terminé" | "Annulé";

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
  partCode: string;
  quantity: number;
  vendorId: string;
  requestedBy: string;
  dateRequested: string;
  status: "En attente" | "Approuvé" | "Commandé" | "Reçu" | "Refusé";
  estimatedCost: number;
}

