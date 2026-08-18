/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Package,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
  Bell,
  User,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  Building,
  FolderKanban,
  Calendar,
  Sliders,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  LogOut,
  History,
  AlertTriangle,
  AlertOctagon,
  DollarSign,
  Search,
  Command,
  Sparkles,
  Terminal,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  Key
} from "lucide-react";

// Types & Initial Data
import {
  Equipment,
  Intervention,
  SparePart,
  Vendor,
  MaintenanceContract,
  BudgetYear,
  ComplianceCheck,
  EquipmentStatus,
  InterventionStatus,
  Workshop,
  PurchaseRequest,
  ActivityLog,
  UserRoleProfile
} from "./types";

import {
  INITIAL_EQUIPMENTS,
  INITIAL_SPARE_PARTS,
  INITIAL_INTERVENTIONS,
  INITIAL_VENDORS,
  INITIAL_CONTRACTS,
  INITIAL_COMPLIANCE_CHECKS,
  BUDGET_2026,
  INITIAL_PURCHASE_REQUESTS,
  WORKSHOPS,
  INITIAL_PROJECTS,
  INITIAL_AUDITS_5S,
  INITIAL_LEAN_ITEMS,
  INITIAL_SAFETY_RECORDS,
  INITIAL_QUALITY_RECORDS,
  INITIAL_ENV_LOGS,
  INITIAL_ACTIVITY_LOGS
} from "./data";
import { sendEmailAlert, EmailAlert, DEFAULT_ALERT_EMAIL_RECIPIENT } from "./utils/emailAlerts";

