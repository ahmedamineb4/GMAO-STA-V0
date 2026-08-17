/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Settings,
  DollarSign,
  TrendingUp,
  Sliders,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Lock,
  UserCheck,
  Download,
  Upload,
  Trash2,
  Users,
  FileText,
  Phone,
  Mail,
  Plus,
  Search,
  Bell,
  History,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Send,
  Eye,
  Pencil,
  Edit3,
  UserPlus,
  X,
  Check,
  Star,
  Save,
  ChevronDown,
  ChevronUp,
  Server
} from "lucide-react";
import { BudgetYear, Workshop, Vendor, ActivityLog, UserRoleProfile } from "../types";
import { WORKSHOPS } from "../data";
import {
  sendEmailAlert,
  getStoredEmailAlerts,
  getStoredAlertEmailRecipient,
  setStoredAlertEmailRecipient,
  DEFAULT_ALERT_EMAIL_RECIPIENT,
  EmailAlert,
  getStoredSmtpConfig,
  setStoredSmtpConfig,
  SmtpConfig
} from "../utils/emailAlerts";

interface SettingsManagerProps {
  budget: BudgetYear;
  onUpdateBudgetAllocation: (workshop: Workshop, amount: number) => void;
  equipments: any[];
  interventions: any[];
  spareParts?: any[];
  vendors: Vendor[];
  purchaseRequests: any[];
  compliance: any[];
  onImportAllData: (data: any) => void;
  isReadOnly?: boolean;
  currentRole?: string;
  passwords?: Record<string, string>;
  onUpdatePasswords?: (newPasswords: Record<string, string>) => void;
  dbMode?: "demo" | "vierge";
  onResetDemoData?: () => void;
  onClearAllData?: () => void;
  activityLogs?: ActivityLog[];
  onClearLogs?: () => void;
  onAddVendor?: (newVendor: Vendor) => void;
  onUpdateVendor?: (updatedVendor: Vendor) => void;
  onDeleteVendor?: (vendorId: string) => void;
  userProfiles?: UserRoleProfile[];
  onAddRoleProfile?: (profile: UserRoleProfile) => void;
  onUpdateRoleProfile?: (profile: UserRoleProfile) => void;
  onDeleteRoleProfile?: (profileId: string) => void;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
  neonStatus?: {
    configured: boolean;
    connected: boolean;
    serverTime?: string;
    pgVersion?: string;
    databaseUrlMasked?: string;
    message?: string;
    error?: string;
    totalKeys?: number;
    storeSummary?: Record<string, { count: number; updatedAt?: string }>;
  } | null;
  onCheckNeonStatus?: () => Promise<any>;
  onSyncToNeon?: () => Promise<boolean>;
  onLoadFromNeon?: () => Promise<boolean>;
}

export default function SettingsManager({
  budget,
  onUpdateBudgetAllocation,
  equipments,
  interventions,
  spareParts,
  vendors = [],
  purchaseRequests,
  compliance,
  onImportAllData,
  isReadOnly = false,
  currentRole = "admin",
  passwords = {},
  onUpdatePasswords,
  dbMode = "demo",
  onResetDemoData,
  onClearAllData,
  activityLogs = [],
  onClearLogs,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  userProfiles = [],
  onAddRoleProfile,
  onUpdateRoleProfile,
  onDeleteRoleProfile,
  showToast,
  neonStatus,
  onCheckNeonStatus,
  onSyncToNeon,
  onLoadFromNeon
}: SettingsManagerProps) {
  const isAdmin = currentRole === "admin";
  const isWritable = !isReadOnly && isAdmin;

  // Active Sub-Tab State
  const [activeSubTab, setActiveSubTab] = useState<"parameters" | "database" | "users" | "docs" | "vendors" | "notifications" | "audit">("parameters");
  const [isTestingNeon, setIsTestingNeon] = useState<boolean>(false);
  const [isSyncingNeon, setIsSyncingNeon] = useState<boolean>(false);
  const [isLoadingNeon, setIsLoadingNeon] = useState<boolean>(false);
  const [neonTestResult, setNeonTestResult] = useState<any>(null);

  // Safety guard: redirect non-admin away from admin-only subtabs
  useEffect(() => {
    if (!isAdmin && (activeSubTab === "notifications" || activeSubTab === "users")) {
      setActiveSubTab("parameters");
    }
  }, [isAdmin, activeSubTab]);

  // General parameters states
  const [hourlyRate, setHourlyRate] = useState<number>(() => {
    const saved = localStorage.getItem("chery_gmao_hourly_rate");
    return saved ? Number(saved) : 60;
  });
  const [vatRate, setVatRate] = useState<number>(() => {
    const saved = localStorage.getItem("chery_gmao_vat_rate");
    return saved ? Number(saved) : 19;
  });
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem("chery_gmao_currency") || "TND";
  });

  // Editable Alert Email Recipient
  const [alertEmailInput, setAlertEmailInput] = useState<string>(getStoredAlertEmailRecipient());
  const [emailSavedSuccess, setEmailSavedSuccess] = useState<boolean>(false);

  // SMTP Configuration State
  const [showSmtpConfig, setShowSmtpConfig] = useState<boolean>(false);
  const [smtpHost, setSmtpHost] = useState<string>(() => getStoredSmtpConfig()?.host || "smtp.office365.com");
  const [smtpPort, setSmtpPort] = useState<number>(() => getStoredSmtpConfig()?.port || 587);
  const [smtpUser, setSmtpUser] = useState<string>(() => getStoredSmtpConfig()?.user || "");
  const [smtpPass, setSmtpPass] = useState<string>(() => getStoredSmtpConfig()?.pass || "");
  const [smtpFrom, setSmtpFrom] = useState<string>(() => getStoredSmtpConfig()?.from || "");
  const [smtpSavedSuccess, setSmtpSavedSuccess] = useState<boolean>(false);
  const [isTestingEmail, setIsTestingEmail] = useState<boolean>(false);

  // Save general parameters locally
  useEffect(() => {
    localStorage.setItem("chery_gmao_hourly_rate", String(hourlyRate));
    localStorage.setItem("chery_gmao_vat_rate", String(vatRate));
    localStorage.setItem("chery_gmao_currency", currency);
  }, [hourlyRate, vatRate, currency]);

  // Default User Profiles fallback if empty
  const defaultProfiles: UserRoleProfile[] = useMemo(() => [
    { id: "admin", label: "M. Ahmed Amine (Admin)", userFullName: "Ahmed Amine", rights: "Accès total, modifications budget, mots de passe", badge: "Administrateur", pin: passwords.admin || "1924", isSystem: true },
    { id: "supervisor", label: "Direction / Superviseur", userFullName: "Direction STA", rights: "Lecture seule sur tous les modules", badge: "Superviseur", pin: passwords.supervisor || "1234", isSystem: true },
    { id: "magasin", label: "Responsable Achats & Appro", userFullName: "Sami Ben Ali", rights: "Gestion des commandes de travaux, fournitures et achats", badge: "Achats", pin: passwords.magasin || "2026", isSystem: true },
    { id: "service_rapide", label: "Chef d'Atelier : Service Rapide", userFullName: "Mohamed Ben Amor", rights: "Interventions et pannes sur Service Rapide", badge: "Atelier", pin: passwords.service_rapide || "0000", workshop: "Service Rapide" },
    { id: "atelier_mecanique", label: "Chef d'Atelier : Mécanique & Élec", userFullName: "Karim Gharbi", rights: "Interventions et pannes sur Mécanique", badge: "Atelier", pin: passwords.atelier_mecanique || "0000", workshop: "Atelier Mécanique" },
    { id: "atelier_diagnostic", label: "Chef d'Atelier : Diagnostic", userFullName: "Youssef Tounsi", rights: "Interventions et pannes sur Diagnostic", badge: "Atelier", pin: passwords.atelier_diagnostic || "0000", workshop: "Atelier Diagnostic" },
    { id: "carrosserie", label: "Chef d'Atelier : Carrosserie", userFullName: "Khaled Khelifi", rights: "Interventions et pannes sur Carrosserie", badge: "Atelier", pin: passwords.carrosserie || "0000", workshop: "Carrosserie" },
    { id: "lavage", label: "Chef d'Atelier : Lavage", userFullName: "Hassen Jlassi", rights: "Interventions et pannes sur Lavage", badge: "Atelier", pin: passwords.lavage || "0000", workshop: "Lavage" },
    { id: "batiment", label: "Chef d'Atelier : Maintenance Bâtiment", userFullName: "Ali Trabelsi", rights: "Interventions et pannes sur Bâtiment", badge: "Atelier", pin: passwords.batiment || "0000", workshop: "Maintenance Bâtiment" }
  ], [passwords]);

  const activeProfiles = userProfiles.length > 0 ? userProfiles : defaultProfiles;

  // State for Editing User Role / Profile
  const [editingRoleProfile, setEditingRoleProfile] = useState<UserRoleProfile | null>(null);
  const [epLabel, setEpLabel] = useState("");
  const [epUserFullName, setEpUserFullName] = useState("");
  const [epBadge, setEpBadge] = useState("");
  const [epRights, setEpRights] = useState("");
  const [epPin, setEpPin] = useState("");
  const [epWorkshop, setEpWorkshop] = useState("");

  // State for Adding New User Role / Profile
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [npId, setNpId] = useState("");
  const [npLabel, setNpLabel] = useState("");
  const [npUserFullName, setNpUserFullName] = useState("");
  const [npBadge, setNpBadge] = useState("Atelier");
  const [npRights, setNpRights] = useState("");
  const [npPin, setNpPin] = useState("0000");
  const [npWorkshop, setNpWorkshop] = useState("");

  const handleOpenEditProfile = (profile: UserRoleProfile) => {
    setEditingRoleProfile(profile);
    setEpLabel(profile.label);
    setEpUserFullName(profile.userFullName || "");
    setEpBadge(profile.badge);
    setEpRights(profile.rights);
    setEpPin(profile.pin || passwords[profile.id] || "0000");
    setEpWorkshop(profile.workshop || "");
  };

  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoleProfile) return;
    const updated: UserRoleProfile = {
      ...editingRoleProfile,
      label: epLabel,
      userFullName: epUserFullName,
      badge: epBadge,
      rights: epRights,
      pin: epPin,
      workshop: epWorkshop || undefined
    };
    if (onUpdateRoleProfile) {
      onUpdateRoleProfile(updated);
    }
    // Also update local passwords map
    if (onUpdatePasswords) {
      onUpdatePasswords({ ...passwords, [editingRoleProfile.id]: epPin });
    }
    setEditingRoleProfile(null);
  };

  const handleSaveNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!npLabel) return;
    const cleanId = npId.trim() ? npId.toLowerCase().replace(/[^a-z0-9_]/g, "_") : `role_${Date.now()}`;
    const newProfile: UserRoleProfile = {
      id: cleanId,
      label: npLabel,
      userFullName: npUserFullName || "Utilisateur Atelier",
      badge: npBadge,
      rights: npRights || "Accès aux modules d'intervention et pannes de l'atelier rattaché.",
      pin: npPin || "0000",
      workshop: npWorkshop || undefined,
      isSystem: false
    };
    if (onAddRoleProfile) {
      onAddRoleProfile(newProfile);
    }
    if (onUpdatePasswords) {
      onUpdatePasswords({ ...passwords, [cleanId]: npPin || "0000" });
    }
    setShowAddProfileModal(false);
    // Reset form
    setNpId("");
    setNpLabel("");
    setNpUserFullName("");
    setNpBadge("Atelier");
    setNpRights("");
    setNpPin("0000");
    setNpWorkshop("");
  };

  // State for Editing Vendor / Prestataire
  const VENDOR_SPECIALTY_OPTIONS = [
    "Contrôles réglementaires (Apave/Sotrap)",
    "Pièces détachées constructeur",
    "Fluides & Gaz climatisation (R134a)",
    "Maintenance Bâtiment & Génie civil",
    "Étalonnage et Métrologie laser"
  ];

  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [evName, setEvName] = useState("");
  const [evContact, setEvContact] = useState("");
  const [evPhone, setEvPhone] = useState("");
  const [evEmail, setEvEmail] = useState("");
  const [evSpecialty, setEvSpecialty] = useState("");
  const [evCustomSpecialty, setEvCustomSpecialty] = useState("");
  const [evRating, setEvRating] = useState(5);

  const handleOpenEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEvName(vendor.name);
    setEvContact(vendor.contactPerson);
    setEvPhone(vendor.phone);
    setEvEmail(vendor.email);
    if (VENDOR_SPECIALTY_OPTIONS.includes(vendor.serviceType)) {
      setEvSpecialty(vendor.serviceType);
      setEvCustomSpecialty("");
    } else if (!vendor.serviceType || vendor.serviceType === "Non spécifié") {
      setEvSpecialty("");
      setEvCustomSpecialty("");
    } else {
      setEvSpecialty("Autre");
      setEvCustomSpecialty(vendor.serviceType);
    }
    setEvRating(vendor.rating || 5);
  };

  const handleSaveEditVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    const finalServiceType = evSpecialty === "Autre"
      ? (evCustomSpecialty.trim() || "Autre prestation externe")
      : (evSpecialty.trim() || "Non spécifié");

    const updated: Vendor = {
      ...editingVendor,
      name: evName,
      contactPerson: evContact,
      phone: evPhone,
      email: evEmail,
      serviceType: finalServiceType,
      rating: evRating
    };
    if (onUpdateVendor) {
      onUpdateVendor(updated);
    }
    setEditingVendor(null);
  };

  // Passwords editing state (initialized with current passwords)
  const [localPasswords, setLocalPasswords] = useState<Record<string, string>>(() => {
    return passwords || {};
  });
  const [passwordSaveFeedback, setPasswordSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLocalPasswords(passwords || {});
  }, [passwords]);

  const handleSavePasswords = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePasswords) {
      onUpdatePasswords(localPasswords);
    }
    setPasswordSaveFeedback("🔑 Mots de passe mis à jour avec succès !");
    setTimeout(() => setPasswordSaveFeedback(null), 3000);
  };

  // Feedback states
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback("✅ Paramètres de facturation enregistrés !");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        equipments,
        interventions,
        spareParts,
        vendors,
        purchaseRequests,
        compliance,
        budget,
        exportedAt: new Date().toISOString(),
        version: "GMAO-STA-1.0"
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `GMAO_STA_Sauvegarde_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupFeedback("💾 Export réussi ! Fichier téléchargé.");
      setTimeout(() => setBackupFeedback(null), 4000);
    } catch (err) {
      setBackupFeedback("❌ Erreur lors de l'export des données.");
      setTimeout(() => setBackupFeedback(null), 4000);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.equipments || parsed.interventions)) {
          onImportAllData(parsed);
          setBackupFeedback("✅ Base de données importée et restaurée avec succès !");
          setTimeout(() => setBackupFeedback(null), 5000);
        } else {
          setBackupFeedback("⚠️ Fichier invalide ou vide.");
          setTimeout(() => setBackupFeedback(null), 4000);
        }
      } catch (err) {
        setBackupFeedback("❌ Erreur de lecture du fichier de sauvegarde.");
        setTimeout(() => setBackupFeedback(null), 4000);
      }
    };
  };

  // --- 3. GESTION DOCUMENTAIRE STATE ---
  const [docsSearch, setDocsSearch] = useState("");
  const localDocs = useMemo(() => {
    try {
      const saved = localStorage.getItem("chery_gmao_documents");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }, [equipments]); // Reload on equipment change as documents can be bound

  const filteredDocsSummary = useMemo(() => {
    if (!docsSearch) return localDocs;
    return localDocs.filter((d: any) => 
      d.name.toLowerCase().includes(docsSearch.toLowerCase()) ||
      d.id.toLowerCase().includes(docsSearch.toLowerCase()) ||
      d.type.toLowerCase().includes(docsSearch.toLowerCase())
    );
  }, [localDocs, docsSearch]);

  const docsStats = useMemo(() => {
    const counts = { procedures: 0, instructions: 0, manuals: 0, plans: 0, regulatory: 0 };
    localDocs.forEach((d: any) => {
      if (d.type === "Procédure") counts.procedures++;
      else if (d.type === "Instruction de travail" || d.type === "Instruction") counts.instructions++;
      else if (d.type === "Manuel") counts.manuals++;
      else if (d.type === "Plan") counts.plans++;
      else if (d.type === "Réglementaire") counts.regulatory++;
    });
    return counts;
  }, [localDocs]);

  // --- 4. PRESTATAIRES (VENDORS) STATE & FORM ---
  const [showAddVendorForm, setShowAddVendorForm] = useState(false);
  const [vName, setVName] = useState("");
  const [vContact, setVContact] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vSpecialty, setVSpecialty] = useState("");
  const [vCustomSpecialty, setVCustomSpecialty] = useState("");
  const [vRating, setVRating] = useState(5);

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName) return;

    const finalServiceType = vSpecialty === "Autre"
      ? (vCustomSpecialty.trim() || "Autre prestation externe")
      : (vSpecialty.trim() || "Non spécifié");

    const newV: Vendor = {
      id: `VEND-${Date.now()}`,
      name: vName,
      contactPerson: vContact || "Responsable Technique",
      phone: vPhone || "+216 71 000 000",
      email: vEmail || "contact@partenaire.tn",
      serviceType: finalServiceType,
      rating: vRating
    };

    if (onAddVendor) {
      onAddVendor(newV);
      alert(`🎉 Prestataire "${vName}" enregistré avec succès !`);
      setShowAddVendorForm(false);
      // Reset
      setVName("");
      setVContact("");
      setVPhone("");
      setVEmail("");
      setVSpecialty("");
      setVCustomSpecialty("");
    } else {
      alert("La méthode d'enregistrement des fournisseurs n'est pas encore connectée.");
    }
  };

  // --- 5. NOTIFICATIONS STATE & SIMULATOR ---
  const [notifSound, setNotifSound] = useState(true);
  const [notifEmailThreshold, setNotifEmailThreshold] = useState(true);
  const [notifSMSThreshold, setNotifSMSThreshold] = useState(false);
  const [simulatedDispatch, setSimulatedDispatch] = useState<string | null>(null);

  const handleSimulateAlert = () => {
    setSimulatedDispatch("Envoi en cours...");
    setTimeout(() => {
      setSimulatedDispatch(
        `📬 SMS & Email envoyé à l'Astreinte Technique ! "Alerte : Le Pont Élévateur à ciseaux (EQ-SR-05) est signalé en PANNE CRITIQUE dans l'atelier Service Rapide. Intervention requise immédiatement."`
      );
      setTimeout(() => setSimulatedDispatch(null), 8000);
    }, 1500);
  };

  // --- 6. HISTORIQUE DES MODIFICATIONS (AUDIT) STATE ---
  const [auditSearch, setAuditSearch] = useState("");
  const [auditTypeFilter, setAuditTypeFilter] = useState("All");
  const [onlyMyAuditLogs, setOnlyMyAuditLogs] = useState<boolean>(true);

  const filteredAuditLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.userRole.toLowerCase().includes(auditSearch.toLowerCase());

      const matchesType = auditTypeFilter === "All" || log.type === auditTypeFilter;

      const matchesUser = isAdmin
        ? (!onlyMyAuditLogs || (log.userRole && log.userRole.toLowerCase().includes(currentRole.toLowerCase())))
        : ((log.userRole && log.userRole.toLowerCase().includes(currentRole.toLowerCase())) ||
           (currentRole && currentRole.toLowerCase().includes(log.userRole ? log.userRole.toLowerCase() : "")));

      return matchesSearch && matchesType && matchesUser;
    });
  }, [activityLogs, auditSearch, auditTypeFilter, onlyMyAuditLogs, currentRole, isAdmin]);

  // Quick stats computed on the fly
  const activeAlertsCount = useMemo(() => {
    let count = 0;
    equipments.forEach(eq => { if (eq.status === "En Panne") count++; });
    interventions.forEach(int => {
      if ((int.status === "Nouvelle" || int.status === "Planifiée") && int.dateIntervention < "2026-07-21") count++;
    });
    return count;
  }, [equipments, interventions]);

  return (
    <div className="space-y-6">
      {/* Upper header action area */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-neutral-100 rounded-xl flex items-center justify-center text-chery-red shrink-0">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-800 flex items-center gap-2">
              🛠️ Administration Système STA
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Supervisez les rôles d'utilisateurs, gérez la documentation légale, configurez les prestataires extérieurs, et inspectez l'historique d'audit.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase font-mono px-2.5 py-1 bg-neutral-100 rounded-lg text-neutral-600">
            Profil actif : {currentRole === "admin" ? "M. Ahmed Amine (Admin)" : currentRole}
          </span>
          {activeAlertsCount > 0 && (
            <span className="text-[10px] font-black uppercase font-mono px-2.5 py-1 bg-red-50 rounded-lg text-chery-red animate-pulse">
              ⚠️ {activeAlertsCount} Alertes actives
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: 1 Column on Mobile, Sidebar + Content on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Hand Navigation Rail */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs space-y-1">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-3 block mb-2">
            Modules d'Administration
          </span>
          {[
            { id: "parameters", label: "⚙️ Paramètres généraux", icon: Sliders },
            { id: "database", label: "🐘 Base Neon & Vercel", icon: Server },
            ...(isAdmin ? [{ id: "users", label: "👥 Gestion des utilisateurs", icon: Users }] : []),
            { id: "docs", label: "📚 Gestion documentaire", icon: FileText },
            { id: "vendors", label: "🏢 Prestataires & Partenaires", icon: Building2 },
            ...(isAdmin ? [{ id: "notifications", label: "🔔 Alertes & Notifications", icon: Bell }] : []),
            { id: "audit", label: "📜 Historique des modifications", icon: History }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-left ${
                  activeSubTab === item.id
                    ? "bg-chery-red text-white"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Hand Working Pane */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: PARAMETERS & BUDGET */}
          {activeSubTab === "parameters" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* General Billing Config Form */}
                <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-chery-red" />
                    Facturation & Devis
                  </h3>
                  <form onSubmit={handleSaveParameters} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-neutral-600 mb-1">Devise de l'Atelier</label>
                      <select
                        disabled={!isWritable}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none disabled:bg-neutral-50"
                      >
                        <option value="TND">TND (Dinar Tunisien)</option>
                        <option value="EUR">EUR (€ Euro)</option>
                        <option value="USD">USD ($ Dollar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-600 mb-1">Taux Horaire Main d'Œuvre ({currency}/h)</label>
                      <input
                        type="number"
                        disabled={!isWritable}
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono disabled:bg-neutral-50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-600 mb-1">TVA Applicable (%)</label>
                      <input
                        type="number"
                        disabled={!isWritable}
                        value={vatRate}
                        onChange={(e) => setVatRate(Number(e.target.value))}
                        className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono disabled:bg-neutral-50"
                      />
                    </div>

                    {saveFeedback && (
                      <p className="text-[11px] text-green-700 bg-green-50 p-2 rounded-lg font-bold text-center border border-green-100">
                        {saveFeedback}
                      </p>
                    )}

                    {isWritable && (
                      <button
                        type="submit"
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Enregistrer les taux
                      </button>
                    )}
                  </form>
                </div>

                {/* Database Actions & Backups */}
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-neutral-500" />
                    Base de données & Sauvegardes
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Les données sont synchronisées automatiquement sur le conteneur Cloud Run toutes les minutes. Téléchargez un point de restauration physique ou videz la base de données de démonstration pour démarrer l'exploitation réelle "STA Chery Tunisie".
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="space-y-2">
                      <button
                        onClick={handleExportBackup}
                        className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold p-2.5 rounded-xl cursor-pointer transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Exporter les données (.json)
                      </button>

                      {isWritable ? (
                        <div className="relative border border-dashed border-neutral-200 rounded-xl p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer text-center">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportBackup}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-4 w-4 text-neutral-500" />
                            <span className="text-[10px] font-bold text-neutral-600">Restaurer un point (.json)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 border border-dashed border-neutral-200 bg-neutral-50 rounded-xl text-center text-[10px] text-neutral-400 font-bold">
                          🔒 Restauration réservée à l'Admin
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200/50">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Zone de Danger</span>
                      <p className="text-[10px] text-neutral-400">Ces actions affectent l'intégralité du stockage local.</p>
                      
                      <div className="flex flex-col gap-1.5">
                        {onResetDemoData && (
                          <button
                            onClick={onResetDemoData}
                            className="w-full text-left font-bold text-chery-red bg-white hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded-lg p-2 text-[11px] cursor-pointer transition-all flex items-center gap-1"
                          >
                            <RefreshCw className="h-3 w-3 shrink-0" />
                            Recharger le parc d'usine STA
                          </button>
                        )}
                        {onClearAllData && (
                          <button
                            onClick={onClearAllData}
                            className="w-full text-left font-bold text-neutral-600 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg p-2 text-[11px] cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3 shrink-0 text-neutral-400" />
                            Vider et créer un espace vierge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {backupFeedback && (
                    <div className="p-2 bg-blue-50 border border-blue-100 text-blue-800 font-bold text-xs rounded-lg text-center leading-tight">
                      {backupFeedback}
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Allocation Panel */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-neutral-800">
                      Allocations Budgétaires {budget.year} par Atelier
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Réglez l'enveloppe autorisée pour chaque service. L'application bloque ou prévient en cas de dépassement.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-black bg-neutral-100 px-3 py-1.5 rounded-full text-neutral-700 border border-neutral-200">
                    Budget Total Annuel : {(budget.totalBudget ?? 0).toLocaleString()} TND
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {WORKSHOPS.map((workshop) => {
                    const allocated = budget.allocatedByWorkshop[workshop] || 0;
                    const spent = budget.spentByWorkshop[workshop] || 0;
                    const percentSpent = Math.min(100, (spent / (allocated || 1)) * 100);
                    const isOverBudget = spent > allocated;

                    return (
                      <div key={workshop} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-xs text-neutral-800">{workshop}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${isOverBudget ? "bg-red-50 text-chery-red" : "bg-green-50 text-green-700"}`}>
                            Dépensé : {(spent ?? 0).toLocaleString()} TND
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-400 block font-bold uppercase">Enveloppe Allouée (TND)</label>
                          <input
                            type="number"
                            disabled={!isWritable}
                            value={allocated}
                            step="1000"
                            onChange={(e) => onUpdateBudgetAllocation(workshop, Number(e.target.value))}
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Progress meter */}
                        <div className="space-y-1">
                          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percentSpent}%` }}
                              className={`h-full rounded-full ${isOverBudget ? "bg-chery-red" : percentSpent > 80 ? "bg-amber-500" : "bg-green-500"}`}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-neutral-400 font-semibold">
                            <span>Consommé : {percentSpent.toFixed(0)}%</span>
                            {isOverBudget && <span className="text-chery-red font-black">Alerte : Dépassement !</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BASE DE DONNEES NEON POSTGRESQL & DEPLOIEMENT VERCEL */}
          {activeSubTab === "database" && (
            <div className="space-y-6 animate-fade-in">
              {/* Statut Neon */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-100 shadow-xs">
                      🐘
                    </div>
                    <div>
                      <h3 className="text-base font-black text-neutral-800 flex items-center gap-2">
                        Connexion Base de Données Neon PostgreSQL
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Stockage persistant serverless haute performance pour l'hébergement Vercel et l'exploitation multi-utilisateurs de STA Chery.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {neonStatus?.connected ? (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200 flex items-center gap-2 shadow-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        🟢 Base Neon PostgreSQL Connectée
                      </span>
                    ) : neonStatus?.configured ? (
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-black rounded-xl border border-amber-200 flex items-center gap-2 shadow-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        🟡 URL configurée, vérification en cours...
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-neutral-400"></span>
                        ⚪ Mode Stockage Local & Fichier
                      </span>
                    )}
                  </div>
                </div>

                {/* Details & Live Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 space-y-3">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">
                      État du Serveur Cloud
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                        <span className="text-neutral-500">Moteur DB :</span>
                        <span className="font-mono font-bold text-neutral-800">Neon Serverless PostgreSQL</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                        <span className="text-neutral-500">DATABASE_URL :</span>
                        <span className="font-mono text-[10px] font-bold text-neutral-700 max-w-[200px] truncate" title={neonStatus?.databaseUrlMasked || "Non configuré"}>
                          {neonStatus?.databaseUrlMasked || "Non configuré dans .env ou Vercel"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-neutral-500">Table de stockage :</span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">gmao_store (JSONB)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 space-y-3">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">
                      Actions de Synchronisation
                    </span>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={isTestingNeon}
                        onClick={async () => {
                          setIsTestingNeon(true);
                          try {
                            if (onCheckNeonStatus) {
                              const res = await onCheckNeonStatus();
                              setNeonTestResult(res);
                              if (res?.connected) {
                                showToast?.("✅ Connexion à Neon PostgreSQL réussie !", "success");
                              } else {
                                showToast?.(res?.error || "⚠️ Impossible de joindre Neon", "error");
                              }
                            }
                          } catch (e: any) {
                            showToast?.(e?.message || "Erreur de test", "error");
                          } finally {
                            setIsTestingNeon(false);
                          }
                        }}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isTestingNeon ? "animate-spin" : ""}`} />
                        {isTestingNeon ? "Test en cours..." : "Tester la connexion Neon en direct"}
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={isSyncingNeon}
                          onClick={async () => {
                            setIsSyncingNeon(true);
                            try {
                              if (onSyncToNeon) {
                                const ok = await onSyncToNeon();
                                if (ok) {
                                  showToast?.("⬆️ Données synchronisées avec succès vers Neon Cloud !", "success");
                                } else {
                                  showToast?.("⚠️ Échec de l'envoi vers Neon (Vérifiez DATABASE_URL)", "error");
                                }
                              }
                            } catch (e: any) {
                              showToast?.(e?.message || "Erreur de synchronisation", "error");
                            } finally {
                              setIsSyncingNeon(false);
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {isSyncingNeon ? "Envoi..." : "Envoyer vers Neon"}
                        </button>

                        <button
                          type="button"
                          disabled={isLoadingNeon}
                          onClick={async () => {
                            if (!confirm("Voulez-vous recharger et écraser les données locales par celles contenues dans Neon Cloud ?")) return;
                            setIsLoadingNeon(true);
                            try {
                              if (onLoadFromNeon) {
                                const ok = await onLoadFromNeon();
                                if (ok) {
                                  showToast?.("⬇️ Données rechargées depuis Neon Cloud avec succès !", "success");
                                } else {
                                  showToast?.("⚠️ Aucune donnée trouvée dans Neon Cloud", "info");
                                }
                              }
                            } catch (e: any) {
                              showToast?.(e?.message || "Erreur de rechargement", "error");
                            } finally {
                              setIsLoadingNeon(false);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {isLoadingNeon ? "Chargement..." : "Recharger de Neon"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Neon Storage Summary */}
                {neonStatus?.connected && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-emerald-200/60 pb-2.5">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                          📊 Contenu Actuel dans votre Base Neon (Table <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono text-[10px]">gmao_store</code>)
                        </span>
                        <span className="text-[11px] text-emerald-700">
                          {neonStatus.totalKeys && neonStatus.totalKeys > 0 
                            ? `Total : ${neonStatus.totalKeys} tables/modules synchronisés`
                            : "La table est actuellement vide (0 enregistrement). Cliquez ci-dessous pour la remplir immédiatement !"}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isSyncingNeon}
                        onClick={async () => {
                          setIsSyncingNeon(true);
                          try {
                            if (onSyncToNeon) {
                              const ok = await onSyncToNeon();
                              if (ok) {
                                await onCheckNeonStatus?.();
                                showToast?.("🚀 Toutes les tables Neon ont été remplies avec succès !", "success");
                              } else {
                                showToast?.("⚠️ Échec du remplissage de Neon (Vérifiez DATABASE_URL)", "error");
                              }
                            }
                          } catch (e: any) {
                            showToast?.(e?.message || "Erreur", "error");
                          } finally {
                            setIsSyncingNeon(false);
                          }
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {isSyncingNeon ? "Remplissage en cours..." : "🚀 Remplir / Mettre à jour Neon"}
                      </button>
                    </div>

                    {neonStatus.storeSummary && Object.keys(neonStatus.storeSummary).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {Object.entries(neonStatus.storeSummary).map(([key, item]: [string, any]) => (
                          <div key={key} className="bg-white p-2.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                            <span className="text-[10px] font-mono font-bold text-neutral-500 block truncate">{key}</span>
                            <span className="text-sm font-black text-emerald-800 font-mono block mt-0.5">
                              {item.count} <span className="text-[10px] font-normal text-neutral-400">éléments</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-lg border border-dashed border-emerald-300 text-center text-xs text-emerald-800">
                        ⚡ Cliquez sur le bouton vert <strong>« 🚀 Remplir / Mettre à jour Neon »</strong> pour injecter tous les équipements, interventions, pièces, contrats et utilisateurs dans votre base PostgreSQL Neon !
                      </div>
                    )}

                    <div className="bg-neutral-900 text-neutral-200 p-3 rounded-lg font-mono text-[11px] space-y-2">
                      <div className="text-neutral-400 text-[10px] font-sans font-bold">💡 Requêtes SQL pour voir vos équipements, interventions et alertes dans Neon (neon.tech) :</div>
                      <div className="text-emerald-400 select-all">-- 1. Voir la liste de tous vos équipements en tableau classique :</div>
                      <div className="text-neutral-300 pl-3 select-all">SELECT jsonb_to_recordset(data) AS (id text, name text, code text, category text, critical text, status text, location text, brand text, model text) FROM gmao_store WHERE key = 'equipments';</div>
                      
                      <div className="text-emerald-400 select-all pt-1">-- 2. Voir toutes les interventions et leurs pannes :</div>
                      <div className="text-neutral-300 pl-3 select-all">SELECT jsonb_to_recordset(data) AS (id text, title text, equipment_name text, priority text, status text, type text, assigned_to text, start_date text) FROM gmao_store WHERE key = 'interventions';</div>
                      
                      <div className="text-emerald-400 select-all pt-1">-- 3. Voir les pièces en alerte de stock bas :</div>
                      <div className="text-neutral-300 pl-3 select-all">SELECT jsonb_to_recordset(data) AS (id text, name text, reference text, quantity int, min_quantity int, unit_price numeric) FROM gmao_store WHERE key = 'spareParts';</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guide de Déploiement Vercel & Neon */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="text-sm font-black text-neutral-800 flex items-center gap-2">
                    🚀 Guide de Partage sur Vercel avec Base Neon
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Voici les étapes simples pour déployer cette application sur Vercel et connecter votre base Neon en production :
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-chery-red text-white flex items-center justify-center font-bold text-xs">1</span>
                      <h4 className="font-extrabold text-neutral-800">Créer votre projet PostgreSQL sur Neon.tech</h4>
                    </div>
                    <p className="text-neutral-500 pl-8 leading-relaxed">
                      Créez un compte gratuit sur <strong>neon.tech</strong>, créez un projet (ex: <code>gmao-sta-chery</code>), puis copiez votre chaîne de connexion (<code>DATABASE_URL</code>).
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-chery-red text-white flex items-center justify-center font-bold text-xs">2</span>
                      <h4 className="font-extrabold text-neutral-800">Exporter le code vers votre GitHub</h4>
                    </div>
                    <p className="text-neutral-500 pl-8 leading-relaxed">
                      Exportez le projet via le menu <strong>Settings &gt; Export to GitHub</strong> ou téléchargez le ZIP et poussez-le vers votre dépôt GitHub.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-chery-red text-white flex items-center justify-center font-bold text-xs">3</span>
                      <h4 className="font-extrabold text-neutral-800">Importer sur Vercel et ajouter la variable DATABASE_URL</h4>
                    </div>
                    <p className="text-neutral-500 pl-8 leading-relaxed">
                      Sur <strong>vercel.com</strong>, cliquez sur <strong>"Add New Project"</strong>, sélectionnez votre dépôt GitHub, puis dans la section <strong>"Environment Variables"</strong>, ajoutez :
                    </p>
                    <div className="pl-8 pt-1">
                      <div className="bg-neutral-900 text-neutral-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                        <div><span className="text-emerald-400 font-bold">DATABASE_URL</span>=postgres://user:password@ep-xxxx.neon.tech/neondb?sslmode=require</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">4</span>
                      <h4 className="font-extrabold text-emerald-900">Cliquez sur "Deploy" !</h4>
                    </div>
                    <p className="text-emerald-800 pl-8 leading-relaxed">
                      Le fichier <code>vercel.json</code> et les routes <code>/api</code> que nous avons configurés s'occuperont automatiquement de créer les tables PostgreSQL et d'assurer la synchronisation temps réel pour tous vos ateliers !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT (ADMIN ONLY) */}
          {activeSubTab === "users" && isAdmin && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Users Role List */}
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-chery-red" />
                      Rôles & Profils d'Atelier Connectés ({activeProfiles.length})
                    </h3>
                    {isWritable && (
                      <button
                        onClick={() => setShowAddProfileModal(true)}
                        className="text-[10px] font-black text-white bg-chery-red hover:bg-chery-dark px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <UserPlus className="h-3 w-3" />
                        Nouveau Profil / Rôle
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-neutral-400">
                    Ces comptes d'accès pré-configurés ou personnalisés permettent aux équipes de la STA d'utiliser la GMAO simultanément sur tablette ou terminal d'atelier.
                  </p>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {activeProfiles.map((role) => {
                      const activePin = passwords[role.id] || role.pin || "0000";
                      return (
                        <div key={role.id} className="p-3.5 border border-neutral-100 hover:bg-neutral-50/80 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors bg-white">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-neutral-800 text-sm">{role.label}</span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                role.id === "admin" ? "bg-red-50 text-chery-red" : role.id === "supervisor" ? "bg-neutral-100 text-neutral-600" : "bg-blue-50 text-blue-700"
                              }`}>
                                {role.badge}
                              </span>
                              {role.userFullName && (
                                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                  👤 {role.userFullName}
                                </span>
                              )}
                              {role.workshop && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                  🛠️ {role.workshop}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-normal">{role.rights}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[9px] text-neutral-400 block font-bold uppercase">CODE PIN</span>
                              <span className="font-mono font-bold text-neutral-800 text-xs bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded block mt-0.5">
                                {activePin}
                              </span>
                            </div>

                            {isWritable && (
                              <div className="flex items-center gap-1 border-l border-neutral-100 pl-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProfile(role)}
                                  title="Modifier ce profil"
                                  className="p-1.5 text-neutral-500 hover:text-chery-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                {!role.isSystem && currentRole === "admin" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Voulez-vous vraiment supprimer le profil "${role.label}" ?`)) {
                                        if (onDeleteRoleProfile) onDeleteRoleProfile(role.id);
                                      }
                                    }}
                                    title="Supprimer ce profil (Admin uniquement)"
                                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Password Update Form */}
                <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <Lock className="h-4.5 w-4.5 text-neutral-500" />
                    Modification des PINs d'Accès
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Saisissez de nouveaux codes d'accès numériques sécurisés pour verrouiller ou déverrouiller les comptes.
                  </p>

                  <form onSubmit={handleSavePasswords} className="space-y-3 text-xs max-h-[450px] overflow-y-auto pr-1">
                    <div className="space-y-3">
                      {activeProfiles.map((prof) => (
                        <div key={prof.id}>
                          <label className="block font-bold text-neutral-600 mb-0.5 text-[11px] flex justify-between">
                            <span>{prof.label}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">({prof.id})</span>
                          </label>
                          <input
                            type="text"
                            disabled={!isWritable}
                            value={localPasswords[prof.id] !== undefined ? localPasswords[prof.id] : (prof.pin || "0000")}
                            onChange={(e) => setLocalPasswords({ ...localPasswords, [prof.id]: e.target.value })}
                            className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono font-bold focus:ring-1 focus:ring-chery-red disabled:bg-neutral-50"
                          />
                        </div>
                      ))}
                    </div>

                    {passwordSaveFeedback && (
                      <p className="text-[10px] text-green-700 bg-green-50 p-2 rounded-lg text-center font-bold">
                        {passwordSaveFeedback}
                      </p>
                    )}

                    {isWritable ? (
                      <button
                        type="submit"
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center mt-2"
                      >
                        Enregistrer tous les PINs
                      </button>
                    ) : (
                      <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] text-neutral-400 font-bold text-center">
                        🔒 Modification réservée à l'Admin
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* MODAL EDIT ROLE PROFILE */}
              {editingRoleProfile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-neutral-100">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                      <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2">
                        <Pencil className="h-4 w-4 text-chery-red" />
                        Modifier le Profil : {editingRoleProfile.label}
                      </h3>
                      <button
                        onClick={() => setEditingRoleProfile(null)}
                        className="p-1 hover:bg-neutral-100 rounded-lg cursor-pointer text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditProfile} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Intitulé du Rôle / Compte *</label>
                        <input
                          type="text"
                          required
                          value={epLabel}
                          onChange={(e) => setEpLabel(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none focus:border-chery-red"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Nom Complet du Titulaire</label>
                        <input
                          type="text"
                          placeholder="ex: M. Ahmed Amine"
                          value={epUserFullName}
                          onChange={(e) => setEpUserFullName(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none focus:border-chery-red"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Type de Badge</label>
                          <select
                            value={epBadge}
                            onChange={(e) => setEpBadge(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none bg-white"
                          >
                            <option value="Administrateur">Administrateur</option>
                            <option value="Superviseur">Superviseur</option>
                            <option value="Magasin">Magasin</option>
                            <option value="Atelier">Atelier</option>
                            <option value="Technicien">Technicien</option>
                            <option value="Contrôleur">Contrôleur</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Code PIN (4 chiffres)</label>
                          <input
                            type="text"
                            required
                            maxLength={8}
                            value={epPin}
                            onChange={(e) => setEpPin(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-mono font-bold outline-none focus:border-chery-red"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Atelier Rattaché (Optionnel)</label>
                        <select
                          value={epWorkshop}
                          onChange={(e) => setEpWorkshop(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none bg-white"
                        >
                          <option value="">-- Tous les ateliers / Non rattaché --</option>
                          {WORKSHOPS.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Droits & Habilitations</label>
                        <textarea
                          rows={2}
                          value={epRights}
                          onChange={(e) => setEpRights(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 outline-none focus:border-chery-red font-medium text-neutral-700"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => setEditingRoleProfile(null)}
                          className="px-4 py-2 border border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-chery-red hover:bg-chery-dark text-white rounded-xl font-bold cursor-pointer"
                        >
                          Enregistrer Modifications
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL ADD NEW ROLE PROFILE */}
              {showAddProfileModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-neutral-100">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                      <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-chery-red" />
                        Créer un Nouveau Profil Utilisateur / Rôle
                      </h3>
                      <button
                        onClick={() => setShowAddProfileModal(false)}
                        className="p-1 hover:bg-neutral-100 rounded-lg cursor-pointer text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveNewProfile} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Intitulé du Rôle / Compte *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Chef Réception & Diagnostic"
                          value={npLabel}
                          onChange={(e) => setNpLabel(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none focus:border-chery-red"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Identifiant Système (ID)</label>
                          <input
                            type="text"
                            placeholder="ex: chef_reception"
                            value={npId}
                            onChange={(e) => setNpId(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-mono font-bold outline-none focus:border-chery-red"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Nom du Titulaire</label>
                          <input
                            type="text"
                            placeholder="ex: Sami Laroussi"
                            value={npUserFullName}
                            onChange={(e) => setNpUserFullName(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none focus:border-chery-red"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Type de Badge</label>
                          <select
                            value={npBadge}
                            onChange={(e) => setNpBadge(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none bg-white"
                          >
                            <option value="Atelier">Atelier</option>
                            <option value="Technicien">Technicien</option>
                            <option value="Magasin">Magasin</option>
                            <option value="Superviseur">Superviseur</option>
                            <option value="Contrôleur">Contrôleur</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Code PIN Initial</label>
                          <input
                            type="text"
                            required
                            maxLength={8}
                            placeholder="0000"
                            value={npPin}
                            onChange={(e) => setNpPin(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-mono font-bold outline-none focus:border-chery-red"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Atelier Rattaché</label>
                        <select
                          value={npWorkshop}
                          onChange={(e) => setNpWorkshop(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none bg-white"
                        >
                          <option value="">-- Tous les ateliers / Polyvalent --</option>
                          {WORKSHOPS.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Droits & Habilitations</label>
                        <textarea
                          rows={2}
                          placeholder="Description des accès autorisés..."
                          value={npRights}
                          onChange={(e) => setNpRights(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 outline-none focus:border-chery-red font-medium text-neutral-700"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => setShowAddProfileModal(false)}
                          className="px-4 py-2 border border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-chery-red hover:bg-chery-dark text-white rounded-xl font-bold cursor-pointer"
                        >
                          Créer le Profil
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENT CONTROL SUMMARY */}
          {activeSubTab === "docs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-chery-red" />
                  État du Gestionnaire de Documents Techniques
                </h3>

                {/* Docs metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                    <span className="text-[9px] text-neutral-400 block font-bold uppercase">Procédures</span>
                    <span className="text-lg font-black text-neutral-800 font-mono block mt-1">{docsStats.procedures}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                    <span className="text-[9px] text-neutral-400 block font-bold uppercase">Instructions</span>
                    <span className="text-lg font-black text-neutral-800 font-mono block mt-1">{docsStats.instructions}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                    <span className="text-[9px] text-neutral-400 block font-bold uppercase">Manuels</span>
                    <span className="text-lg font-black text-neutral-800 font-mono block mt-1">{docsStats.manuals}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                    <span className="text-[9px] text-neutral-400 block font-bold uppercase">Plans</span>
                    <span className="text-lg font-black text-neutral-800 font-mono block mt-1">{docsStats.plans}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                    <span className="text-[9px] text-neutral-400 block font-bold uppercase">Réglementaires</span>
                    <span className="text-lg font-black text-neutral-800 font-mono block mt-1">{docsStats.regulatory}</span>
                  </div>
                </div>

                {/* Summary Table list */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-xs font-bold text-neutral-600">Recherche rapide de documents administratifs</span>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 h-3.5 w-3.5" />
                      <input
                        type="text"
                        placeholder="Rechercher un document..."
                        value={docsSearch}
                        onChange={(e) => setDocsSearch(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto text-xs border border-neutral-100 rounded-xl divide-y divide-neutral-50">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-neutral-50 font-bold text-neutral-400 text-[10px] uppercase border-b border-neutral-100">
                          <th className="p-2.5">ID</th>
                          <th className="p-2.5">Titre</th>
                          <th className="p-2.5">Catégorie</th>
                          <th className="p-2.5">Version</th>
                          <th className="p-2.5 text-right">Taille</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 font-medium">
                        {filteredDocsSummary.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-neutral-400 italic">
                              Aucun document technique enregistré correspondant à la recherche.
                            </td>
                          </tr>
                        ) : (
                          filteredDocsSummary.map((doc: any) => (
                            <tr key={doc.id} className="hover:bg-neutral-50/50">
                              <td className="p-2.5 font-mono font-bold text-neutral-400">{doc.id}</td>
                              <td className="p-2.5 font-bold text-neutral-700">{doc.name}</td>
                              <td className="p-2.5">
                                <span className="bg-neutral-100 text-neutral-600 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                  {doc.type}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-neutral-600 font-bold">{doc.version || "V1.0"}</td>
                              <td className="p-2.5 text-right font-mono text-neutral-400">{doc.size || "1.2 MB"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESTATAIRES & CONTRATS */}
          {activeSubTab === "vendors" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vendors List (2 cols) */}
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-chery-red" />
                      Prestataires Externes Agréés ({vendors.length})
                    </h3>
                    <button
                      onClick={() => setShowAddVendorForm(!showAddVendorForm)}
                      className="text-[10px] font-black text-chery-red bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      {showAddVendorForm ? "Annuler" : "Nouveau prestataire"}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 leading-normal">
                    Partenaires agréés assurant la conformité réglementaire Apave, la fourniture de fluides climatisation, ou l'entretien des cabines de peinture de la STA Tunisie.
                  </p>

                  <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="p-3.5 border border-neutral-100 hover:bg-neutral-50 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs transition-colors bg-white">
                        <div className="sm:col-span-4">
                          <span className="font-extrabold text-neutral-800 text-sm block">{vendor.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400 block mt-0.5 font-bold uppercase">{vendor.id}</span>
                        </div>

                        <div className="sm:col-span-4 space-y-0.5">
                          <span className="text-neutral-600 font-bold block">{vendor.serviceType}</span>
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <Mail className="h-3 w-3 shrink-0" /> {vendor.email}
                          </span>
                        </div>

                        <div className="sm:col-span-4 flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-left sm:text-right space-y-0.5">
                            <span className="text-neutral-600 font-bold flex items-center sm:justify-end gap-1">
                              <Phone className="h-3 w-3 shrink-0 text-neutral-400" /> {vendor.phone}
                            </span>
                            <span className="text-[10px] text-neutral-400 block">Contact : <strong>{vendor.contactPerson}</strong></span>
                          </div>

                          {isWritable && (
                            <div className="flex items-center gap-1 border-l border-neutral-100 pl-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditVendor(vendor)}
                                title="Modifier ce prestataire"
                                className="p-1.5 text-neutral-500 hover:text-chery-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {currentRole === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Voulez-vous vraiment supprimer le prestataire "${vendor.name}" ?`)) {
                                      if (onDeleteVendor) onDeleteVendor(vendor.id);
                                    }
                                  }}
                                  title="Supprimer ce prestataire (Admin uniquement)"
                                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Vendor Form (1 col) */}
                <div className="md:col-span-1">
                  {showAddVendorForm ? (
                    <form onSubmit={handleRegisterVendor} className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4 text-xs animate-fade-in">
                      <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                        <Plus className="h-4 w-4 text-chery-red" />
                        Nouveau Prestataire
                      </h3>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Raison Sociale *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Apave Tunisie"
                          value={vName}
                          onChange={(e) => setVName(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 outline-none bg-white font-bold text-neutral-700"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Interlocuteur principal</label>
                        <input
                          type="text"
                          placeholder="Nom du contact"
                          value={vContact}
                          onChange={(e) => setVContact(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 outline-none bg-white font-bold text-neutral-700"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Téléphone d'Assistance</label>
                        <input
                          type="text"
                          placeholder="+216 71 123 456"
                          value={vPhone}
                          onChange={(e) => setVPhone(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 outline-none bg-white font-mono font-bold text-neutral-700"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Adresse Email</label>
                        <input
                          type="email"
                          placeholder="contact@partenaire.tn"
                          value={vEmail}
                          onChange={(e) => setVEmail(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 outline-none bg-white font-bold text-neutral-700"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">
                          Spécialité / Type de Service <span className="text-[10px] text-neutral-400 font-normal">(Optionnel)</span>
                        </label>
                        <select
                          value={vSpecialty}
                          onChange={(e) => setVSpecialty(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 outline-none bg-white font-bold text-neutral-700"
                        >
                          <option value="">-- Non spécifiée (Optionnel) --</option>
                          <option value="Contrôles réglementaires (Apave/Sotrap)">Contrôles réglementaires (Apave/Sotrap)</option>
                          <option value="Pièces détachées constructeur">Pièces détachées constructeur</option>
                          <option value="Fluides & Gaz climatisation (R134a)">Fluides & Gaz climatisation (R134a)</option>
                          <option value="Maintenance Bâtiment & Génie civil">Maintenance Bâtiment & Génie civil</option>
                          <option value="Étalonnage et Métrologie laser">Étalonnage et Métrologie laser</option>
                          <option value="Autre">Autre (Préciser ci-dessous...)</option>
                        </select>

                        {vSpecialty === "Autre" && (
                          <input
                            type="text"
                            placeholder="Saisir la spécialité (ex: Peinture, Pneumatique, Outillage...)"
                            value={vCustomSpecialty}
                            onChange={(e) => setVCustomSpecialty(e.target.value)}
                            className="w-full mt-2 border border-neutral-200 rounded-lg p-2 outline-none bg-white font-medium text-neutral-800 focus:border-chery-red"
                          />
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-chery-red hover:bg-chery-dark text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Enregistrer Partenaire
                      </button>
                    </form>
                  ) : (
                    <div className="bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-400 flex flex-col items-center justify-center">
                      <Building2 className="h-6 w-6 text-neutral-300 mb-1" />
                      <span className="font-bold text-xs">Aucun formulaire ouvert</span>
                      <p className="text-[10px] mt-1 max-w-[150px] leading-relaxed">
                        Cliquez sur "Nouveau prestataire" pour enregistrer un nouveau partenaire agréé.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL EDIT VENDOR */}
              {editingVendor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-neutral-100">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                      <h3 className="font-extrabold text-neutral-800 text-sm flex items-center gap-2">
                        <Pencil className="h-4 w-4 text-chery-red" />
                        Modifier le Prestataire : {editingVendor.name}
                      </h3>
                      <button
                        onClick={() => setEditingVendor(null)}
                        className="p-1 hover:bg-neutral-100 rounded-lg cursor-pointer text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditVendor} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Raison Sociale *</label>
                        <input
                          type="text"
                          required
                          value={evName}
                          onChange={(e) => setEvName(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none focus:border-chery-red"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Interlocuteur Principal</label>
                          <input
                            type="text"
                            value={evContact}
                            onChange={(e) => setEvContact(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none focus:border-chery-red"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-neutral-600 mb-1">Téléphone d'Assistance</label>
                          <input
                            type="text"
                            value={evPhone}
                            onChange={(e) => setEvPhone(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg p-2 font-mono font-bold outline-none focus:border-chery-red"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">Adresse Email</label>
                        <input
                          type="email"
                          value={evEmail}
                          onChange={(e) => setEvEmail(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none focus:border-chery-red"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">
                          Spécialité / Type de Service <span className="text-[10px] text-neutral-400 font-normal">(Optionnel)</span>
                        </label>
                        <select
                          value={evSpecialty}
                          onChange={(e) => setEvSpecialty(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg p-2 font-bold outline-none bg-white"
                        >
                          <option value="">-- Non spécifiée (Optionnel) --</option>
                          <option value="Contrôles réglementaires (Apave/Sotrap)">Contrôles réglementaires (Apave/Sotrap)</option>
                          <option value="Pièces détachées constructeur">Pièces détachées constructeur</option>
                          <option value="Fluides & Gaz climatisation (R134a)">Fluides & Gaz climatisation (R134a)</option>
                          <option value="Maintenance Bâtiment & Génie civil">Maintenance Bâtiment & Génie civil</option>
                          <option value="Étalonnage et Métrologie laser">Étalonnage et Métrologie laser</option>
                          <option value="Autre">Autre (Préciser ci-dessous...)</option>
                        </select>

                        {evSpecialty === "Autre" && (
                          <input
                            type="text"
                            placeholder="Saisir la spécialité personnalisée..."
                            value={evCustomSpecialty}
                            onChange={(e) => setEvCustomSpecialty(e.target.value)}
                            className="w-full mt-2 border border-neutral-200 rounded-lg p-2 font-medium text-neutral-800 outline-none focus:border-chery-red"
                          />
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => setEditingVendor(null)}
                          className="px-4 py-2 border border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-chery-red hover:bg-chery-dark text-white rounded-xl font-bold cursor-pointer"
                        >
                          Enregistrer Modifications
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeSubTab === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration parameters & Email destination */}
                <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-chery-red" />
                    Alerte Email Automatique (Pannes & Achats)
                  </h3>

                  <div className="bg-red-50/80 p-3.5 rounded-xl border border-red-100 space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-1 text-chery-red font-extrabold text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                        <span>Email Destinataire des Alertes :</span>
                      </div>
                      {emailSavedSuccess && (
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded animate-pulse">
                          Saved ✓
                        </span>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const saved = setStoredAlertEmailRecipient(alertEmailInput);
                        setAlertEmailInput(saved);
                        setEmailSavedSuccess(true);
                        setTimeout(() => setEmailSavedSuccess(false), 3000);
                        showToast?.(`Adresse email modifiée avec succès : ${saved}`, "success");
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="email"
                        required
                        value={alertEmailInput}
                        onChange={(e) => setAlertEmailInput(e.target.value)}
                        placeholder="ex: ahmedamine.bensalah@sta-tunisie.com"
                        className="w-full font-mono font-bold text-neutral-900 bg-white p-2.5 rounded-xl border border-red-200 text-xs focus:ring-2 focus:ring-chery-red outline-none"
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-chery-red hover:bg-chery-dark text-white font-bold py-2 px-3 rounded-lg text-xs cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Enregistrer l'Email
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const def = setStoredAlertEmailRecipient(DEFAULT_ALERT_EMAIL_RECIPIENT);
                            setAlertEmailInput(def);
                            showToast?.(`Email réinitialisé à par défaut : ${def}`, "info");
                          }}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-semibold py-2 px-2.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                          title="Réinitialiser"
                        >
                          Par défaut
                        </button>
                      </div>
                    </form>

                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      Chaque signalement de <strong>panne</strong>, <strong>anomalie</strong> ou création de <strong>demande d'achat (DA)</strong> envoie immédiatement une alerte à cette adresse.
                    </p>

                    {/* Expandable SMTP Server Settings for Real Outlook Delivery */}
                    <div className="pt-2 border-t border-red-200/60 mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-neutral-700 bg-white p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Server className="h-3.5 w-3.5 text-chery-red" />
                          <span>Configuration Serveur SMTP (Gmail / Outlook / Office 365)</span>
                        </div>
                        {showSmtpConfig ? <ChevronUp className="h-3.5 w-3.5 text-neutral-500" /> : <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />}
                      </button>

                      {showSmtpConfig && (
                        <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-2.5 animate-fade-in text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-800">Serveur de messagerie sortante :</span>
                            {smtpSavedSuccess && (
                              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">Config Sauvegardée ✓</span>
                            )}
                          </div>

                          {/* Presets rapides Gmail & Outlook */}
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                setSmtpHost("smtp.gmail.com");
                                setSmtpPort(587);
                                setSmtpUser("ahmedamineb4@gmail.com");
                                setSmtpFrom("ahmedamineb4@gmail.com");
                                showToast?.("Champs configurés pour Gmail (ahmedamineb4@gmail.com). Saisissez votre mot de passe d'application.", "info");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold cursor-pointer transition-colors"
                            >
                              ⚡ Pré-remplir pour Gmail (ahmedamineb4@gmail.com)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSmtpHost("smtp.gmail.com");
                                setSmtpPort(587);
                                setSmtpUser("ahmedaminebensalah1@gmail.com");
                                setSmtpFrom("ahmedaminebensalah1@gmail.com");
                                showToast?.("Champs configurés pour Gmail (ahmedaminebensalah1@gmail.com)", "info");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-50/70 hover:bg-red-100/80 border border-red-200 text-red-700 font-semibold cursor-pointer transition-colors"
                            >
                              ⚡ Gmail 2
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSmtpHost("smtp.office365.com");
                                setSmtpPort(587);
                                setSmtpUser("ahmedamine.bensalah@sta-tunisie.com");
                                setSmtpFrom("ahmedamine.bensalah@sta-tunisie.com");
                                showToast?.("Champs configurés pour Outlook", "info");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                            >
                              ⚡ Outlook STA
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-neutral-500 font-medium mb-0.5">Serveur SMTP</label>
                              <input
                                type="text"
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                                placeholder="smtp.gmail.com"
                                className="w-full font-mono text-[11px] bg-neutral-50 p-1.5 rounded border border-neutral-200 outline-none focus:border-chery-red"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-neutral-500 font-medium mb-0.5">Port SMTP</label>
                              <input
                                type="number"
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(Number(e.target.value))}
                                placeholder="587"
                                className="w-full font-mono text-[11px] bg-neutral-50 p-1.5 rounded border border-neutral-200 outline-none focus:border-chery-red"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-neutral-500 font-medium mb-0.5">Compte / Adresse d'envoi (Gmail ou Outlook)</label>
                            <input
                              type="email"
                              value={smtpUser}
                              onChange={(e) => {
                                setSmtpUser(e.target.value);
                                if (!smtpFrom) setSmtpFrom(e.target.value);
                              }}
                              placeholder="ex: ahmedaminebensalah1@gmail.com"
                              className="w-full font-mono text-[11px] bg-neutral-50 p-1.5 rounded border border-neutral-200 outline-none focus:border-chery-red"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-neutral-500 font-medium mb-0.5">Mot de passe d'application (16 caractères)</label>
                            <input
                              type="password"
                              value={smtpPass}
                              onChange={(e) => setSmtpPass(e.target.value)}
                              placeholder="••••••••••••••••"
                              className="w-full font-mono text-[11px] bg-neutral-50 p-1.5 rounded border border-neutral-200 outline-none focus:border-chery-red"
                            />
                          </div>

                          {/* 💡 Guide d'obtention des identifiants Gmail & Outlook */}
                          <div className="bg-red-50/80 border border-red-200 rounded-xl p-3 space-y-2 text-[11px] text-slate-900 shadow-2xs">
                            <div className="font-bold flex items-center gap-1.5 text-red-950 text-xs">
                              <span>✉️ Guide rapide pour le mot de passe d'application Gmail ({smtpUser || "ahmedaminebensalah1@gmail.com"}) :</span>
                            </div>
                            
                            <div className="space-y-2 text-slate-800 leading-relaxed">
                              <div className="bg-white p-2.5 rounded-lg border border-red-100 shadow-2xs">
                                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                                  <li>
                                    Activez la <strong>Validation en deux étapes</strong> sur votre compte Google : <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700 hover:text-chery-red">myaccount.google.com/security</a>.
                                  </li>
                                  <li>
                                    Ouvrez la page Mots de passe d'application : <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700 hover:text-chery-red">myaccount.google.com/apppasswords</a>.
                                  </li>
                                  <li>
                                    Nommez l'application <strong>"GMAO"</strong>, cliquez sur <strong>Créer</strong>, puis copiez-collez le mot de passe à 16 lettres généré dans le champ ci-dessus.
                                  </li>
                                </ol>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const isGmail = smtpUser.trim().toLowerCase().includes("@gmail.com");
                                const effectiveHost = isGmail && (smtpHost.includes("office365") || smtpHost.includes("outlook") || !smtpHost) ? "smtp.gmail.com" : smtpHost.trim();
                                const cleanPass = smtpPass.trim().replace(/\s+/g, '');

                                if (isGmail && effectiveHost !== smtpHost) {
                                  setSmtpHost(effectiveHost);
                                }

                                const newConfig: SmtpConfig = {
                                  host: effectiveHost,
                                  port: Number(smtpPort) || 587,
                                  user: smtpUser.trim(),
                                  pass: cleanPass,
                                  from: smtpFrom.trim() || smtpUser.trim()
                                };
                                setStoredSmtpConfig(newConfig);
                                setSmtpSavedSuccess(true);
                                setTimeout(() => setSmtpSavedSuccess(false), 3000);
                                showToast?.("Configuration SMTP enregistrée.", "success");
                              }}
                              className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-1.5 px-2 rounded text-[10px] cursor-pointer transition-colors flex items-center justify-center gap-1"
                            >
                              <Save className="h-3 w-3" />
                              Sauvegarder la Config SMTP
                            </button>

                             <button
                              type="button"
                              disabled={isTestingEmail}
                              onClick={async () => {
                                setIsTestingEmail(true);
                                try {
                                  const currentRecipient = alertEmailInput.trim() || getStoredAlertEmailRecipient();
                                  const activeSmtpConfig: SmtpConfig = {
                                    host: smtpHost.trim() || "smtp.office365.com",
                                    port: Number(smtpPort) || 587,
                                    user: smtpUser.trim(),
                                    pass: smtpPass.trim(),
                                    from: smtpFrom.trim() || smtpUser.trim()
                                  };

                                  const res = await fetch("/api/send-email", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      recipient: currentRecipient,
                                      subject: "🧪 Test d'envoi d'Email GMAO STA Chery",
                                      message: `Ceci est un email de test généré le ${new Date().toLocaleString('fr-FR')} depuis l'application GMAO STA Chery.\n\nSi vous recevez ce message sur votre boîte Outlook (${currentRecipient}), la configuration est à 100% fonctionnelle !`,
                                      details: {
                                        equipmentCode: "TEST-01",
                                        equipmentName: "Test de connexion Outlook",
                                        workshop: "Administration",
                                        urgency: "Normale",
                                        author: "Ahmed Amine"
                                      },
                                      smtpConfig: activeSmtpConfig
                                    })
                                  });

                                  const data = await res.json();
                                  if (data.success) {
                                    showToast?.(`✅ ${data.message}`, "success");
                                  } else {
                                    showToast?.(`❌ ${data.error}`, "error");
                                  }
                                } catch (e: any) {
                                  showToast?.(`Erreur de connexion API : ${e?.message || 'Échec'}`, "error");
                                } finally {
                                  setIsTestingEmail(false);
                                }
                              }}
                              className="bg-chery-red hover:bg-chery-dark text-white font-bold py-1.5 px-3 rounded text-[10px] cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-xs"
                            >
                              <Send className="h-3 w-3" />
                              {isTestingEmail ? "Envoi..." : "Tester l'Envoi Réel"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs font-semibold text-neutral-600">
                    <label className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-100/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={notifSound}
                        onChange={(e) => setNotifSound(e.target.checked)}
                        className="rounded border-neutral-300 text-chery-red focus:ring-chery-red"
                      />
                      <span>Signaux sonores & pop-up d'alertes en temps réel</span>
                    </label>

                    <label className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-100/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="rounded border-neutral-300 text-chery-red focus:ring-chery-red"
                      />
                      <span>Envoi automatique Email pour chaque Panne</span>
                    </label>

                    <label className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-100/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="rounded border-neutral-300 text-chery-red focus:ring-chery-red"
                      />
                      <span>Envoi automatique Email pour chaque Demande d'Achat</span>
                    </label>
                  </div>
                </div>

                {/* Alarm Board, simulator & Live Email Log */}
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="h-4.5 w-4.5 text-chery-red" />
                      Journal des Emails d'Alerte Envoyés
                    </h3>
                    <button
                      onClick={() => {
                        sendEmailAlert({
                          triggerType: "PANNE",
                          subject: "🚨 [TEST ALERTE] Signalement de Panne Test sur Pont Élévateur #01",
                          message: "Ceci est une alerte de test générée manuellement pour vérifier la transmission par email.",
                          details: { equipmentCode: "EQ-TEST", equipmentName: "Pont Élévateur #01", workshop: "Service Rapide" }
                        });
                      }}
                      className="text-[10px] font-bold text-white bg-chery-red hover:bg-chery-dark px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Send className="h-3 w-3" />
                      Tester un Envoi d'Email
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 leading-normal">
                    Historique en temps réel des notifications envoyées par email à <strong>ahmedamine.bensalah@sta-tunisie.com</strong> pour toutes les pannes, anomalies et demandes d'achat.
                  </p>

                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {getStoredEmailAlerts().length === 0 ? (
                      <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-400 italic">
                        Aucun email d'alerte enregistré pour le moment. Signalez une panne ou créez une demande d'achat pour déclencher un envoi automatique.
                      </div>
                    ) : (
                      getStoredEmailAlerts().map((alert) => (
                        <div key={alert.id} className="p-3 bg-neutral-50/80 hover:bg-white border border-neutral-200/60 rounded-xl text-xs transition-colors space-y-1">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              alert.triggerType === "PANNE"
                                ? "bg-red-100 text-red-700"
                                : alert.triggerType === "ANOMALIE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {alert.triggerType}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {new Date(alert.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="font-bold text-neutral-800 text-xs">
                            {alert.subject}
                          </div>
                          <div className="text-[11px] text-neutral-600 font-mono">
                            Destinataire: <strong className="text-blue-700">{alert.recipient}</strong>
                          </div>
                          <p className="text-[11px] text-neutral-500 bg-white p-2 rounded-lg border border-neutral-100 mt-1">
                            {alert.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT LOGGER */}
          {activeSubTab === "audit" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="h-4 w-4 text-chery-red" />
                      Journal d'Audit - Historique des Modifications
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Registre légal traçant l'intégralité des créations d'équipements, validations d'achats, et saisies budgétaires.
                    </p>
                  </div>

                  {isAdmin && onClearLogs && (
                    <button
                      onClick={() => {
                        if (confirm("⚠️ Souhaitez-vous purger l'intégralité du journal d'audit de la STA ? Cette opération est irréversible.")) {
                          onClearLogs();
                        }
                      }}
                      className="text-[10px] font-black text-chery-red hover:underline border border-red-100 px-3 py-1 bg-red-50 rounded-lg cursor-pointer transition-colors"
                    >
                      Purger le journal
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 h-3.5 w-3.5" />
                    <input
                      type="text"
                      placeholder="Filtrer l'audit par action, utilisateur, matériel..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-neutral-300"
                    />
                  </div>

                  <select
                    value={auditTypeFilter}
                    onChange={(e) => setAuditTypeFilter(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs outline-none cursor-pointer"
                  >
                    <option value="All">Toutes les catégories</option>
                    <option value="equipment">Équipements Parc</option>
                    <option value="intervention">Bons d'Interventions</option>
                    <option value="spare_part">Pièces & Inventaire</option>
                    <option value="compliance">Contrôles de Conformité</option>
                    <option value="purchase">Demandes d'Achats (DA)</option>
                    <option value="budget">Allocations Budgétaires</option>
                    <option value="other">Système & Initialisation</option>
                  </select>

                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setOnlyMyAuditLogs(!onlyMyAuditLogs)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                        onlyMyAuditLogs
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {onlyMyAuditLogs ? "🔒 Mes modifications uniquement" : "👁️ Tous les utilisateurs"}
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center">
                      🔒 Vos modifications uniquement
                    </span>
                  )}
                </div>

                {/* Logs Listing Table */}
                <div className="overflow-x-auto text-xs border border-neutral-100 rounded-xl max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50 font-bold text-neutral-400 text-[10px] uppercase border-b border-neutral-100">
                        <th className="p-2.5">Date & Heure</th>
                        <th className="p-2.5">Auteur</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">Détail des modifications</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 font-medium">
                      {filteredAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-neutral-400 italic">
                            Aucun enregistrement d'audit trouvé pour les critères de recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-neutral-50/50">
                            <td className="p-2.5 font-mono text-neutral-400 whitespace-nowrap">{log.timestamp}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-neutral-700">@{log.userRole}</span>
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                log.type === "equipment" ? "bg-blue-50 text-blue-700" :
                                log.type === "intervention" ? "bg-purple-50 text-purple-700" :
                                log.type === "budget" ? "bg-amber-50 text-amber-700" :
                                log.type === "compliance" ? "bg-green-50 text-green-700" :
                                log.type === "purchase" ? "bg-red-50 text-chery-red" : "bg-neutral-100 text-neutral-600"
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold text-neutral-800 whitespace-nowrap">{log.action}</td>
                            <td className="p-2.5 text-neutral-500 leading-normal">{log.details}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