// Sub Components
import GmaoDashboard from "./components/GmaoDashboard";
import EquipmentsManager from "./components/EquipmentsManager";
import InterventionsManager from "./components/InterventionsManager";
import ContractsManager from "./components/ContractsManager";
import ExcelBlueprint from "./components/ExcelBlueprint";
import PurchasesManager from "./components/PurchasesManager";
import SettingsManager from "./components/SettingsManager";
import UserGuide from "./components/UserGuide";
import AuditLogs from "./components/AuditLogs";
import DocumentationManager from "./components/DocumentationManager";
import { FinancialManager } from "./components/FinancialManager";
import CommandPaletteModal from "./components/CommandPaletteModal";
import ToastNotification from "./components/ToastNotification";
import CheryStaLogo from "./components/CheryStaLogo";
import DeveloperConsoleModal from "./components/DeveloperConsoleModal";
import ProjectsManager from "./components/ProjectsManager";
import ContinuousImprovementManager from "./components/ContinuousImprovementManager";
import ImageLightboxModal from "./components/ImageLightboxModal";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem("chery_gmao_active_tab");
    if (saved === "excel" || saved === "guide") return "dashboard";
    return saved || "dashboard";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [resetConfirmType, setResetConfirmType] = useState<"reset" | "clear" | null>(null);

  // 🔍 Command Palette, Dev Console & Toast Notification State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [devConsoleOpen, setDevConsoleOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);

  // 🖼️ Lightbox Modal state for full-screen photo zoom
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    title?: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  // ⌨️ Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🚨 State for Global Breakdown Alert Modal
  const [showGlobalAlertModal, setShowGlobalAlertModal] = useState<boolean>(false);
  const [alertSelectedWorkshop, setAlertSelectedWorkshop] = useState<string>("All");
  const [alertEqCode, setAlertEqCode] = useState<string>("");
  const [alertTech, setAlertTech] = useState<string>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertDesc, setAlertDesc] = useState<string>("");
  const [alertPriority, setAlertPriority] = useState<"Faible" | "Moyenne" | "Haute" | "Critique">("Moyenne");
  const [alertPhotos, setAlertPhotos] = useState<string[]>([]);

  // 🏢 State for Building Anomaly Reporting Modal (Authentication Page & Quick Portal)
  const [showBuildingAnomalyModal, setShowBuildingAnomalyModal] = useState<boolean>(false);
  const [buildingAnomalySuccess, setBuildingAnomalySuccess] = useState<string | null>(null);
  const [anomalyCategory, setAnomalyCategory] = useState<string>("⚡ Électricité & Éclairage");
  const [anomalyLocation, setAnomalyLocation] = useState<string>("Showroom Véhicules Neufs");
  const [anomalyDesc, setAnomalyDesc] = useState<string>("");
  const [anomalyReporter, setAnomalyReporter] = useState<string>("");
  const [anomalyPhone, setAnomalyPhone] = useState<string>("");
  const [anomalyPriority, setAnomalyPriority] = useState<"Faible" | "Moyenne" | "Haute" | "Critique">("Moyenne");
  const [anomalyPhotos, setAnomalyPhotos] = useState<string[]>([]);

  // Status of database synchronization (Local, Disk & Neon Cloud)
  const [diskSyncStatus, setDiskSyncStatus] = useState<"synced" | "syncing" | "error" | "idle">("idle");
  const [neonStatus, setNeonStatus] = useState<{
    configured: boolean;
    connected: boolean;
    serverTime?: string;
    pgVersion?: string;
    databaseUrlMasked?: string;
    message?: string;
    error?: string;
    totalKeys?: number;
    storeSummary?: Record<string, { count: number; updatedAt?: string }>;
  } | null>(null);

  // Collapsible Sidebar Menus State
  const [parcOpen, setParcOpen] = useState<boolean>(true);
  const [maintenanceOpen, setMaintenanceOpen] = useState<boolean>(true);

  // Nested filter states
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>(() => {
    return localStorage.getItem("chery_gmao_filter_workshop") || "All";
  });
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<string>(() => {
    return localStorage.getItem("chery_gmao_filter_type") || "All";
  });
  const [selectedMaintenanceStatus, setSelectedMaintenanceStatus] = useState<string>(() => {
    return localStorage.getItem("chery_gmao_filter_status") || "All";
  });
  const [showMaintenanceCalendar, setShowMaintenanceCalendar] = useState<boolean>(() => {
    return localStorage.getItem("chery_gmao_filter_calendar") === "true";
  });

  const [dbMode, setDbMode] = useState<"demo" | "vierge">(() => {
    const saved = localStorage.getItem("chery_gmao_database_mode");
    return (saved as "demo" | "vierge") || "vierge";
  });

  // Core Reactive States (With LocalStorage persistence fallback & try-catch safety)
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_equipments");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse equipments from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "vierge";
    return mode === "demo" ? INITIAL_EQUIPMENTS : [];
  });

  const [interventions, setInterventions] = useState<Intervention[]>(() => {
    try {
      const isCleaned = localStorage.getItem("chery_gmao_cleared_all_interventions_and_vendors_v1");
      if (!isCleaned) return [];
      const saved = localStorage.getItem("chery_gmao_interventions");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse interventions from localStorage", e);
    }
    return [];
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_spare_parts");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse spareParts from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "vierge";
    return mode === "demo" ? INITIAL_SPARE_PARTS : [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const isCleaned = localStorage.getItem("chery_gmao_cleared_all_interventions_and_vendors_v1");
      if (!isCleaned) return [];
      const saved = localStorage.getItem("chery_gmao_vendors");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse vendors from localStorage", e);
    }
    return [];
  });

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_purchase_requests");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse purchaseRequests from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "vierge";
    return mode === "demo" ? INITIAL_PURCHASE_REQUESTS : [];
  });

  const [contracts, setContracts] = useState<MaintenanceContract[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_contracts");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse contracts from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "vierge";
    return mode === "demo" ? INITIAL_CONTRACTS : [];
  });

  const [compliance, setCompliance] = useState<ComplianceCheck[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_compliance");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse compliance from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "vierge";
    return mode === "demo" ? INITIAL_COMPLIANCE_CHECKS : [];
  });

  // Module Projets State
  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_projects");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse projects from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_PROJECTS : [];
  });

  // Module Amélioration Continue States
  const [audits5s, setAudits5s] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_audits_5s");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse audits5s from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_AUDITS_5S : [];
  });

  const [leanItems, setLeanItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_lean_items");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse leanItems from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_LEAN_ITEMS : [];
  });

  const [safetyRecords, setSafetyRecords] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_safety_records");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse safetyRecords from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_SAFETY_RECORDS : [];
  });

  const [qualityRecords, setQualityRecords] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_quality_records");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse qualityRecords from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_QUALITY_RECORDS : [];
  });

  const [environmentLogs, setEnvironmentLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_env_logs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse environmentLogs from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_ENV_LOGS : [];
  });

  // LocalStorage Persistence Effects for new modules
  useEffect(() => {
    localStorage.setItem("chery_gmao_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_audits_5s", JSON.stringify(audits5s));
  }, [audits5s]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_lean_items", JSON.stringify(leanItems));
  }, [leanItems]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_safety_records", JSON.stringify(safetyRecords));
  }, [safetyRecords]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_quality_records", JSON.stringify(qualityRecords));
  }, [qualityRecords]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_env_logs", JSON.stringify(environmentLogs));
  }, [environmentLogs]);

  const [budget, setBudget] = useState<BudgetYear>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_budget");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse budget from localStorage", e);
    }
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    if (mode === "demo") return BUDGET_2026;
    return {
      year: 2026,
      totalBudget: 0,
      allocatedByWorkshop: {
        "Service Rapide": 0,
        "Atelier Mécanique": 0,
        "Atelier Diagnostic": 0,
        "Carrosserie": 0,
        "Lavage": 0,
        "Réception Après-Vente": 0,
        "Magasin Pièces de Rechange": 0,
        "Maintenance Bâtiment": 0
      },
      spentByWorkshop: {
        "Service Rapide": 0,
        "Atelier Mécanique": 0,
        "Atelier Diagnostic": 0,
        "Carrosserie": 0,
        "Lavage": 0,
        "Réception Après-Vente": 0,
        "Magasin Pièces de Rechange": 0,
        "Maintenance Bâtiment": 0
      }
    };
  });

  // User Authentication & Access Control States & Editable Profiles
  const DEFAULT_USER_PROFILES: UserRoleProfile[] = [
    { id: "admin", label: "M. Ahmed Amine (Admin)", userFullName: "Ahmed Amine", rights: "Accès total, modifications budget, mots de passe", badge: "Administrateur", pin: "1924", isSystem: true },
    { id: "supervisor", label: "Superviseur (Lecture seule)", userFullName: "Direction STA", rights: "Lecture seule sur tous les modules", badge: "Superviseur", pin: "1234", isSystem: true },
    { id: "service_rapide", label: "Chef d'Atelier : Service Rapide", userFullName: "Mohamed Ben Amor", rights: "Interventions et pannes sur Service Rapide", badge: "Atelier", pin: "0000", workshop: "Service Rapide" },
    { id: "atelier_mecanique", label: "Chef d'Atelier : Mécanique & Élec", userFullName: "Karim Gharbi", rights: "Interventions et pannes sur Mécanique", badge: "Atelier", pin: "0000", workshop: "Atelier Mécanique" },
    { id: "atelier_diagnostic", label: "Chef d'Atelier : Diagnostic", userFullName: "Youssef Tounsi", rights: "Interventions et pannes sur Diagnostic", badge: "Atelier", pin: "0000", workshop: "Atelier Diagnostic" },
    { id: "carrosserie", label: "Chef d'Atelier : Carrosserie", userFullName: "Khaled Khelifi", rights: "Interventions et pannes sur Carrosserie", badge: "Atelier", pin: "0000", workshop: "Carrosserie" },
    { id: "lavage", label: "Chef d'Atelier : Lavage", userFullName: "Hassen Jlassi", rights: "Interventions et pannes sur Lavage", badge: "Atelier", pin: "0000", workshop: "Lavage" },
    { id: "batiment", label: "Chef d'Atelier : Maintenance Bâtiment", userFullName: "Ali Trabelsi", rights: "Interventions et pannes sur Bâtiment", badge: "Atelier", pin: "0000", workshop: "Maintenance Bâtiment" }
  ];

  const [userProfiles, setUserProfiles] = useState<UserRoleProfile[]>(() => {
    const saved = localStorage.getItem("chery_gmao_user_profiles");
    if (saved) {
      try {
        const parsed: UserRoleProfile[] = JSON.parse(saved);
        const filtered = parsed.filter((p) => p.id !== "magasin" && !p.id.includes("magasin"));
        if (filtered.length > 0) return filtered;
      } catch (e) {
        return DEFAULT_USER_PROFILES;
      }
    }
    return DEFAULT_USER_PROFILES;
  });

  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("chery_gmao_passwords");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    const map: Record<string, string> = {};
    DEFAULT_USER_PROFILES.forEach((p) => { map[p.id] = p.pin; });
    return map;
  });

  // Sync userProfiles to localStorage and keep passwords state in sync
  useEffect(() => {
    localStorage.setItem("chery_gmao_user_profiles", JSON.stringify(userProfiles));
    const passMap: Record<string, string> = {};
    userProfiles.forEach((p) => {
      passMap[p.id] = p.pin || "0000";
    });
    setPasswords(passMap);
    localStorage.setItem("chery_gmao_passwords", JSON.stringify(passMap));
  }, [userProfiles]);

  const [currentUserRole, setCurrentUserRole] = useState<string>(() => {
    return localStorage.getItem("chery_gmao_user_role") || "admin";
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_activity_logs");
      if (saved) {
        const parsed: ActivityLog[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAugust = parsed.some(
            (l) => l.timestamp && (l.timestamp.includes("2026-08") || l.timestamp.includes("08/2026") || l.timestamp.includes("01/08") || l.timestamp.includes("02/08") || l.timestamp.includes("03/08"))
          );
          if (!hasAugust) {
            // Append missing August demo logs to existing history
            const augustDemoLogs = INITIAL_ACTIVITY_LOGS.filter(
              (l) => l.timestamp.includes("2026-08") || l.timestamp.includes("01/08") || l.timestamp.includes("02/08") || l.timestamp.includes("03/08")
            );
            return [...augustDemoLogs, ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse activityLogs from localStorage", e);
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  // Email Alert Toast State
  const [emailAlertToast, setEmailAlertToast] = useState<EmailAlert | null>(null);

  useEffect(() => {
    const handleEmailAlert = (e: Event) => {
      const customEv = e as CustomEvent<EmailAlert>;
      if (customEv.detail) {
        setEmailAlertToast(customEv.detail);
        setTimeout(() => {
          setEmailAlertToast((current) => (current?.id === customEv.detail.id ? null : current));
        }, 8000);
      }
    };
    const handleEmailAlertError = (e: Event) => {
      const customEv = e as CustomEvent<{ recipient: string; error: string; alertId: string }>;
      if (customEv.detail) {
        showToast(`⚠️ Diagnostic Email : ${customEv.detail.error}`, "error");
      }
    };
    window.addEventListener("chery_email_alert_triggered", handleEmailAlert);
    window.addEventListener("chery_email_alert_error", handleEmailAlertError);
    return () => {
      window.removeEventListener("chery_email_alert_triggered", handleEmailAlert);
      window.removeEventListener("chery_email_alert_error", handleEmailAlertError);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("chery_gmao_activity_logs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  const logActivity = (action: string, details: string, type: ActivityLog["type"] = "other") => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleString("fr-FR"),
      userRole: currentUserRole,
      action,
      details,
      type
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleClearActivityLogs = () => {
    if (currentUserRole !== "admin") return;
    setActivityLogs([]);
    localStorage.setItem("chery_gmao_activity_logs", JSON.stringify([]));
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("chery_gmao_authenticated") === "true";
  });
  const [loginPendingRole, setLoginPendingRole] = useState<string | null>(null);
  const [loginPasswordInput, setLoginPasswordInput] = useState<string>("");
  const [loginPasswordError, setLoginPasswordError] = useState<boolean>(false);

  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showHelperCodes, setShowHelperCodes] = useState(false);

  // Dynamic ROLE_LABELS map based on userProfiles
  const ROLE_LABELS: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    userProfiles.forEach((p) => {
      map[p.id] = p.label;
    });
    return map;
  }, [userProfiles]);

  // Profile Management Handlers
  const handleUpdateRoleProfile = (updated: UserRoleProfile) => {
    setUserProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    logActivity("Modification Profil", `Mise à jour du profil utilisateur : ${updated.label}`, "other");
  };

  const handleAddRoleProfile = (newProfile: UserRoleProfile) => {
    setUserProfiles((prev) => [...prev, newProfile]);
    logActivity("Nouveau Profil", `Création du profil utilisateur : ${newProfile.label}`, "other");
  };

  const handleDeleteRoleProfile = (profileId: string) => {
    if (currentUserRole !== "admin") {
      alert("⛔ Accès refusé : Seul l'Administrateur (Admin) est autorisé à supprimer un profil d'accès.");
      return;
    }
    const target = userProfiles.find((p) => p.id === profileId);
    if (target?.isSystem) {
      alert("Ce profil système ne peut pas être supprimé car il est essentiel au fonctionnement de l'application.");
      return;
    }
    setUserProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (target) {
      logActivity("Suppression Profil", `Suppression du profil : ${target.label}`, "other");
    }
  };

  // Project Handlers
  const handleAddProject = (newProject: any) => {
    setProjects((prev) => [newProject, ...prev]);
    logActivity("Nouveau Projet", `Création du projet : ${newProject.name}`, "other");
    showToast(`Projet "${newProject.name}" créé avec succès !`, "success");
  };

  const handleUpdateProject = (updated: any) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    logActivity("Mise à jour Projet", `Mise à jour du projet : ${updated.name}`, "other");
  };

  const handleDeleteProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (target) {
      logActivity("Suppression Projet", `Suppression du projet : ${target.name}`, "other");
      showToast(`Projet "${target.name}" supprimé.`, "info");
    }
  };

  // Continuous Improvement Handlers
  const handleAddAudit5S = (newAudit: any) => {
    setAudits5s((prev) => [newAudit, ...prev]);
    logActivity("Audit 5S", `Nouvel audit 5S sur ${newAudit.workshop} : Score ${newAudit.totalScore}%`, "other");
    showToast(`Audit 5S enregistré (Score: ${newAudit.totalScore}%)`, "success");
  };

  const handleUpdateAudit5S = (updated: any) => {
    setAudits5s((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    logActivity("Modification Audit 5S", `Mise à jour audit 5S : ${updated.workshop}`, "other");
    showToast(`Audit 5S mis à jour`, "success");
  };

  const handleDeleteAudit5S = (id: string) => {
    setAudits5s((prev) => prev.filter((a) => a.id !== id));
    logActivity("Suppression Audit 5S", `Suppression audit 5S ID: ${id}`, "other");
    showToast(`Audit 5S supprimé`, "info");
  };

  const handleAddLeanItem = (newItem: any) => {
    setLeanItems((prev) => [newItem, ...prev]);
    logActivity("Action Lean", `Déclaration Lean/Kaizen : ${newItem.title}`, "other");
    showToast(`Action Lean/Kaizen enregistrée`, "success");
  };

  const handleUpdateLeanItem = (updated: any) => {
    setLeanItems((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    logActivity("Modification Lean", `Mise à jour Kaizen : ${updated.title}`, "other");
    showToast(`Action Lean mise à jour`, "success");
  };

  const handleDeleteLeanItem = (id: string) => {
    setLeanItems((prev) => prev.filter((l) => l.id !== id));
    logActivity("Suppression Lean", `Suppression fiche Lean ID: ${id}`, "other");
    showToast(`Action Lean supprimée`, "info");
  };

  const handleAddSafetyRecord = (newRec: any) => {
    setSafetyRecords((prev) => [newRec, ...prev]);
    logActivity("Saisie Sécurité", `Saisie Sécurité (${newRec.type}) : ${newRec.location}`, "other");
    showToast(`Événement Sécurité enregistré`, "info");
  };

  const handleUpdateSafetyRecord = (updated: any) => {
    setSafetyRecords((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    logActivity("Modification Sécurité", `Mise à jour incident sécurité : ${updated.location}`, "other");
    showToast(`Fiche Sécurité mise à jour`, "success");
  };

  const handleDeleteSafetyRecord = (id: string) => {
    setSafetyRecords((prev) => prev.filter((s) => s.id !== id));
    logActivity("Suppression Sécurité", `Suppression fiche sécurité ID: ${id}`, "other");
    showToast(`Fiche Sécurité supprimée`, "info");
  };

  const handleAddQualityRecord = (newRec: any) => {
    setQualityRecords((prev) => [newRec, ...prev]);
    logActivity("Action Qualité", `Enregistrement Qualité : ${newRec.title}`, "other");
    showToast(`Fiche Qualité créée`, "success");
  };

  const handleUpdateQualityRecord = (updated: any) => {
    setQualityRecords((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    logActivity("Modification Qualité", `Mise à jour fiche qualité : ${updated.title}`, "other");
    showToast(`Fiche Qualité mise à jour`, "success");
  };

  const handleDeleteQualityRecord = (id: string) => {
    setQualityRecords((prev) => prev.filter((q) => q.id !== id));
    logActivity("Suppression Qualité", `Suppression fiche qualité ID: ${id}`, "other");
    showToast(`Fiche Qualité supprimée`, "info");
  };

  const handleAddEnvironmentLog = (newLog: any) => {
    setEnvironmentLogs((prev) => [newLog, ...prev]);
    logActivity("Saisie Environnement", `Relevé Éco : ${newLog.category} (${newLog.value} ${newLog.unit})`, "other");
    showToast(`Relevé Environnemental enregistré`, "success");
  };

  const handleUpdateEnvironmentLog = (updated: any) => {
    setEnvironmentLogs((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    logActivity("Modification Environnement", `Mise à jour relevé éco : ${updated.category}`, "other");
    showToast(`Relevé Environnemental mis à jour`, "success");
  };

  const handleDeleteEnvironmentLog = (id: string) => {
    setEnvironmentLogs((prev) => prev.filter((e) => e.id !== id));
    logActivity("Suppression Environnement", `Suppression relevé éco ID: ${id}`, "other");
    showToast(`Relevé Environnemental supprimé`, "info");
  };

  const handleVerifyPassword = () => {
    if (!pendingRole) return;
    const correctPassword = passwords[pendingRole] || "0000";
    if (passwordInput === correctPassword) {
      setCurrentUserRole(pendingRole);
      localStorage.setItem("chery_gmao_user_role", pendingRole);
      setPendingRole(null);
      setPasswordInput("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLoginVerifyPassword = () => {
    if (!loginPendingRole) return;
    const correctPassword = passwords[loginPendingRole] || "0000";
    if (loginPasswordInput === correctPassword) {
      setCurrentUserRole(loginPendingRole);
      localStorage.setItem("chery_gmao_user_role", loginPendingRole);
      setIsAuthenticated(true);
      localStorage.setItem("chery_gmao_authenticated", "true");
      setLoginPendingRole(null);
      setLoginPasswordInput("");
      setLoginPasswordError(false);
    } else {
      setLoginPasswordError(true);
    }
  };

  const getAllowedWorkshop = (role: string): Workshop | undefined => {
    if (role === "service_rapide") return "Service Rapide";
    if (role === "atelier_mecanique") return "Atelier Mécanique";
    if (role === "atelier_diagnostic") return "Atelier Diagnostic";
    if (role === "carrosserie") return "Carrosserie";
    if (role === "lavage") return "Lavage";
    if (role === "batiment") return "Maintenance Bâtiment";
    return undefined;
  };

  const isEquipmentsReadOnly = currentUserRole === "supervisor";
  const isPurchasesReadOnly = currentUserRole === "supervisor";
  const isSettingsReadOnly = currentUserRole !== "admin";
  const canAccessProjetsAndAmelioration = currentUserRole === "admin" || currentUserRole === "supervisor";
  const allowedWorkshop = getAllowedWorkshop(currentUserRole);

  useEffect(() => {
    if (!canAccessProjetsAndAmelioration && (activeTab === "projets" || activeTab === "amelioration")) {
      setActiveTab("dashboard");
    }
  }, [currentUserRole, activeTab, canAccessProjetsAndAmelioration]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_passwords", JSON.stringify(passwords));
  }, [passwords]);

  // Save states to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem("chery_gmao_equipments", JSON.stringify(equipments));
  }, [equipments]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_interventions", JSON.stringify(interventions));
  }, [interventions]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_spare_parts", JSON.stringify(spareParts));
  }, [spareParts]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_vendors", JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_purchase_requests", JSON.stringify(purchaseRequests));
  }, [purchaseRequests]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_compliance", JSON.stringify(compliance));
  }, [compliance]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_budget", JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_contracts", JSON.stringify(contracts));
  }, [contracts]);

  // Save navigation and filter states to LocalStorage on changes
  useEffect(() => {
    if (activeTab === "excel" || activeTab === "guide" || (activeTab === "logs" && currentUserRole !== "admin")) {
      setActiveTab("dashboard");
      return;
    }
    localStorage.setItem("chery_gmao_active_tab", activeTab);
  }, [activeTab, currentUserRole]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_filter_workshop", selectedWorkshopFilter);
  }, [selectedWorkshopFilter]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_filter_type", selectedMaintenanceType);
  }, [selectedMaintenanceType]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_filter_status", selectedMaintenanceStatus);
  }, [selectedMaintenanceStatus]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_filter_calendar", showMaintenanceCalendar ? "true" : "false");
  }, [showMaintenanceCalendar]);

  // Check Neon DB Status
  const handleCheckNeonStatus = async () => {
    try {
      const res = await fetch("/api/db/status");
      const data = await res.json();
      setNeonStatus(data);
      return data;
    } catch (err: any) {
      const fallback = { configured: false, connected: false, message: "API /api/db/status non joignable", error: err?.message };
      setNeonStatus(fallback);
      return fallback;
    }
  };

  // Sync state to Neon DB & Disk
  const handleSyncToNeon = async (overrides?: Record<string, any>) => {
    try {
      const backupPayload = {
        equipments,
        interventions,
        spareParts,
        vendors,
        purchaseRequests,
        compliance,
        budget,
        contracts,
        activityLogs,
        userProfiles,
        projects,
        audits5s,
        leanItems,
        safetyRecords,
        qualityRecords,
        environmentLogs,
        savedAt: new Date().toISOString(),
        version: "GMAO-STA-1.0",
        ...(overrides || {})
      };

      const res = await fetch("/api/db/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupPayload)
      });
      const result = await res.json();
      if (result.success) {
        if (result.neonSync) {
          setNeonStatus((prev) => prev ? { ...prev, connected: true, configured: true } : { configured: true, connected: true });
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Sync to Neon failed:", e);
      return false;
    }
  };

  // Load state from Neon DB
  const handleLoadFromNeon = async () => {
    try {
      const res = await fetch("/api/db/data");
      const result = await res.json();
      if (result.success && result.data) {
        handleImportAllData(result.data);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Load from Neon failed:", e);
      return false;
    }
  };

  // Check Neon connection status & auto-initialize or load on startup
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const status = await handleCheckNeonStatus();
        if (status?.connected) {
          // If Neon has data, load it; if it is empty, seed it with the app data immediately!
          if (status.totalKeys && status.totalKeys > 0) {
            const res = await fetch("/api/db/data");
            const result = await res.json();
            if (result.success && result.data && Object.keys(result.data).length > 0) {
              handleImportAllData(result.data);
            }
          } else {
            console.log("[GMAO] Base Neon connectée mais vide. Initialisation automatique...");
            await handleSyncToNeon();
            await handleCheckNeonStatus();
          }
        }
      } catch (e) {
        console.warn("[GMAO] Erreur lors de l'initialisation DB:", e);
      }
    };

    initDatabase();
  }, []);

  // Function to manually trigger database backup to LocalStorage AND Neon / Disk
  const handleManualSaveToDisk = () => {
    setDiskSyncStatus("syncing");
    try {
      localStorage.setItem("chery_gmao_equipments", JSON.stringify(equipments));
      localStorage.setItem("chery_gmao_interventions", JSON.stringify(interventions));
      localStorage.setItem("chery_gmao_spare_parts", JSON.stringify(spareParts));
      localStorage.setItem("chery_gmao_vendors", JSON.stringify(vendors));
      localStorage.setItem("chery_gmao_purchase_requests", JSON.stringify(purchaseRequests));
      localStorage.setItem("chery_gmao_compliance", JSON.stringify(compliance));
      localStorage.setItem("chery_gmao_budget", JSON.stringify(budget));
      localStorage.setItem("chery_gmao_contracts", JSON.stringify(contracts));
      localStorage.setItem("chery_gmao_activity_logs", JSON.stringify(activityLogs));
      localStorage.setItem("chery_gmao_user_profiles", JSON.stringify(userProfiles));

      const backupPayload = {
        equipments,
        interventions,
        spareParts,
        vendors,
        purchaseRequests,
        compliance,
        budget,
        contracts,
        activityLogs,
        userProfiles,
        projects,
        audits5s,
        leanItems,
        safetyRecords,
        qualityRecords,
        environmentLogs,
        savedAt: new Date().toISOString(),
        version: "GMAO-STA-1.0"
      };

      fetch("/api/db/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupPayload)
      })
        .then((res) => res.json())
        .then((resData) => {
          setDiskSyncStatus("synced");
          if (resData.success) {
            if (resData.neonSync) {
              setNeonStatus((prev) => prev ? { ...prev, connected: true } : { configured: true, connected: true });
              showToast("☁️ Sauvegarde réussie sur Neon PostgreSQL & Local !", "success");
            } else {
              showToast("💾 Sauvegarde réussie dans le stockage local et serveur !", "success");
            }
          } else {
            showToast("💾 Base de données enregistrée en mémoire locale", "info");
          }
        })
        .catch((err) => {
          console.warn("[GMAO] API Sync non disponible, sauvegarde locale OK:", err);
          setDiskSyncStatus("synced");
          showToast("💾 Base de données enregistrée en mémoire locale (LocalStorage)", "success");
        });
    } catch (err) {
      console.error("[GMAO] Échec de la sauvegarde locale:", err);
      setDiskSyncStatus("error");
      showToast("⚠️ Mémoire locale pleine ou inaccessible", "error");
    }
  };

  // Automatic debounced backup to server & Neon
  useEffect(() => {
    const timer = setTimeout(() => {
      const backupPayload = {
        equipments,
        interventions,
        spareParts,
        vendors,
        purchaseRequests,
        compliance,
        budget,
        contracts,
        activityLogs,
        userProfiles,
        projects,
        audits5s,
        leanItems,
        safetyRecords,
        qualityRecords,
        environmentLogs,
        savedAt: new Date().toISOString(),
        version: "GMAO-STA-1.0"
      };

      fetch("/api/db/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupPayload)
      }).catch(() => {
        // Silent catch for automatic background backup
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [equipments, interventions, spareParts, vendors, purchaseRequests, compliance, budget, contracts, userProfiles, projects, audits5s, leanItems, safetyRecords, qualityRecords, environmentLogs]);

  // Set disk sync status to synced on mount
  useEffect(() => {
    setDiskSyncStatus("synced");
  }, []);

  // Auto-clear all interventions and vendors as explicitly requested by the user
  useEffect(() => {
    const isCleaned = localStorage.getItem("chery_gmao_cleared_all_interventions_and_vendors_v1");
    if (!isCleaned) {
      localStorage.setItem("chery_gmao_cleared_all_interventions_and_vendors_v1", "true");
      localStorage.setItem("chery_gmao_interventions", JSON.stringify([]));
      localStorage.setItem("chery_gmao_vendors", JSON.stringify([]));
      setInterventions([]);
      setVendors([]);
      handleSyncToNeon({ interventions: [], vendors: [] });
    }
  }, []);

  // Auto-migration to version 9: Populated with full STA Chery Tunisia dataset
  useEffect(() => {
    const migrated = localStorage.getItem("chery_gmao_db_migrated_v9_populated_chery");
    if (!migrated) {
      localStorage.setItem("chery_gmao_database_mode", "demo");
      localStorage.setItem("chery_gmao_equipments", JSON.stringify(INITIAL_EQUIPMENTS));
      localStorage.setItem("chery_gmao_interventions", JSON.stringify([]));
      localStorage.setItem("chery_gmao_spare_parts", JSON.stringify(INITIAL_SPARE_PARTS));
      localStorage.setItem("chery_gmao_vendors", JSON.stringify([]));
      localStorage.setItem("chery_gmao_purchase_requests", JSON.stringify(INITIAL_PURCHASE_REQUESTS));
      localStorage.setItem("chery_gmao_contracts", JSON.stringify(INITIAL_CONTRACTS));
      localStorage.setItem("chery_gmao_compliance", JSON.stringify(INITIAL_COMPLIANCE_CHECKS));
      localStorage.setItem("chery_gmao_budget", JSON.stringify(BUDGET_2026));
      localStorage.setItem("chery_gmao_db_migrated_v9_populated_chery", "true");

      setDbMode("demo");
      setEquipments(INITIAL_EQUIPMENTS);
      setInterventions([]);
      setSpareParts(INITIAL_SPARE_PARTS);
      setVendors([]);
      setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
      setContracts(INITIAL_CONTRACTS);
      setCompliance(INITIAL_COMPLIANCE_CHECKS);
      setBudget(BUDGET_2026);
      setActivityLogs([
        {
          id: "chery-init-1",
          timestamp: new Date().toLocaleString("fr-FR"),
          userRole: "admin",
          action: "Base de Données Chery Chargée",
          details: "Chargement du parc d'équipements, des demandes d'achats et budget de STA Chery Tunisie.",
          type: "other"
        }
      ]);
    }
  }, []);

  // Sync selected equipment code for breakdown alert from URL or default to user's workshop
  useEffect(() => {
    if (showGlobalAlertModal) {
      if (allowedWorkshop) {
        setAlertSelectedWorkshop(allowedWorkshop);
        const wsEquipments = equipments.filter((e) => e.workshop === allowedWorkshop);
        if (wsEquipments.length > 0) {
          setAlertEqCode(wsEquipments[0].code);
        } else {
          setAlertEqCode("");
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        const eqCode = params.get("eq");
        if (eqCode && equipments.some((e) => e.code.toUpperCase() === eqCode.toUpperCase())) {
          setAlertEqCode(eqCode.toUpperCase());
        } else if (equipments.length > 0) {
          setAlertEqCode(equipments[0].code);
        }
      }

      // Prefill technician name based on current logged in user role
      if (!alertTech) {
        const roleLabel = ROLE_LABELS[currentUserRole] || "Technicien STA";
        const cleanedName = roleLabel.split(" (")[0].includes("Chef d'Atelier:")
          ? roleLabel.split("Chef d'Atelier:")[1]?.trim()
          : roleLabel.split(" (")[0];
        setAlertTech(cleanedName || "Technicien STA");
      }
    }
  }, [showGlobalAlertModal, equipments, currentUserRole, allowedWorkshop]);

  // Handle global breakdown alert submission
  const handleGlobalAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEqCode || !alertTitle) {
      alert("Veuillez sélectionner un équipement et décrire succinctement le symptôme.");
      return;
    }

    const selectedEq = equipments.find((eq) => eq.code === alertEqCode);
    if (!selectedEq) return;

    // 1. Create Corrective Intervention
    const newInt: Intervention = {
      id: `INT-PANNE-${Date.now()}`,
      equipmentCode: alertEqCode,
      type: "Correctif",
      title: `🚨 ALERTE PANNE: ${alertTitle}`,
      description: alertDesc || "Alerte de panne signalée d'urgence par le technicien en atelier.",
      dateIntervention: new Date().toISOString().split("T")[0],
      durationHours: 2,
      costParts: 0,
      costLabor: 120, // default labor rate for diagnostics
      technician: alertTech || "Technicien STA",
      status: "Nouvelle",
      partsUsed: [],
      priority: alertPriority,
      photos: alertPhotos
    };

    // 2. Add intervention
    handleAddIntervention(newInt);

    // 3. Mark equipment status as En Panne
    handleUpdateEquipmentStatus(alertEqCode, "En Panne");

    // 4. Log in audit journal
    logActivity(
      "Alerte Panne Émise",
      `Alerte de panne créée pour l'équipement ${selectedEq.name} (${alertEqCode}) par ${alertTech || "Technicien"}. Symptôme: ${alertTitle} (Sévérité: ${alertPriority})`,
      "equipment"
    );

    // 5. Success feedback & navigation
    showToast(`🚨 Alerte enregistrée ! Équipement ${selectedEq.name} (${alertEqCode}) est passé "En Panne".`, "error");
    
    // Reset states
    setShowGlobalAlertModal(false);
    setAlertTitle("");
    setAlertDesc("");
    setAlertPriority("Moyenne");
    setAlertPhotos([]);

    // Navigate to the equipment list to show the panne state
    setActiveTab("equipements");
    setSelectedWorkshopFilter("All");
  };

  // Handle Building Anomaly Report Submission (No Auth Required)
  const handleReportBuildingAnomaly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anomalyDesc.trim() || !anomalyReporter.trim()) {
      alert("Veuillez saisir une description du problème et votre nom/prénom.");
      return;
    }

    // Determine default equipment code based on selected domain/category
    let targetEqCode = "EQ-BAT-ELEC";
    if (anomalyCategory.includes("Climatisation") || anomalyCategory.includes("Chauffage")) {
      targetEqCode = "EQ-BAT-CLIM";
    } else if (anomalyCategory.includes("Plomberie") || anomalyCategory.includes("Fuite")) {
      targetEqCode = "EQ-BAT-PLOMB";
    } else if (anomalyCategory.includes("Serrurerie") || anomalyCategory.includes("Porte") || anomalyCategory.includes("Rideau")) {
      targetEqCode = "EQ-BAT-SERR";
    } else if (anomalyCategory.includes("Éclairage") || anomalyCategory.includes("Ampoule")) {
      targetEqCode = "EQ-BAT-ECLAIR";
    }

    // Find equipment or fall back to EQ-BAT-ELEC or any building equipment
    const existingEq = equipments.find((eq) => eq.code === targetEqCode) || equipments.find((eq) => eq.workshop === "Maintenance Bâtiment");
    const finalEqCode = existingEq ? existingEq.code : "EQ-BAT-ELEC";

    const ticketNumber = `TICKET-BAT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIntervention: Intervention = {
      id: `INT-BAT-${Date.now()}`,
      equipmentCode: finalEqCode,
      type: "Correctif",
      title: `[ANOMALIE BÂTIMENT] ${anomalyCategory} - ${anomalyLocation}`,
      description: `${anomalyDesc.trim()}\n\n📍 Zone: ${anomalyLocation}\n👤 Demandeur: ${anomalyReporter.trim()} ${anomalyPhone.trim() ? `(Tél/Poste: ${anomalyPhone.trim()})` : ""}\n🎫 N° Ticket Suivi: ${ticketNumber}`,
      dateIntervention: new Date().toISOString().split("T")[0],
      durationHours: 1,
      costParts: 0,
      costLabor: 0,
      technician: "Équipe Maintenance Bâtiment",
      status: "Nouvelle",
      partsUsed: [],
      priority: anomalyPriority,
      executorType: "Interne",
      photos: anomalyPhotos
    };

    // Add intervention
    handleAddIntervention(newIntervention);

    // If critical or high, mark equipment degraded or in breakdown
    if (anomalyPriority === "Critique" || anomalyPriority === "Haute") {
      handleUpdateEquipmentStatus(finalEqCode, "Dégradé");
    }

    // Audit log
    logActivity(
      "Anomalie Bâtiment Déclarée",
      `Nouveau ticket ${ticketNumber} créé sans connexion. Domaine: ${anomalyCategory} | Zone: ${anomalyLocation} | Demandeur: ${anomalyReporter.trim()} (Sévérité: ${anomalyPriority})`,
      "intervention"
    );

    // Set success view
    setBuildingAnomalySuccess(ticketNumber);
    setAnomalyPhotos([]);
  };

  // -------------------------------------------------------------
  // CORE GMAO WORKFLOW OPERATIONS & SYSTEM INTEGRATIONS
  // -------------------------------------------------------------

  // A. Add a new Equipment Asset
  const handleAddEquipment = (newEq: Equipment) => {
    const nextEquipments = [newEq, ...equipments];
    setEquipments(nextEquipments);
    localStorage.setItem("chery_gmao_equipments", JSON.stringify(nextEquipments));
    handleSyncToNeon({ equipments: nextEquipments });

    showToast(`Équipement ${newEq.code} (${newEq.name}) ajouté et sauvegardé dans Neon`, "success");
    logActivity(
      "Ajout Équipement",
      `Création de l'équipement : ${newEq.name} (${newEq.code}) - Criticité: ${newEq.critical ? "Critique A" : "Standard"} - Atelier: ${newEq.workshop}`,
      "equipment"
    );

    // Email alert for breakdowns & anomalies
    if (newEq.status === "En Panne" || newEq.status === "Hors Service") {
      sendEmailAlert({
        triggerType: "PANNE",
        subject: `🚨 [PANNE] Nouvel Équipement ${newEq.code} en Panne`,
        message: `L'équipement ${newEq.code} (${newEq.name}) créé dans l'atelier "${newEq.workshop}" a été enregistré au statut En Panne.`,
        details: { equipmentCode: newEq.code, equipmentName: newEq.name, workshop: newEq.workshop }
      });
    } else if (newEq.status === "Dégradé") {
      sendEmailAlert({
        triggerType: "ANOMALIE",
        subject: `⚠️ [ANOMALIE] Nouvel Équipement ${newEq.code} en État Dégradé`,
        message: `L'équipement ${newEq.code} (${newEq.name}) créé dans l'atelier "${newEq.workshop}" signale une anomalie (État Dégradé).`,
        details: { equipmentCode: newEq.code, equipmentName: newEq.name, workshop: newEq.workshop }
      });
    }
  };

  // A1. Update an existing Equipment Asset (supports code modification by Admin)
  const handleUpdateEquipment = (updatedEq: Equipment, oldCode?: string) => {
    const targetCode = oldCode || updatedEq.code;
    const nextEquipments = equipments.map((eq) => (eq.code === targetCode ? updatedEq : eq));
    setEquipments(nextEquipments);
    localStorage.setItem("chery_gmao_equipments", JSON.stringify(nextEquipments));
    handleSyncToNeon({ equipments: nextEquipments });

    // If equipment code was updated by admin, cascade code change to related interventions and purchase requests
    if (oldCode && oldCode !== updatedEq.code) {
      setInterventions((prev) =>
        prev.map((int) =>
          int.equipmentCode === oldCode ? { ...int, equipmentCode: updatedEq.code } : int
        )
      );
      setPurchaseRequests((prev) =>
        prev.map((pr) =>
          pr.equipmentCode === oldCode ? { ...pr, equipmentCode: updatedEq.code } : pr
        )
      );
    }

    logActivity(
      "Modification Équipement",
      `Mise à jour des informations de l'équipement : ${updatedEq.name} (${oldCode && oldCode !== updatedEq.code ? `${oldCode} ➔ ${updatedEq.code}` : updatedEq.code}) - Statut: ${updatedEq.status}`,
      "equipment"
    );

    // Alert if updated to breakdown or anomaly
    if (updatedEq.status === "En Panne" || updatedEq.status === "Hors Service") {
      sendEmailAlert({
        triggerType: "PANNE",
        subject: `🚨 [PANNE] Équipement ${updatedEq.code} passé en Panne`,
        message: `L'équipement ${updatedEq.code} (${updatedEq.name}) dans l'atelier "${updatedEq.workshop}" a été basculé au statut EN PANNE.`,
        details: { equipmentCode: updatedEq.code, equipmentName: updatedEq.name, workshop: updatedEq.workshop }
      });
    } else if (updatedEq.status === "Dégradé") {
      sendEmailAlert({
        triggerType: "ANOMALIE",
        subject: `⚠️ [ANOMALIE] Équipement ${updatedEq.code} en État Dégradé`,
        message: `L'équipement ${updatedEq.code} (${updatedEq.name}) dans l'atelier "${updatedEq.workshop}" présente une anomalie (État Dégradé).`,
        details: { equipmentCode: updatedEq.code, equipmentName: updatedEq.name, workshop: updatedEq.workshop }
      });
    }
  };

  // A2. Delete an Equipment Asset
  const handleDeleteEquipment = (code: string) => {
    if (currentUserRole !== "admin") {
      alert("⛔ Accès refusé : Seul l'Administrateur (Admin) est autorisé à supprimer un équipement.");
      return;
    }
    const nextEquipments = equipments.filter((eq) => eq.code !== code);
    setEquipments(nextEquipments);
    localStorage.setItem("chery_gmao_equipments", JSON.stringify(nextEquipments));
    handleSyncToNeon({ equipments: nextEquipments });

    logActivity(
      "Suppression Équipement",
      `Suppression définitive de l'équipement avec le code ${code}`,
      "equipment"
    );
  };

  // B. Update Equipment Operational Status
  const handleUpdateEquipmentStatus = (code: string, status: EquipmentStatus) => {
    const targetEq = equipments.find((eq) => eq.code === code);
    const eqName = targetEq ? targetEq.name : code;
    const workshop = targetEq ? targetEq.workshop : "Atelier STA";

    const nextEquipments = equipments.map((eq) => (eq.code === code ? { ...eq, status } : eq));
    setEquipments(nextEquipments);
    localStorage.setItem("chery_gmao_equipments", JSON.stringify(nextEquipments));
    handleSyncToNeon({ equipments: nextEquipments });

    logActivity(
      "Changement d'État",
      `Équipement ${code} passé au statut : ${status}`,
      "equipment"
    );

    // Auto email alerts
    if (status === "En Panne" || status === "Hors Service") {
      sendEmailAlert({
        triggerType: "PANNE",
        subject: `🚨 [PANNE] Signalement de Panne sur ${code} (${eqName})`,
        message: `L'équipement ${code} (${eqName}) dans l'atelier "${workshop}" a été déclaré EN PANNE / HORS SERVICE.`,
        details: { equipmentCode: code, equipmentName: eqName, workshop, urgency: "Haute" }
      });
    } else if (status === "Dégradé") {
      sendEmailAlert({
        triggerType: "ANOMALIE",
        subject: `⚠️ [ANOMALIE] État Dégradé relevé sur ${code} (${eqName})`,
        message: `Une anomalie a été signalée sur l'équipement ${code} (${eqName}) dans l'atelier "${workshop}".`,
        details: { equipmentCode: code, equipmentName: eqName, workshop, urgency: "Moyenne" }
      });
    }
  };

  // C. Log a new Intervention (With automatic Warehouse Stock & Budget consumptions!)
  const handleAddIntervention = (newInt: Intervention) => {
    // 1. Add intervention to list
    const nextInterventions = [newInt, ...interventions];
    setInterventions(nextInterventions);
    localStorage.setItem("chery_gmao_interventions", JSON.stringify(nextInterventions));
    handleSyncToNeon({ interventions: nextInterventions });

    // 2. Subtract inventory items used for the intervention
    if (newInt.partsUsed && newInt.partsUsed.length > 0) {
      setSpareParts((prevParts) =>
        prevParts.map((part) => {
          const usedRecord = newInt.partsUsed.find((pu) => pu.partCode === part.code);
          if (usedRecord) {
            const newStock = Math.max(0, part.currentStock - usedRecord.quantity);
            return { ...part, currentStock: newStock };
          }
          return part;
        })
      );
    }

    // 3. Update the associated equipment's status depending on intervention state
    const targetEq = equipments.find((eq) => eq.code === newInt.equipmentCode);
    if (targetEq) {
      let nextStatus: EquipmentStatus = targetEq.status;
      if (newInt.status === "En cours") {
        nextStatus = "En Maintenance";
      } else if (newInt.status === "Terminé") {
        nextStatus = "Opérationnel";
      } else if (newInt.status === "Planifié" && newInt.type === "Correctif") {
        nextStatus = "En Panne";
      }
      handleUpdateEquipmentStatus(newInt.equipmentCode, nextStatus);

      // 4. Update budget consumption for the workshop/service
      const totalCost = newInt.costParts + newInt.costLabor;
      if (totalCost > 0) {
        setBudget((prevBudget) => {
          const currentWorkshop = targetEq.workshop;
          const currentSpent = prevBudget.spentByWorkshop[currentWorkshop] || 0;
          return {
            ...prevBudget,
            spentByWorkshop: {
              ...prevBudget.spentByWorkshop,
              [currentWorkshop]: currentSpent + totalCost
            }
          };
        });
      }
    }

    showToast(`Intervention ${newInt.id} créée avec succès (${newInt.equipmentCode})`, "success");

    logActivity(
      "Nouvelle Intervention",
      `Création d'une intervention ${newInt.type} pour l'équipement ${newInt.equipmentCode} (${newInt.title}) - Statut: ${newInt.status}`,
      "intervention"
    );

    // Trigger email alert for corrective/urgent interventions or breakdowns
    if (
      newInt.type === "Correctif" ||
      newInt.priority === "Haute" ||
      newInt.priority === "Critique" ||
      newInt.title.toLowerCase().includes("panne") ||
      newInt.title.toLowerCase().includes("anomalie")
    ) {
      sendEmailAlert({
        triggerType: newInt.type === "Correctif" ? "PANNE" : "ANOMALIE",
        subject: `🚨 [INTERVENTION] ${newInt.id} - ${newInt.title}`,
        message: `Une intervention de type ${newInt.type} (${newInt.id}) a été créée pour l'équipement ${newInt.equipmentCode}.\nPriorité: ${newInt.priority || "Moyenne"}.\nTechnicien: ${newInt.technician}.\nDescription: ${newInt.description}`,
        details: { equipmentCode: newInt.equipmentCode, urgency: newInt.priority || "Haute", author: newInt.technician }
      });
    }
  };

  // D. Update Intervention Status (and sync Equipment status back)
  const handleUpdateInterventionStatus = (id: string, newStatus: InterventionStatus) => {
    const targetInt = interventions.find((i) => i.id === id);
    if (targetInt && allowedWorkshop) {
      const targetEq = equipments.find((e) => e.code === targetInt.equipmentCode);
      if (targetEq && targetEq.workshop !== allowedWorkshop) {
        alert(`⛔ Action non autorisée : Vous pouvez uniquement valider et traiter les interventions de votre propre atelier (${allowedWorkshop}).`);
        return;
      }
    }

    const nextInterventions = interventions.map((int) => (int.id === id ? { ...int, status: newStatus } : int));
    setInterventions(nextInterventions);
    localStorage.setItem("chery_gmao_interventions", JSON.stringify(nextInterventions));
    handleSyncToNeon({ interventions: nextInterventions });

    if (targetInt) {
      // If changing to "Terminée", "Clôturée" or "Terminé", restore equipment back to "Opérationnel"
      if (newStatus === "Terminée" || newStatus === "Clôturée" || newStatus === "Terminé") {
        handleUpdateEquipmentStatus(targetInt.equipmentCode, "Opérationnel");
      } else if (newStatus === "En cours") {
        handleUpdateEquipmentStatus(targetInt.equipmentCode, "En Maintenance");
      } else if (newStatus === "Nouvelle" || newStatus === "Planifiée" || newStatus === "Planifié") {
        if (targetInt.type === "Correctif") {
          handleUpdateEquipmentStatus(targetInt.equipmentCode, "En Panne");
        }
      }

      logActivity(
        "Statut Intervention",
        `Intervention sur ${targetInt.equipmentCode} mise à jour vers le statut : ${newStatus}`,
        "intervention"
      );
    }
  };

  // D2. Update entire Intervention record (signature, checklist, etc.)
  const handleUpdateIntervention = (updatedInt: Intervention) => {
    if (allowedWorkshop) {
      const targetEq = equipments.find((e) => e.code === updatedInt.equipmentCode);
      if (targetEq && targetEq.workshop !== allowedWorkshop) {
        alert(`⛔ Action non autorisée : Vous pouvez uniquement modifier les interventions de votre propre atelier (${allowedWorkshop}).`);
        return;
      }
    }

    const nextInterventions = interventions.map((int) => (int.id === updatedInt.id ? updatedInt : int));
    setInterventions(nextInterventions);
    localStorage.setItem("chery_gmao_interventions", JSON.stringify(nextInterventions));
    handleSyncToNeon({ interventions: nextInterventions });

    // Sync equipment status back if the intervention is Terminée or Clôturée
    if (updatedInt.status === "Clôturée" || updatedInt.status === "Terminée") {
      handleUpdateEquipmentStatus(updatedInt.equipmentCode, "Opérationnel");
    } else if (updatedInt.status === "En cours") {
      handleUpdateEquipmentStatus(updatedInt.equipmentCode, "En Maintenance");
    }

    logActivity(
      "Mise à jour Intervention",
      `Intervention ${updatedInt.id} sur ${updatedInt.equipmentCode} mise à jour. Statut: ${updatedInt.status}`,
      "intervention"
    );
  };

  // E. Restock Spare Parts
  const handleRestockPart = (code: string, qty: number) => {
    setSpareParts((prev) =>
      prev.map((part) => (part.code === code ? { ...part, currentStock: part.currentStock + qty } : part))
    );
    logActivity(
      "Réapprovisionnement Pièce",
      `Entrée en stock de +${qty} unités pour la pièce ${code}`,
      "spare_part"
    );
  };

  // F. Register a new Spare Part designation
  const handleAddPart = (newPart: SparePart) => {
    setSpareParts((prev) => [newPart, ...prev]);
    logActivity(
      "Création Pièce",
      `Ajout de la pièce de rechange au catalogue : ${newPart.name} (${newPart.code}) - Prix: ${newPart.unitPrice} TND`,
      "spare_part"
    );
  };

  // G. Log a new Regulatory Audit Certificate
  const handleAddComplianceCheck = (newCheck: ComplianceCheck) => {
    setCompliance((prev) => [newCheck, ...prev]);
    logActivity(
      "Contrôle Conformité",
      `Saisie du contrôle réglementaire : ${newCheck.title} pour l'équipement ${newCheck.equipmentCode} (Organisme: ${newCheck.bodyName} - Statut: ${newCheck.status})`,
      "compliance"
    );
  };

  // H. Purchase Order (DA) Operations
  const handleAddPurchaseRequest = (newReq: PurchaseRequest) => {
    setPurchaseRequests((prev) => [newReq, ...prev]);
    logActivity(
      "Création DA",
      `Création de la Demande d'Achat (DA #${newReq.id}) pour : ${newReq.equipmentName} - Quantité: ${newReq.quantity} - Urgence: ${newReq.urgency} - Coût estimé: ${newReq.estimatedCost} TND`,
      "purchase"
    );

    sendEmailAlert({
      triggerType: "DEMANDE_ACHAT",
      subject: `🛒 [DEMANDE D'ACHAT] DA #${newReq.id} - ${newReq.equipmentName}`,
      message: `Une nouvelle Demande d'Achat (DA #${newReq.id}) a été soumise pour "${newReq.equipmentName}".\nQuantité: ${newReq.quantity}\nUrgence: ${newReq.urgency}\nCoût estimé: ${newReq.estimatedCost} TND\nDemandeur: ${newReq.requestedBy}`,
      details: {
        equipmentName: newReq.equipmentName,
        urgency: newReq.urgency,
        cost: newReq.estimatedCost,
        author: newReq.requestedBy
      }
    });
  };

  const handleUpdatePurchaseRequestStatus = (id: string, nextStatus: PurchaseRequest["status"]) => {
    setPurchaseRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          return { ...req, status: nextStatus };
        }
        return req;
      })
    );
    logActivity(
      "Validation DA",
      `Demande d'achat #${id} mise à jour vers le statut : ${nextStatus}`,
      "purchase"
    );
  };

  const handleUpdatePurchaseRequest = (updatedReq: PurchaseRequest) => {
    setPurchaseRequests((prev) =>
      prev.map((req) => (req.id === updatedReq.id ? updatedReq : req))
    );
    logActivity(
      "Modification DA",
      `Mise à jour de la demande d'achat ${updatedReq.id} (${updatedReq.equipmentName}) - Montant: ${updatedReq.estimatedCost} TND - Statut: ${updatedReq.status}`,
      "purchase"
    );
    showToast(`Demande d'achat ${updatedReq.id} mise à jour`, "success");
  };

  const handleDeletePurchaseRequest = (id: string) => {
    if (currentUserRole !== "admin") {
      alert("⛔ Accès refusé : Seul l'Administrateur (Admin) est autorisé à supprimer une demande d'achat.");
      return;
    }
    const target = purchaseRequests.find((p) => p.id === id);
    setPurchaseRequests((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      logActivity(
        "Suppression DA",
        `Suppression de la demande d'achat ${target.id} (${target.equipmentName})`,
        "purchase"
      );
      showToast(`Demande d'achat ${id} supprimée`, "info");
    }
  };

  // H2. Maintenance Contract Operations
  const handleAddContract = (newContract: MaintenanceContract) => {
    setContracts((prev) => [newContract, ...prev]);
    logActivity(
      "Nouveau Contrat",
      `Création du contrat de maintenance : ${newContract.title} (${newContract.id}) - Montant: ${newContract.costAnnual} TND/an`,
      "compliance"
    );
    showToast(`Contrat ${newContract.title} créé avec succès`, "success");
  };

  const handleUpdateContract = (updatedContract: MaintenanceContract) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === updatedContract.id ? updatedContract : c))
    );
    logActivity(
      "Modification Contrat",
      `Mise à jour du contrat de maintenance : ${updatedContract.title} (${updatedContract.id}) - Statut: ${updatedContract.status}`,
      "compliance"
    );
    showToast(`Contrat ${updatedContract.title} mis à jour`, "success");
  };

  const handleDeleteContract = (id: string) => {
    if (currentUserRole !== "admin") {
      alert("⛔ Accès refusé : Seul l'Administrateur (Admin) est autorisé à supprimer un contrat de maintenance.");
      return;
    }
    const target = contracts.find((c) => c.id === id);
    setContracts((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      logActivity(
        "Suppression Contrat",
        `Suppression du contrat de maintenance : ${target.title} (${target.id})`,
        "compliance"
      );
      showToast(`Contrat ${target.title} supprimé`, "info");
    }
  };

  const handleAddVendor = (newVendor: Vendor) => {
    setVendors((prev) => [newVendor, ...prev]);
    logActivity(
      "Nouveau Fournisseur",
      `Enregistrement du fournisseur agréé : ${newVendor.name} - Spécialité: ${newVendor.serviceType}`,
      "purchase"
    );
  };

  const handleUpdateVendor = (updatedVendor: Vendor) => {
    setVendors((prev) => prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)));
    logActivity(
      "Modification Fournisseur",
      `Mise à jour des coordonnées du prestataire : ${updatedVendor.name}`,
      "purchase"
    );
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (currentUserRole !== "admin") {
      alert("⛔ Accès refusé : Seul l'Administrateur (Admin) est autorisé à supprimer un prestataire.");
      return;
    }
    const v = vendors.find((x) => x.id === vendorId);
    setVendors((prev) => prev.filter((x) => x.id !== vendorId));
    if (v) {
      logActivity(
        "Suppression Fournisseur",
        `Suppression du prestataire externe : ${v.name}`,
        "purchase"
      );
    }
  };

  const handleUpdateBudgetAllocation = (workshop: Workshop, amount: number) => {
    setBudget((prev) => {
      const nextAllocated: Record<Workshop, number> = {
        ...prev.allocatedByWorkshop,
        [workshop]: amount
      };
      const nextTotal = Object.values(nextAllocated).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
      return {
        ...prev,
        allocatedByWorkshop: nextAllocated,
        totalBudget: nextTotal
      };
    });
    logActivity(
      "Allocation Budgétaire",
      `Le budget alloué à l'atelier ${workshop} a été redéfini à : ${(amount ?? 0).toLocaleString()} TND`,
      "budget"
    );
  };

  // Reset demo data trigger
  const handleResetDemoData = () => {
    setResetConfirmType("reset");
  };

  // Actually execute the demo data reset
  const executeResetDemoData = () => {
    localStorage.setItem("chery_gmao_database_mode", "demo");
    setDbMode("demo");
    localStorage.removeItem("chery_gmao_equipments");
    localStorage.removeItem("chery_gmao_interventions");
    localStorage.removeItem("chery_gmao_spare_parts");
    localStorage.removeItem("chery_gmao_compliance");
    localStorage.removeItem("chery_gmao_budget");
    localStorage.removeItem("chery_gmao_vendors");
    localStorage.removeItem("chery_gmao_purchase_requests");
    localStorage.removeItem("chery_gmao_contracts");
    localStorage.removeItem("chery_gmao_activity_logs");
    
    setEquipments(INITIAL_EQUIPMENTS);
    setInterventions(INITIAL_INTERVENTIONS);
    setSpareParts(INITIAL_SPARE_PARTS);
    setCompliance(INITIAL_COMPLIANCE_CHECKS);
    setBudget(BUDGET_2026);
    setVendors(INITIAL_VENDORS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setContracts(INITIAL_CONTRACTS);
    
    const initialLogs: ActivityLog[] = [
      {
        id: "reset-log-1",
        timestamp: new Date().toLocaleString("fr-FR"),
        userRole: "admin",
        action: "Réinitialisation Système",
        details: "Restauration complète de la base de données d'usine STA Tunisie (Mode Démonstration)",
        type: "other"
      }
    ];
    setActivityLogs(initialLogs);
    localStorage.setItem("chery_gmao_activity_logs", JSON.stringify(initialLogs));

    setSelectedWorkshopFilter("All");
    setSelectedMaintenanceType("All");
    setSelectedMaintenanceStatus("All");
    setShowMaintenanceCalendar(false);
    setActiveTab("dashboard");
    setResetConfirmType(null);
  };

  // Completely wipe the database for production trigger
  const handleClearAllData = () => {
    setResetConfirmType("clear");
  };

  // Actually execute the full wipe
  const executeClearAllData = () => {
    localStorage.setItem("chery_gmao_database_mode", "vierge");
    setDbMode("vierge");
    localStorage.removeItem("chery_gmao_equipments");
    localStorage.removeItem("chery_gmao_interventions");
    localStorage.removeItem("chery_gmao_spare_parts");
    localStorage.removeItem("chery_gmao_compliance");
    localStorage.removeItem("chery_gmao_budget");
    localStorage.removeItem("chery_gmao_vendors");
    localStorage.removeItem("chery_gmao_purchase_requests");
    localStorage.removeItem("chery_gmao_contracts");
    localStorage.removeItem("chery_gmao_activity_logs");
    
    setEquipments([]);
    setInterventions([]);
    setSpareParts([]);
    setCompliance([]);
    setContracts([]);
    setBudget({
      year: 2026,
      totalBudget: 0,
      allocatedByWorkshop: {
        "Service Rapide": 0,
        "Atelier Mécanique": 0,
        "Atelier Diagnostic": 0,
        "Carrosserie": 0,
        "Lavage": 0,
        "Réception Après-Vente": 0,
        "Magasin Pièces de Rechange": 0,
        "Maintenance Bâtiment": 0
      },
      spentByWorkshop: {
        "Service Rapide": 0,
        "Atelier Mécanique": 0,
        "Atelier Diagnostic": 0,
        "Carrosserie": 0,
        "Lavage": 0,
        "Réception Après-Vente": 0,
        "Magasin Pièces de Rechange": 0,
        "Maintenance Bâtiment": 0
      }
    });
    setVendors([]);
    setPurchaseRequests([]);
    
    const initialLogs: ActivityLog[] = [
      {
        id: "clear-log-1",
        timestamp: new Date().toLocaleString("fr-FR"),
        userRole: "admin",
        action: "Mise à Zéro Base",
        details: "Wipe de l'intégralité des données d'équipements, pièces, DAs et budgets (Mode Vierge activé)",
        type: "other"
      }
    ];
    setActivityLogs(initialLogs);
    localStorage.setItem("chery_gmao_activity_logs", JSON.stringify(initialLogs));

    setSelectedWorkshopFilter("All");
    setSelectedMaintenanceType("All");
    setSelectedMaintenanceStatus("All");
    setShowMaintenanceCalendar(false);
    setActiveTab("dashboard");
    setResetConfirmType(null);
  };

  const handleImportAllData = (importedData: any) => {
    if (!importedData) return;
    if (importedData.equipments) setEquipments(importedData.equipments);
    if (importedData.interventions) setInterventions(importedData.interventions);
    if (importedData.spareParts) setSpareParts(importedData.spareParts);
    if (importedData.vendors) setVendors(importedData.vendors);
    if (importedData.purchaseRequests) setPurchaseRequests(importedData.purchaseRequests);
    if (importedData.compliance) setCompliance(importedData.compliance);
    if (importedData.budget) setBudget(importedData.budget);
    if (importedData.contracts) setContracts(importedData.contracts);
    if (importedData.userProfiles) setUserProfiles(importedData.userProfiles);

    fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(importedData)
    }).catch(() => {});
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between antialiased font-sans relative">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Corporate header branding */}
        <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md shrink-0 py-3.5 z-10 shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3.5 select-none">
              <div className="bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200 flex items-center">
                <CheryStaLogo className="h-8 w-auto" />
              </div>
              <div className="border-l border-slate-200 pl-3.5 hidden sm:block">
                <span className="font-display font-black text-sm tracking-tight text-slate-900 block leading-tight">
                  STA TUNISIE
                </span>
                <span className="text-[10px] text-slate-500 font-bold tracking-wider block uppercase mt-0.5">
                  Concessionnaire Officiel Chery • Portail GMAO & Maintenance
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Système En Ligne
              </span>
            </div>
          </div>
        </header>

        {/* Central Content Container */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full z-10 relative space-y-8">
          
          {/* 🏢 1. ESPACE DÉCLARATION LIBRE • TOUT LE PERSONNEL (HERO CENTERPIECE) */}
          <div className="w-full bg-white rounded-3xl border-2 border-blue-500/30 shadow-md p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 shrink-0 shadow-xs">
                  <Building className="h-8 w-8 animate-pulse-subtle" />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-extrabold uppercase tracking-wider">
                    ⚡ Espace Déclaration Libre • Tout le Personnel STA
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Signaler une Anomalie Bâtiment & Infrastructure
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    Électricité, climatisation, fuite d'eau, plomberie, serrurerie, portes ou éclairage ? Déclarez un problème en 30 secondes sans mot de passe pour alerter instantanément l'équipe de maintenance.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowBuildingAnomalyModal(true);
                  setBuildingAnomalySuccess(null);
                }}
                className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-md shadow-blue-600/25 hover:scale-102 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <span>Déclarer une Anomalie (Accès Libre)</span>
              </button>
            </div>

            {/* Quick Category Shortcuts */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Sélection rapide par domaine d'intervention :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "⚡ Électricité & Éclairage", label: "⚡ Électricité", desc: "Prise, disjoncteur, panne" },
                  { id: "❄️ Climatisation & Chauffage", label: "❄️ Climatisation", desc: "Split, fuite, température" },
                  { id: "🚰 Plomberie & Sanitaires", label: "🚰 Plomberie", desc: "Fuite d'eau, WC, évacuation" },
                  { id: "🚪 Serrurerie & Portes", label: "🚪 Portes & Serrures", desc: "Rideau, serrure, vitrage" },
                  { id: "💡 Éclairage Ateliers/Showroom", label: "💡 Éclairage", desc: "Néons, projecteurs" },
                  { id: "🧱 Structure & Infiltration", label: "🧱 Bâtiment", desc: "Peinture, faux-plafond" },
                  { id: "🛡️ Sécurité & Extincteurs", label: "🛡️ Sécurité", desc: "Alarme, extincteur, accès" },
                  { id: "❓ Autre Problème Bâtiment", label: "❓ Autre Panne", desc: "Divers bâtiment" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setAnomalyCategory(cat.id);
                      setShowBuildingAnomalyModal(true);
                      setBuildingAnomalySuccess(null);
                    }}
                    className="text-left p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-blue-50/70 hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">{cat.label}</div>
                    <div className="text-[10px] text-slate-500">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 🔐 2. COMPACT BOTTOM SECTION: CHOIX DU PROFIL & ACCÈS ESPACE */}
          <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                  <Key className="h-4 w-4 text-chery-red" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Authentification Atelier & GMAO Pro
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Choisissez votre profil ci-dessous pour accéder à votre espace de travail avec votre code PIN d'atelier :
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                8 Profils d'accès
              </span>
            </div>

            {/* Compact Profile Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(ROLE_LABELS).map(([role, label]) => {
                let icon = "⚙️";
                let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                let hoverBorder = "hover:border-slate-400 hover:bg-slate-50";

                if (role === "admin") {
                  icon = "🔑";
                  badgeColor = "bg-red-50 text-chery-red border-red-200";
                  hoverBorder = "hover:border-chery-red hover:bg-red-50/50";
                } else if (role === "supervisor") {
                  icon = "👁️";
                  badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                  hoverBorder = "hover:border-amber-400 hover:bg-amber-50/50";
                } else {
                  if (role === "service_rapide") icon = "⚡";
                  else if (role === "carrosserie") icon = "🎨";
                  else if (role === "lavage") icon = "🧼";
                  else if (role === "atelier_diagnostic") icon = "🔬";
                  else if (role === "atelier_mecanique") icon = "⚙️";
                  else if (role === "batiment") icon = "🏢";
                  hoverBorder = "hover:border-blue-400 hover:bg-blue-50/50";
                }

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setLoginPendingRole(role);
                      setLoginPasswordInput("");
                      setLoginPasswordError(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white text-left transition-all cursor-pointer group shadow-2xs ${hoverBorder} hover:scale-[1.02]`}
                  >
                    <span className="text-xl shrink-0">{icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-slate-900">
                        {label}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                        <span>{role === "admin" ? "Admin" : role === "supervisor" ? "Lecture" : "Atelier"}</span>
                        <span className="font-bold text-chery-red opacity-0 group-hover:opacity-100 transition-opacity">Entrer →</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* 🏢 Building Anomaly Reporting Modal (Free Access) */}
        {showBuildingAnomalyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 relative overflow-hidden text-slate-900 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

              {buildingAnomalySuccess ? (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto text-3xl animate-bounce">
                    ✅
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">Anomalie Signalée avec Succès !</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Votre déclaration a été transmise instantanément au service Maintenance Bâtiment de la STA Chery Tunisie.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-blue-700 font-bold tracking-wider inline-block">
                      Ticket N° : {buildingAnomalySuccess}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Un technicien qualifié va intervenir dans les meilleurs délais pour résoudre le problème.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBuildingAnomalyModal(false);
                      setBuildingAnomalySuccess(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs cursor-pointer transition-colors shadow-md shadow-emerald-600/20"
                  >
                    Fermer et Retourner à l'Accueil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReportBuildingAnomaly} className="space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-wide">
                          Signaler une Anomalie Bâtiment
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Déclaration libre sans mot de passe pour tout le personnel STA
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBuildingAnomalyModal(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Category Selector Buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Type / Domaine de l'anomalie :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "⚡ Électricité & Éclairage", label: "⚡ Électricité", desc: "Prise, disjoncteur, panne d'élec" },
                        { id: "❄️ Climatisation & Chauffage", label: "❄️ Climatisation", desc: "Split, climatiseur, fuite, bruit" },
                        { id: "🚰 Plomberie & Sanitaires", label: "🚰 Plomberie", desc: "Fuite d'eau, lavabo, WC, pression" },
                        { id: "🚪 Serrurerie & Portes", label: "🚪 Serrurerie & Portes", desc: "Serrure, porte, rideau métallique" },
                        { id: "💡 Éclairage Ateliers/Showroom", label: "💡 Éclairage", desc: "Ampoules, projecteurs, néons" },
                        { id: "🧱 Structure & Infiltration", label: "🧱 Structure / Bâtiment", desc: "Fissure, peinture, faux-plafond" },
                        { id: "🛡️ Sécurité & Extincteurs", label: "🛡️ Sécurité & Incendie", desc: "Extincteur, alarme, accès" },
                        { id: "❓ Autre Problème Bâtiment", label: "❓ Autre Problème", desc: "Propreté, nuisances, divers" }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAnomalyCategory(cat.id)}
                          className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            anomalyCategory === cat.id
                              ? "bg-blue-50 border-blue-500 text-blue-900 shadow-xs font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div className="text-xs">{cat.label}</div>
                          <div className="text-[9px] text-slate-500 font-normal">{cat.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location / Zone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Zone / Localisation dans la concession STA :
                    </label>
                    <select
                      value={anomalyLocation}
                      onChange={(e) => setAnomalyLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                    >
                      <option value="Showroom Véhicules Neufs">🏢 Showroom Véhicules Neufs Chery</option>
                      <option value="Réception Après-Vente">📋 Réception Après-Vente / Accueil</option>
                      <option value="Atelier Service Rapide">⚡ Atelier Service Rapide</option>
                      <option value="Atelier Mécanique / Électricité">⚙️ Atelier Mécanique / Électricité</option>
                      <option value="Atelier Diagnostic">🔬 Atelier Diagnostic</option>
                      <option value="Atelier Carrosserie / Peinture">🎨 Atelier Carrosserie / Peinture</option>
                      <option value="Atelier Lavage">🧼 Atelier Lavage</option>
                      <option value="Bureaux Administratifs / Direction">💼 Bureaux Administratifs & Direction</option>
                      <option value="Sanitaires & Salles d'eau">🚰 Sanitaires & Salles d'eau</option>
                      <option value="Parking & Extérieur">🚗 Parking & Abords Extérieurs</option>
                    </select>
                  </div>

                  {/* Symptom Description */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Description précise du problème constaté * :
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Exemple : Le climatiseur du bureau réception fuit sur le sol / La prise 380V de la baie 2 disjoncte..."
                      value={anomalyDesc}
                      onChange={(e) => setAnomalyDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Reporter Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Votre Nom & Prénom * :
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Mohamed Ben Ali"
                        value={anomalyReporter}
                        onChange={(e) => setAnomalyReporter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Téléphone / Poste interne :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Poste 102 / Tél 98..."
                        value={anomalyPhone}
                        onChange={(e) => setAnomalyPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Niveau d'Urgence :
                    </label>
                    <select
                      value={anomalyPriority}
                      onChange={(e) => setAnomalyPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                    >
                      <option value="Faible">🟢 Normal (Gêne mineure, à traiter sous 48h)</option>
                      <option value="Moyenne">🟡 Moyen (Dysfonctionnement gênant le travail)</option>
                      <option value="Haute">🟠 Important (Empêche l'utilisation de la zone)</option>
                      <option value="Critique">🔴 Urgent / Critique (Fuite active, coupure générale, sécurité)</option>
                    </select>
                  </div>

                  {/* Photo Attachment / Capture */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="h-4 w-4 text-blue-600" />
                        <span>Photo / Preuve visuelle de l'anomalie (Optionnel) :</span>
                      </span>
                      {anomalyPhotos.length > 0 && (
                        <span className="text-[10px] text-blue-600 font-bold">
                          {anomalyPhotos.length} photo(s)
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl cursor-pointer transition-colors shadow-2xs">
                        <ImageIcon className="h-4 w-4 text-blue-600" />
                        <span>Prendre / Joindre Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            (Array.from(files) as File[]).forEach((file) => {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setAnomalyPhotos((prev) => [...prev, ev.target!.result as string]);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                            e.target.value = "";
                          }}
                        />
                      </label>

                      {anomalyPhotos.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                          {anomalyPhotos.map((img, idx) => (
                            <div
                              key={idx}
                              onClick={() => setLightboxState({
                                isOpen: true,
                                images: anomalyPhotos,
                                initialIndex: idx,
                                title: `Anomalie Bâtiment - Photo ${idx + 1}`
                              })}
                              className="relative group h-11 w-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs shrink-0 cursor-pointer"
                              title="Cliquer pour agrandir et zoomer la photo"
                            >
                              <img src={img} alt={`Anomalie ${idx}`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200" />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="h-3.5 w-3.5 text-white drop-shadow-xs" />
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAnomalyPhotos((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-md cursor-pointer transition-transform hover:scale-110 z-10"
                                title="Supprimer la photo"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBuildingAnomalyModal(false);
                        setAnomalyPhotos([]);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-2xl cursor-pointer transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-2xl cursor-pointer transition-colors shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5"
                    >
                      <Building className="h-4 w-4" />
                      <span>Envoyer le Ticket</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Interactive PIN Entry Modal */}
        {loginPendingRole && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full p-7 space-y-5 relative overflow-hidden text-slate-900">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-red-500 via-chery-red to-red-700"></div>
              
              <div className="text-center space-y-1.5">
                <span className="text-4xl block mb-1">🔐</span>
                <h3 className="text-lg font-black text-slate-900 tracking-wide">
                  Code d'Accès Requis
                </h3>
                <p className="text-[11px] text-slate-500">
                  Veuillez renseigner le code PIN d'atelier pour :
                </p>
                <p className="text-xs font-mono font-bold text-slate-800 bg-slate-100 py-2 px-3 rounded-xl border border-slate-200 inline-block mt-1">
                  {ROLE_LABELS[loginPendingRole]}
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="password"
                  autoFocus
                  maxLength={4}
                  placeholder="••••"
                  value={loginPasswordInput}
                  onChange={(e) => {
                    setLoginPasswordInput(e.target.value);
                    setLoginPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLoginVerifyPassword();
                  }}
                  className="w-full text-center tracking-[0.75em] text-2xl font-black font-mono border border-slate-300 rounded-2xl p-3 bg-slate-50 text-slate-900 outline-none focus:border-chery-red focus:bg-white focus:ring-2 focus:ring-chery-red/20 transition-all"
                />
                {loginPasswordError && (
                  <p className="text-[11px] text-red-600 font-bold text-center animate-bounce">
                    ⚠️ Code PIN d'atelier incorrect !
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginPendingRole(null);
                    setLoginPasswordInput("");
                    setLoginPasswordError(false);
                    setShowHelperCodes(false);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl cursor-pointer transition-all active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleLoginVerifyPassword}
                  className="flex-1 bg-chery-red hover:bg-red-700 text-white text-xs font-semibold py-3 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-red-600/25"
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Corporate Footer */}
        <footer className="border-t border-slate-200/80 py-4 text-center text-[10px] text-slate-400 shrink-0 bg-white z-10">
          <p className="font-bold tracking-wider">
            PORTAIL GMAO HAUTE PERFORMANCE • CONCESSIONNAIRE STA TUNISIE © 2026
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen chery-app-wrapper text-neutral-800 flex flex-col antialiased">
      {/* Top corporate header branding - Chery Titanium & Red signature */}
      <header className="chery-header-bar shrink-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 text-neutral-200 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Official STA Chery Logo */}
            <div className="flex items-center gap-3 select-none">
              <div className="bg-white px-3 py-1 rounded-xl shadow-md border border-slate-200 flex items-center">
                <CheryStaLogo className="h-7 w-auto" />
              </div>
              <div className="hidden lg:block border-l border-white/20 pl-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs tracking-tight text-white block leading-tight">
                    STA TUNISIE
                  </span>
                  <span className="bg-red-600/90 text-white font-mono text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-red-500/50 shadow-xs">
                    v1.0
                  </span>
                </div>
                <span className="text-[9px] text-red-300 font-bold tracking-wider block uppercase -mt-0.5">
                  Concessionnaire Officiel Chery
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSaveToDisk}
            title={neonStatus?.connected ? "Synchronisation automatique active avec Neon PostgreSQL et sauvegarde locale" : "Cliquer pour forcer la sauvegarde instantanée"}
            className="hidden md:flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-700/80 transition-all cursor-pointer group active:scale-95 shadow-xs whitespace-nowrap shrink-0"
          >
            {diskSyncStatus === "syncing" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shrink-0"></span>
                <span className="text-xs font-bold text-neutral-200 font-mono flex items-center gap-1.5">
                  🔄 Enregistrement...
                </span>
              </>
            ) : diskSyncStatus === "error" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                <span className="text-xs font-bold text-amber-300 font-mono group-hover:text-amber-200 flex items-center gap-1.5">
                  ⚠️ Réessayer la Sauvegarde
                </span>
              </>
            ) : neonStatus?.connected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-subtle shrink-0"></span>
                <span className="text-xs font-bold text-emerald-300 font-mono group-hover:text-white flex items-center gap-1.5">
                  🐘 Neon Synced • Enregistrer
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-subtle shrink-0"></span>
                <span className="text-xs font-bold text-emerald-300 font-mono group-hover:text-white flex items-center gap-1.5">
                  💾 Sauvegardé • Enregistrer
                </span>
              </>
            )}
          </button>

          {/* Global Quick Search (⌘K / Ctrl+K) button */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            title="Recherche globale rapide (Raccourci ⌘K ou Ctrl+K)"
            className="hidden sm:flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/80 transition-all cursor-pointer text-xs font-medium shadow-xs"
          >
            <Search className="h-3.5 w-3.5 text-red-400 shrink-0" />
            <span className="hidden lg:inline text-slate-300">Recherche rapide...</span>
            <span className="text-[10px] font-mono bg-slate-900/90 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 ml-0.5">
              ⌘K
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            title="Recherche globale"
            className="sm:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 cursor-pointer"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Dynamic Role Switcher dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={currentUserRole}
                onChange={(e) => {
                  const role = e.target.value;
                  setPendingRole(role);
                  setPasswordInput("");
                  setPasswordError(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl border border-slate-700 outline-none cursor-pointer shadow-xs transition-all"
              >
                <option value="admin" className="bg-slate-900 text-white">🔑 Admin: M. Ahmed Amine</option>
                <option value="supervisor" className="bg-slate-900 text-white">👁️ Superviseur (Lecture seule)</option>
                <option value="service_rapide" className="bg-slate-900 text-white">⚡ Atelier Service Rapide</option>
                <option value="atelier_mecanique" className="bg-slate-900 text-white">⚙️ Atelier Mécanique / élec</option>
                <option value="atelier_diagnostic" className="bg-slate-900 text-white">🔬 Atelier Diagnostic</option>
                <option value="carrosserie" className="bg-slate-900 text-white">🎨 Atelier Carrosserie</option>
                <option value="lavage" className="bg-slate-900 text-white">🧼 Atelier Lavage</option>
                <option value="batiment" className="bg-slate-900 text-white">🏢 Maintenance Bâtiment</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 ml-1 pl-2 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs text-white block leading-tight">
                  {currentUserRole === "admin" 
                    ? "M. Ahmed Amine" 
                    : currentUserRole === "supervisor" 
                    ? "Superviseur STA" 
                    : "Chef d'Atelier"}
                </span>
                <span className="text-[9px] text-red-300 font-bold uppercase block tracking-wider">
                  {currentUserRole === "admin" 
                    ? "Admin Maintenance" 
                    : currentUserRole === "supervisor" 
                    ? "Lecture Totale" 
                    : "Accès Atelier"}
                </span>
              </div>
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-white font-bold text-xs shadow-inner ${
                currentUserRole === "admin" 
                  ? "bg-chery-red border-red-500 shadow-glow-red" 
                  : currentUserRole === "supervisor" 
                  ? "bg-amber-600 border-amber-500" 
                  : "bg-blue-600 border-blue-500"
              }`}>
                {currentUserRole === "admin" ? "AA" : currentUserRole === "supervisor" ? "SV" : "OP"}
              </div>
            </div>

            {/* 🚨 Quick Alerte Panne header action */}
            <button
              type="button"
              onClick={() => setShowGlobalAlertModal(true)}
              title="Signaler d'urgence un équipement en panne"
              className="bg-red-600 hover:bg-red-700 hover:scale-102 border border-red-500 text-white px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-[10px] font-black shadow-xs shadow-red-500/10 active:scale-95 ml-1"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>ALERTE PANNE</span>
            </button>

            {/* 🏢 Quick Anomalie Bâtiment header action */}
            <button
              type="button"
              onClick={() => {
                setShowBuildingAnomalyModal(true);
                setBuildingAnomalySuccess(null);
              }}
              title="Signaler une anomalie bâtiment (Électricité, Climatisation, Plomberie...)"
              className="bg-blue-600 hover:bg-blue-700 hover:scale-102 border border-blue-500 text-white px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-[10px] font-black shadow-xs shadow-blue-500/10 active:scale-95 ml-1"
            >
              <Building className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">ANOMALIE BÂTIMENT</span>
              <span className="lg:hidden">BÂTIMENT</span>
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem("chery_gmao_authenticated");
                setLoginPendingRole(null);
                setLoginPasswordInput("");
                setLoginPasswordError(false);
              }}
              title="Se déconnecter (Verrouiller la session)"
              className="ml-1 bg-red-50 hover:bg-red-100 border border-red-100 text-chery-red p-2 rounded-xl cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6 relative">
        
        {/* Navigation Sidebar (Desktop version) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 pb-2 block border-b border-neutral-100 mb-2">
              Menu Principal GMAO
            </span>

            {/* 🏠 Tableau de Bord */}
            <button
              onClick={() => {
                setActiveTab("dashboard");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" />
                <span>🏠 Tableau de Bord</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "dashboard" ? "opacity-100" : ""}`} />
            </button>

            {/* 🏭 Parc Équipements Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setParcOpen(!parcOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "equipements"
                    ? "bg-neutral-100 text-neutral-800"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-4 w-4 text-neutral-500" />
                  <span>🏭 Parc Équipements</span>
                </div>
                {parcOpen ? <ChevronDown className="h-3.5 w-3.5 text-neutral-500" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />}
              </button>
              
              {parcOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l border-neutral-100 ml-4">
                  {[
                    { id: "All", label: "Tous les Équipements" },
                    { id: "Service Rapide", label: "Service Rapide" },
                    { id: "Atelier Mécanique", label: "Atelier Mécanique / élec" },
                    { id: "Atelier Diagnostic", label: "Atelier Diagnostic" },
                    { id: "Carrosserie", label: "Carrosserie" },
                    { id: "Lavage", label: "Lavage" },
                    { id: "Maintenance Bâtiment", label: "Bâtiment & Showroom" }
                  ].map((sub) => {
                    const isSelected = activeTab === "equipements" && selectedWorkshopFilter === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab("equipements");
                          setSelectedWorkshopFilter(sub.id);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer block ${
                          isSelected
                            ? "bg-neutral-800 text-white font-bold shadow-xs"
                            : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                        }`}
                      >
                        • {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 📋 Interventions & Maintenance Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setMaintenanceOpen(!maintenanceOpen);
                  if (activeTab !== "interventions" && activeTab !== "maintenance") {
                    setActiveTab("interventions");
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "interventions" || activeTab === "maintenance"
                    ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4" />
                  <span>📋 Interventions & Maintenance</span>
                </div>
                {maintenanceOpen ? <ChevronDown className="h-3.5 w-3.5 text-current" /> : <ChevronRight className="h-3.5 w-3.5 text-current opacity-60" />}
              </button>
              
              {maintenanceOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l border-neutral-100 ml-4 animate-fade-in">
                  {[
                    { id: "all", label: "Toutes les Interventions", type: "All", status: "All", calendar: false, isInterventionsTab: true },
                    { id: "preventive", label: "Maintenance Préventive", type: "Préventif", status: "All", calendar: false, isInterventionsTab: false },
                    { id: "corrective", label: "Maintenance Corrective", type: "Correctif", status: "All", calendar: false, isInterventionsTab: false },
                    { id: "planning", label: "Planning de Travaux", type: "All", status: "Planifié", calendar: false, isInterventionsTab: false },
                    { id: "calendrier", label: "Vue Calendrier", type: "All", status: "All", calendar: true, isInterventionsTab: false }
                  ].map((sub) => {
                    const isSelected = sub.isInterventionsTab
                      ? (activeTab === "interventions")
                      : (activeTab === "maintenance" &&
                        (sub.calendar
                          ? showMaintenanceCalendar
                          : selectedMaintenanceType === sub.type && selectedMaintenanceStatus === sub.status && !showMaintenanceCalendar));
                    
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (sub.isInterventionsTab) {
                            setActiveTab("interventions");
                          } else {
                            setActiveTab("maintenance");
                            setSelectedMaintenanceType(sub.type);
                            setSelectedMaintenanceStatus(sub.status);
                            setShowMaintenanceCalendar(sub.calendar);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer block ${
                          isSelected
                            ? "bg-neutral-800 text-white font-bold shadow-xs"
                            : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                        }`}
                      >
                        • {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 📌 Projets & Investissements */}
            {canAccessProjetsAndAmelioration && (
              <button
                onClick={() => {
                  setActiveTab("projets");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "projets"
                    ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="h-4 w-4" />
                  <span>📌 Projets & Chantier</span>
                </div>
                <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "projets" ? "opacity-100" : ""}`} />
              </button>
            )}

            {/* 🌱 Amélioration Continue */}
            {canAccessProjetsAndAmelioration && (
              <button
                onClick={() => {
                  setActiveTab("amelioration");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "amelioration"
                    ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4" />
                  <span>🌱 Amélioration Continue</span>
                </div>
                <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "amelioration" ? "opacity-100" : ""}`} />
              </button>
            )}

            {/* 📚 Centre Documentaire */}
            <button
              onClick={() => {
                setActiveTab("documentation");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "documentation"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4" />
                <span>📚 Centre Documentaire</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "documentation" ? "opacity-100" : ""}`} />
            </button>

            {/* 🛒 Achats */}
            <button
              onClick={() => {
                setActiveTab("achats");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "achats"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="h-4 w-4" />
                <span>🛒 Achats</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "achats" ? "opacity-100" : ""}`} />
            </button>

            {/* 📑 Contrats & Conformité */}
            <button
              onClick={() => {
                setActiveTab("contracts");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "contracts"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4" />
                <span>📑 Contrats & Conformité</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "contracts" ? "opacity-100" : ""}`} />
            </button>

            {/* 📜 Journal d'Audit (Administrateur Uniquement) */}
            {currentUserRole === "admin" && (
              <button
                onClick={() => {
                  setActiveTab("logs");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className="h-4 w-4" />
                  <span>📜 Journal d'Audit</span>
                </div>
                <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "logs" ? "opacity-100" : ""}`} />
              </button>
            )}

            {/* ⚙️ Paramètres / Administration */}
            <button
              onClick={() => {
                setActiveTab("settings");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4" />
                <span>🛠️ Administration</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "settings" ? "opacity-100" : ""}`} />
            </button>
          </div>

          {/* 🚨 Quick Breakdown Reporter Card for Technicians */}
          <div className="bg-red-50/70 border border-red-200/60 rounded-2xl p-4 text-center space-y-3 shadow-xs">
            <div className="flex justify-center">
              <div className="p-2 bg-red-100 rounded-full text-chery-red animate-pulse">
                <AlertOctagon className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-neutral-800">Panne en Atelier ?</h4>
              <p className="text-[10px] text-neutral-500 leading-tight">
                Déclarez immédiatement un dysfonctionnement pour alerter l'équipe technique.
              </p>
            </div>
            <button
              onClick={() => setShowGlobalAlertModal(true)}
              className="w-full bg-chery-red hover:bg-chery-dark text-white text-[11px] font-black py-2.5 px-3 rounded-xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              Signaler une Panne
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-neutral-900/40 backdrop-blur-xs">
            <div className="bg-white w-64 max-w-sm h-full p-5 flex flex-col justify-between shadow-2xl relative animate-fade-in-left overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-2 select-none">
                    <div className="bg-chery-red text-white text-[10px] font-black px-2 py-1 rounded-md tracking-wider flex items-center justify-center shadow-xs">
                      STA
                    </div>
                    <span className="font-sans font-black text-base tracking-wide text-neutral-800">
                      CHERY
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {[
                    { id: "dashboard", label: "🏠 Tableau de Bord", icon: LayoutDashboard },
                    { id: "equipements", label: "🏭 Parc Équipements", icon: Wrench },
                    { id: "interventions", label: "📋 Interventions & Maintenance", icon: FileText },
                    ...(canAccessProjetsAndAmelioration
                      ? [
                          { id: "projets", label: "📌 Projets & Chantier", icon: FolderKanban },
                          { id: "amelioration", label: "🌱 Amélioration Continue", icon: Sparkles }
                        ]
                      : []),
                    { id: "documentation", label: "📚 Centre Documentaire", icon: FileText },
                    { id: "achats", label: "🛒 Achats", icon: ShoppingCart },
                    { id: "contracts", label: "📑 Contrats & Conformité", icon: ShieldCheck },
                    ...(currentUserRole === "admin" ? [{ id: "logs", label: "📜 Journal d'Audit", icon: History }] : []),
                    { id: "settings", label: "🛠️ Administration", icon: Settings }
                  ].map((tab) => {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? "bg-chery-red text-white"
                            : "text-neutral-500 hover:bg-neutral-50"
                        }`}
                      >
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 🚨 Quick Mobile Breakdown Alert button */}
                <div className="pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowGlobalAlertModal(true);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black py-3 px-4 rounded-xl shadow-md shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4 animate-pulse" />
                    Signaler une Panne
                  </button>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <div className="text-[10px] text-neutral-400 text-center">
                  GMAO STA Chery Tunisie © 2026
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Primary Viewport Content */}
        <main className="flex-1 min-w-0">
          {activeTab === "dashboard" && (
            <GmaoDashboard
              equipments={equipments}
              interventions={interventions}
              spareParts={spareParts}
              compliance={compliance}
              budget={budget}
              purchaseRequests={purchaseRequests}
              contracts={contracts}
              vendors={vendors}
              onNavigate={(tab) => {
                const normalized = tab.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                let targetTab = tab;
                if (normalized.includes("intervention") || normalized.includes("maintenance")) {
                  targetTab = "interventions";
                } else if (normalized.includes("equipement")) {
                  setSelectedWorkshopFilter("All");
                  targetTab = "equipements";
                }
                setActiveTab(targetTab);
              }}
              onResetDemoData={handleResetDemoData}
              onUpdateBudgetAllocation={handleUpdateBudgetAllocation}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === "equipements" && (
            <EquipmentsManager
              equipments={equipments}
              interventions={interventions}
              onAddEquipment={handleAddEquipment}
              onUpdateStatus={handleUpdateEquipmentStatus}
              onUpdateEquipment={handleUpdateEquipment}
              onDeleteEquipment={handleDeleteEquipment}
              onAddIntervention={handleAddIntervention}
              initialWorkshop={selectedWorkshopFilter}
              isReadOnly={isEquipmentsReadOnly}
              allowedWorkshop={allowedWorkshop}
              onResetDemoData={handleResetDemoData}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === "maintenance" && (
            <InterventionsManager
              interventions={interventions}
              equipments={equipments}
              spareParts={spareParts}
              onAddIntervention={handleAddIntervention}
              onUpdateInterventionStatus={handleUpdateInterventionStatus}
              onUpdateIntervention={handleUpdateIntervention}
              initialType={selectedMaintenanceType}
              initialStatus={selectedMaintenanceStatus}
              showCalendarByDefault={showMaintenanceCalendar}
              isReadOnly={isEquipmentsReadOnly}
              allowedWorkshop={allowedWorkshop}
            />
          )}

          {activeTab === "interventions" && (
            <InterventionsManager
              interventions={interventions}
              equipments={equipments}
              spareParts={spareParts}
              onAddIntervention={handleAddIntervention}
              onUpdateInterventionStatus={handleUpdateInterventionStatus}
              onUpdateIntervention={handleUpdateIntervention}
              initialType="All"
              initialStatus="All"
              showCalendarByDefault={false}
              isReadOnly={isEquipmentsReadOnly}
              allowedWorkshop={allowedWorkshop}
            />
          )}

          {activeTab === "projets" && canAccessProjetsAndAmelioration && (
            <ProjectsManager
              projects={projects}
              audits5s={audits5s}
              leanItems={leanItems}
              safetyRecords={safetyRecords}
              qualityRecords={qualityRecords}
              environmentLogs={environmentLogs}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              isReadOnly={isEquipmentsReadOnly}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === "amelioration" && canAccessProjetsAndAmelioration && (
            <ContinuousImprovementManager
              projects={projects}
              audits5s={audits5s}
              leanItems={leanItems}
              safetyRecords={safetyRecords}
              qualityRecords={qualityRecords}
              environmentLogs={environmentLogs}
              onAddAudit5S={handleAddAudit5S}
              onUpdateAudit5S={handleUpdateAudit5S}
              onDeleteAudit5S={handleDeleteAudit5S}
              onAddLeanItem={handleAddLeanItem}
              onUpdateLeanItem={handleUpdateLeanItem}
              onDeleteLeanItem={handleDeleteLeanItem}
              onAddSafetyRecord={handleAddSafetyRecord}
              onUpdateSafetyRecord={handleUpdateSafetyRecord}
              onDeleteSafetyRecord={handleDeleteSafetyRecord}
              onAddQualityRecord={handleAddQualityRecord}
              onUpdateQualityRecord={handleUpdateQualityRecord}
              onDeleteQualityRecord={handleDeleteQualityRecord}
              onAddEnvironmentLog={handleAddEnvironmentLog}
              onUpdateEnvironmentLog={handleUpdateEnvironmentLog}
              onDeleteEnvironmentLog={handleDeleteEnvironmentLog}
              isReadOnly={isEquipmentsReadOnly}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === "documentation" && (
            <DocumentationManager
              equipments={equipments}
              isReadOnly={isEquipmentsReadOnly}
              currentUserRole={currentUserRole}
              allowedWorkshop={allowedWorkshop}
            />
          )}

          {activeTab === "achats" && (
            <PurchasesManager
              purchaseRequests={purchaseRequests}
              vendors={vendors}
              equipments={equipments}
              onAddPurchaseRequest={handleAddPurchaseRequest}
              onUpdatePurchaseRequestStatus={handleUpdatePurchaseRequestStatus}
              onUpdatePurchaseRequest={handleUpdatePurchaseRequest}
              onDeletePurchaseRequest={handleDeletePurchaseRequest}
              onAddVendor={handleAddVendor}
              isReadOnly={isPurchasesReadOnly}
              currentRole={currentUserRole}
              allowedWorkshop={allowedWorkshop}
            />
          )}

          {activeTab === "contracts" && (
            <ContractsManager
              vendors={vendors}
              contracts={contracts}
              compliance={compliance}
              equipments={equipments}
              onAddComplianceCheck={handleAddComplianceCheck}
              onAddContract={handleAddContract}
              onUpdateContract={handleUpdateContract}
              onDeleteContract={handleDeleteContract}
              currentRole={currentUserRole}
              allowedWorkshop={allowedWorkshop}
            />
          )}

          {activeTab === "settings" && (
            <SettingsManager
              budget={budget}
              onUpdateBudgetAllocation={handleUpdateBudgetAllocation}
              equipments={equipments}
              interventions={interventions}
              spareParts={spareParts}
              vendors={vendors}
              purchaseRequests={purchaseRequests}
              compliance={compliance}
              onImportAllData={handleImportAllData}
              isReadOnly={isSettingsReadOnly}
              currentRole={currentUserRole}
              passwords={passwords}
              onUpdatePasswords={setPasswords}
              dbMode={dbMode}
              onResetDemoData={handleResetDemoData}
              onClearAllData={handleClearAllData}
              activityLogs={activityLogs}
              onClearLogs={handleClearActivityLogs}
              onAddVendor={handleAddVendor}
              onUpdateVendor={handleUpdateVendor}
              onDeleteVendor={handleDeleteVendor}
              userProfiles={userProfiles}
              onAddRoleProfile={handleAddRoleProfile}
              onUpdateRoleProfile={handleUpdateRoleProfile}
              onDeleteRoleProfile={handleDeleteRoleProfile}
              showToast={showToast}
              neonStatus={neonStatus}
              onCheckNeonStatus={handleCheckNeonStatus}
              onSyncToNeon={handleSyncToNeon}
              onLoadFromNeon={handleLoadFromNeon}
            />
          )}

          {currentUserRole === "admin" && activeTab === "logs" && (
            <AuditLogs 
              logs={activityLogs} 
              onClearLogs={handleClearActivityLogs} 
              currentUserRole={currentUserRole} 
            />
          )}
        </main>
      </div>

      {/* Database Reset/Clear Confirmation Modal */}
      {resetConfirmType && (
        <div className="fixed inset-0 bg-neutral-900/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <span className="text-4xl">
                {resetConfirmType === "reset" ? "🔄" : "⚠️"}
              </span>
              <h3 className="text-base font-bold text-neutral-800">
                {resetConfirmType === "reset"
                  ? "Charger les Équipements et Demandes du Fichier STA Chery"
                  : "Effacer Complètement la Base de Données"}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {resetConfirmType === "reset"
                  ? "Êtes-vous sûr de vouloir charger les données réelles ? Cela peuplera la GMAO avec le parc complet d'équipements de la STA Chery Tunisie (ponts élévateurs, cabine de peinture, compresseurs, etc.) et les demandes d'achats extraites de votre fichier d'origine."
                  : "Êtes-vous sûr de vouloir vider la base de données ? Tous vos équipements, pièces de rechange, fournisseurs, demandes d'achats et interventions seront effacés localement. Vous obtiendrez un espace de travail vierge."}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmType(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resetConfirmType === "reset") {
                    executeResetDemoData();
                  } else {
                    executeClearAllData();
                  }
                }}
                className={`flex-1 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors ${
                  resetConfirmType === "reset"
                    ? "bg-chery-red hover:bg-chery-dark"
                    : "bg-neutral-800 hover:bg-neutral-900"
                }`}
              >
                {resetConfirmType === "reset" ? "Confirmer la Restauration" : "Confirmer l'Effacement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Authentication Modal */}
      {pendingRole && (
        <div className="fixed inset-0 bg-neutral-900/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-3xl">🔑</span>
              <h3 className="text-base font-bold text-neutral-800">
                Authentification de Sécurité
              </h3>
              <p className="text-xs text-neutral-400">
                Veuillez saisir le mot de passe pour accéder au profil :
              </p>
              <p className="text-xs font-bold text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                {ROLE_LABELS[pendingRole] || pendingRole}
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                autoFocus
                placeholder="Saisir le code / PIN"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerifyPassword();
                }}
                className="w-full text-center tracking-widest text-lg font-bold font-mono border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 outline-none focus:ring-2 focus:ring-chery-red"
              />
              {passwordError && (
                <p className="text-[11px] text-chery-red font-bold text-center">
                  ❌ Mot de passe incorrect
                </p>
              )}
            </div>



            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPendingRole(null);
                  setPasswordInput("");
                  setPasswordError(false);
                  setShowHelperCodes(false);
                }}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleVerifyPassword}
                className="flex-1 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 Global Breakdown Alert Reporting Modal */}
      {showGlobalAlertModal && (
        <div className="fixed inset-0 bg-neutral-900/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex items-start gap-4 pb-3 border-b border-neutral-100">
              <div className="p-3 bg-red-100 rounded-2xl text-chery-red shrink-0 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-neutral-800">
                  🚨 Signaler une Panne en Atelier
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Cette alerte va marquer immédiatement l'équipement comme <strong>"En Panne"</strong> et générer un ticket d'intervention curative d'urgence (type Correctif).
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGlobalAlertSubmit} className="space-y-4">
              
              {/* Workshop Filter & Equipment Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-neutral-600">
                    Atelier Émetteur :
                  </label>
                  <select
                    value={alertSelectedWorkshop}
                    onChange={(e) => {
                      const ws = e.target.value;
                      setAlertSelectedWorkshop(ws);
                      const filtered = ws === "All" ? equipments : equipments.filter((eq) => eq.workshop === ws);
                      if (filtered.length > 0) {
                        setAlertEqCode(filtered[0].code);
                      } else {
                        setAlertEqCode("");
                      }
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-chery-red cursor-pointer"
                  >
                    <option value="All">⚠️ Tous les Ateliers</option>
                    {WORKSHOPS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-neutral-600">
                    Équipement en panne :
                  </label>
                  <select
                    value={alertEqCode}
                    onChange={(e) => setAlertEqCode(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-chery-red cursor-pointer"
                  >
                    {equipments.length === 0 ? (
                      <option value="">-- Aucun équipement (Base vierge) --</option>
                    ) : (() => {
                      const filtered = alertSelectedWorkshop === "All"
                        ? equipments
                        : equipments.filter((eq) => eq.workshop === alertSelectedWorkshop);
                      if (filtered.length === 0) {
                        return <option value="">-- Aucun équipement dans cet atelier --</option>;
                      }
                      return filtered.map((eq) => (
                        <option key={eq.code} value={eq.code}>
                          [{eq.code}] {eq.name}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <p className="text-[10px] text-neutral-400">
                💡 Sélectionnez d'abord l'Atelier pour restreindre instantanément la liste des appareils et trouver plus facilement l'équipement en panne. Le code d'équipement correspond précisément à sa plaque d'identification.
              </p>

              {/* Symptom title */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-neutral-600">
                  Symptôme de Panne / Constat (court) :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Moteur chauffe anormalement, Vérin bloqué, Fuite d'air..."
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-chery-red"
                />
              </div>

              {/* Detailed symptoms description */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-neutral-600">
                  Description détaillée du dysfonctionnement (Optionnel) :
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez précisément ce qui s'est produit ou les bruits/symptômes observés pour aider le diagnostic..."
                  value={alertDesc}
                  onChange={(e) => setAlertDesc(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-chery-red resize-none"
                />
              </div>

              {/* Technician & Priority side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-neutral-600">
                    Déclaré par (Technicien / Chef) :
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nom du technicien"
                    value={alertTech}
                    onChange={(e) => setAlertTech(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-chery-red"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-black text-neutral-600">
                    Niveau de Criticité / Urgence :
                  </label>
                  <select
                    value={alertPriority}
                    onChange={(e) => setAlertPriority(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-chery-red cursor-pointer"
                  >
                    <option value="Faible">🟢 Faible (Dégradé mais utilisable)</option>
                    <option value="Moyenne">🟡 Moyenne (Ralentissement de production)</option>
                    <option value="Haute">🟠 Haute (Arrêt immédiat de la machine)</option>
                    <option value="Critique">🔴 Critique (Grave incident / Sécurité)</option>
                  </select>
                </div>
              </div>

              {/* Photo Attachment / Capture */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-neutral-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-chery-red" />
                    <span>Photo de la panne / Dégât constaté (Optionnel) :</span>
                  </span>
                  {alertPhotos.length > 0 && (
                    <span className="text-[10px] text-chery-red font-bold">
                      {alertPhotos.length} photo(s)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 border border-dashed border-neutral-300 text-neutral-700 hover:text-black font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors shadow-xs">
                    <ImageIcon className="h-4 w-4 text-chery-red" />
                    <span>Prendre / Choisir Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        (Array.from(files) as File[]).forEach((file) => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setAlertPhotos((prev) => [...prev, ev.target!.result as string]);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {alertPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {alertPhotos.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxState({
                            isOpen: true,
                            images: alertPhotos,
                            initialIndex: idx,
                            title: `Panne & Dégât - Photo ${idx + 1}`
                          })}
                          className="relative group h-12 w-16 rounded-lg overflow-hidden border border-neutral-300 bg-black/5 shadow-xs shrink-0 cursor-pointer"
                          title="Cliquer pour agrandir et zoomer la photo"
                        >
                          <img src={img} alt={`Panne ${idx}`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="h-3.5 w-3.5 text-white drop-shadow-sm" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAlertPhotos((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-md cursor-pointer transition-transform hover:scale-110 z-10"
                            title="Supprimer la photo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowGlobalAlertModal(false);
                    setAlertTitle("");
                    setAlertDesc("");
                    setAlertPhotos([]);
                  }}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold py-3 rounded-xl cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={equipments.length === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-xs font-black py-3 rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/15 flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Envoyer l'Alerte de Panne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 Global Command Palette Modal */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        equipments={equipments}
        interventions={interventions}
        purchaseRequests={purchaseRequests}
        vendors={vendors}
        contracts={contracts}
        currentUserRole={currentUserRole}
        onSelectTab={(tab) => {
          const normalized = tab.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let targetTab = tab;
          if (normalized.includes("intervention") || normalized.includes("maintenance")) {
            targetTab = "interventions";
          } else if (normalized.includes("equipement")) {
            setSelectedWorkshopFilter("All");
            targetTab = "equipements";
          }
          setActiveTab(targetTab);
          showToast(`Navigation vers ${tab}`, "info");
        }}
      />

      {/* 💻 Pro Developer Console Modal */}
      <DeveloperConsoleModal
        isOpen={devConsoleOpen}
        onClose={() => setDevConsoleOpen(false)}
        currentUserRole={currentUserRole}
        onSwitchRoleQuick={(role) => {
          setCurrentUserRole(role);
          localStorage.setItem("chery_gmao_user_role", role);
        }}
        activityLogs={activityLogs}
        showToast={showToast}
        handleManualSaveToDisk={handleManualSaveToDisk}
        equipmentsCount={equipments.length}
        interventionsCount={interventions.length}
        sparePartsCount={spareParts.length}
        purchaseRequestsCount={purchaseRequests.length}
        contractsCount={contracts.length}
      />

      {/* 📧 Email Alert Floating Toast */}
      {emailAlertToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-neutral-900 text-white p-4 rounded-2xl shadow-2xl border border-red-500/50 animate-bounce-short flex items-start gap-3">
          <div className="p-2.5 bg-red-600/20 rounded-xl text-red-500 shrink-0">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-1 text-xs flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-red-400 uppercase tracking-wider text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">
                📧 EMAIL D'ALERTE ENVOYÉ
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {new Date(emailAlertToast.sentAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="font-bold text-white text-xs leading-tight">
              {emailAlertToast.subject}
            </p>
            <p className="text-[11px] text-amber-300 font-mono font-semibold">
              Destinataire : {emailAlertToast.recipient}
            </p>
            <p className="text-[10px] text-neutral-300 bg-neutral-800 p-2 rounded-lg border border-neutral-700 mt-1 leading-relaxed">
              {emailAlertToast.message}
            </p>
          </div>
          <button
            onClick={() => setEmailAlertToast(null)}
            className="text-neutral-400 hover:text-white p-1 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 🔔 Global Toast Notification */}
      <ToastNotification
        message={toast?.message || null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Page Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-neutral-500">
            Portail de GMAO & Support Excel d'Ingénierie pour STA Tunisie
          </p>
          <p className="mt-1">
            Concessionnaire Officiel Chery en Tunisie. Conçu et développé par <strong>Ahmed Amine Ben Salah</strong>, Responsable Maintenance et Parc.
          </p>
          <p className="text-[10px] text-neutral-400 mt-2 font-mono">
            STA Tunisie • Version 1.0 (Release Officielle) • Ben Arous, Tunisie
          </p>
        </div>
      </footer>

      {/* 🖼️ High-Res Image Lightbox Modal */}
      {lightboxState && (
        <ImageLightboxModal
          isOpen={lightboxState.isOpen}
          onClose={() => setLightboxState(null)}
          images={lightboxState.images}
          initialIndex={lightboxState.initialIndex}
          title={lightboxState.title}
        />
      )}
    </div>
  );
}
