/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Calendar,
  Sliders,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  Presentation,
  LogOut
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
  PurchaseRequest
} from "./types";

import {
  INITIAL_EQUIPMENTS,
  INITIAL_SPARE_PARTS,
  INITIAL_INTERVENTIONS,
  INITIAL_VENDORS,
  INITIAL_CONTRACTS,
  INITIAL_COMPLIANCE_CHECKS,
  BUDGET_2026,
  INITIAL_PURCHASE_REQUESTS
} from "./data";

// Sub Components
import GmaoDashboard from "./components/GmaoDashboard";
import EquipmentsManager from "./components/EquipmentsManager";
import InterventionsManager from "./components/InterventionsManager";
import InventoryManager from "./components/InventoryManager";
import ContractsManager from "./components/ContractsManager";
import ExcelBlueprint from "./components/ExcelBlueprint";
import PurchasesManager from "./components/PurchasesManager";
import SettingsManager from "./components/SettingsManager";
import UserGuide from "./components/UserGuide";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [resetConfirmType, setResetConfirmType] = useState<"reset" | "clear" | null>(null);

  // Collapsible Sidebar Menus State
  const [parcOpen, setParcOpen] = useState<boolean>(true);
  const [maintenanceOpen, setMaintenanceOpen] = useState<boolean>(true);

  // Nested filter states
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>("All");
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<string>("All");
  const [selectedMaintenanceStatus, setSelectedMaintenanceStatus] = useState<string>("All");
  const [showMaintenanceCalendar, setShowMaintenanceCalendar] = useState<boolean>(false);

  const [dbMode, setDbMode] = useState<"demo" | "vierge">(() => {
    const saved = localStorage.getItem("chery_gmao_database_mode");
    return (saved as "demo" | "vierge") || "vierge";
  });

  // Core Reactive States (With LocalStorage persistence fallback)
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem("chery_gmao_equipments");
    if (saved) return JSON.parse(saved);
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_EQUIPMENTS : [];
  });

  const [interventions, setInterventions] = useState<Intervention[]>(() => {
    const saved = localStorage.getItem("chery_gmao_interventions");
    if (saved) return JSON.parse(saved);
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_INTERVENTIONS : [];
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    const saved = localStorage.getItem("chery_gmao_spare_parts");
    if (saved) return JSON.parse(saved);
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_SPARE_PARTS : [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem("chery_gmao_vendors");
    if (saved) return JSON.parse(saved);
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_VENDORS : [];
  });

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem("chery_gmao_purchase_requests");
    if (saved) return JSON.parse(saved);
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_PURCHASE_REQUESTS : [];
  });

  const [contracts] = useState<MaintenanceContract[]>(INITIAL_CONTRACTS);

  const [compliance, setCompliance] = useState<ComplianceCheck[]>(() => {
    const saved = localStorage.getItem("chery_gmao_compliance");
    if (saved) return JSON.parse(saved);
    const mode = localStorage.getItem("chery_gmao_database_mode") || "demo";
    return mode === "demo" ? INITIAL_COMPLIANCE_CHECKS : [];
  });

  const [budget, setBudget] = useState<BudgetYear>(() => {
    const saved = localStorage.getItem("chery_gmao_budget");
    if (saved) return JSON.parse(saved);
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

  // User Authentication & Access Control States
  const DEFAULT_PASSWORDS: Record<string, string> = {
    admin: "1924",
    supervisor: "1234",
    magasin: "2026",
    service_rapide: "0000",
    atelier_mecanique: "0000",
    atelier_diagnostic: "0000",
    carrosserie: "0000",
    lavage: "0000",
    batiment: "0000"
  };

  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("chery_gmao_passwords");
    return saved ? JSON.parse(saved) : DEFAULT_PASSWORDS;
  });

  const [currentUserRole, setCurrentUserRole] = useState<string>(() => {
    return localStorage.getItem("chery_gmao_user_role") || "admin";
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginPendingRole, setLoginPendingRole] = useState<string | null>(null);
  const [loginPasswordInput, setLoginPasswordInput] = useState<string>("");
  const [loginPasswordError, setLoginPasswordError] = useState<boolean>(false);

  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showHelperCodes, setShowHelperCodes] = useState(false);

  const ROLE_LABELS: Record<string, string> = {
    admin: "M. Ahmed Amine (Admin)",
    supervisor: "Superviseur (Lecture seule)",
    magasin: "Magasinier (Pièces)",
    service_rapide: "Chef d'Atelier: Service Rapide",
    atelier_mecanique: "Chef d'Atelier: Mécanique / élec",
    atelier_diagnostic: "Chef d'Atelier: Diagnostic",
    carrosserie: "Chef d'Atelier: Carrosserie",
    lavage: "Chef d'Atelier: Lavage",
    batiment: "Chef d'Atelier: Maintenance Bâtiment"
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

  const isEquipmentsReadOnly = currentUserRole === "supervisor" || currentUserRole === "magasin";
  const isPurchasesReadOnly = currentUserRole === "supervisor";
  const isSettingsReadOnly = currentUserRole !== "admin";
  const allowedWorkshop = getAllowedWorkshop(currentUserRole);

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

  // One-time auto-migration to version 7 to force blank "vierge" mode as requested
  useEffect(() => {
    const migrated = localStorage.getItem("chery_gmao_db_migrated_v7");
    if (!migrated) {
      localStorage.setItem("chery_gmao_database_mode", "vierge");
      localStorage.removeItem("chery_gmao_equipments");
      localStorage.removeItem("chery_gmao_interventions");
      localStorage.removeItem("chery_gmao_spare_parts");
      localStorage.removeItem("chery_gmao_compliance");
      localStorage.removeItem("chery_gmao_budget");
      localStorage.removeItem("chery_gmao_vendors");
      localStorage.removeItem("chery_gmao_purchase_requests");
      localStorage.setItem("chery_gmao_db_migrated_v7", "true");
      window.location.reload();
    }
  }, []);

  // -------------------------------------------------------------
  // CORE GMAO WORKFLOW OPERATIONS & SYSTEM INTEGRATIONS
  // -------------------------------------------------------------

  // A. Add a new Equipment Asset
  const handleAddEquipment = (newEq: Equipment) => {
    setEquipments((prev) => [newEq, ...prev]);
  };

  // A1. Update an existing Equipment Asset
  const handleUpdateEquipment = (updatedEq: Equipment) => {
    setEquipments((prev) =>
      prev.map((eq) => (eq.code === updatedEq.code ? updatedEq : eq))
    );
  };

  // A2. Delete an Equipment Asset
  const handleDeleteEquipment = (code: string) => {
    setEquipments((prev) => prev.filter((eq) => eq.code !== code));
  };

  // B. Update Equipment Operational Status
  const handleUpdateEquipmentStatus = (code: string, status: EquipmentStatus) => {
    setEquipments((prev) =>
      prev.map((eq) => (eq.code === code ? { ...eq, status } : eq))
    );
  };

  // C. Log a new Intervention (With automatic Warehouse Stock & Budget consumptions!)
  const handleAddIntervention = (newInt: Intervention) => {
    // 1. Add intervention to list
    setInterventions((prev) => [newInt, ...prev]);

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
  };

  // D. Update Intervention Status (and sync Equipment status back)
  const handleUpdateInterventionStatus = (id: string, newStatus: InterventionStatus) => {
    let intRecord: Intervention | undefined;
    setInterventions((prev) =>
      prev.map((int) => {
        if (int.id === id) {
          intRecord = int;
          return { ...int, status: newStatus };
        }
        return int;
      })
    );

    // If changing to "Terminé", restore equipment back to "Opérationnel"
    if (newStatus === "Terminé" && intRecord) {
      handleUpdateEquipmentStatus(intRecord.equipmentCode, "Opérationnel");
    } else if (newStatus === "En cours" && intRecord) {
      handleUpdateEquipmentStatus(intRecord.equipmentCode, "En Maintenance");
    }
  };

  // E. Restock Spare Parts
  const handleRestockPart = (code: string, qty: number) => {
    setSpareParts((prev) =>
      prev.map((part) => (part.code === code ? { ...part, currentStock: part.currentStock + qty } : part))
    );
  };

  // F. Register a new Spare Part designation
  const handleAddPart = (newPart: SparePart) => {
    setSpareParts((prev) => [newPart, ...prev]);
  };

  // G. Log a new Regulatory Audit Certificate
  const handleAddComplianceCheck = (newCheck: ComplianceCheck) => {
    setCompliance((prev) => [newCheck, ...prev]);
  };

  // H. Purchase Order (DA) Operations
  const handleAddPurchaseRequest = (newReq: PurchaseRequest) => {
    setPurchaseRequests((prev) => [newReq, ...prev]);
  };

  const handleUpdatePurchaseRequestStatus = (id: string, nextStatus: PurchaseRequest["status"]) => {
    setPurchaseRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          // If the request transitions to "Reçu" for the first time, automatically replenish the inventory!
          if (nextStatus === "Reçu" && req.status !== "Reçu") {
            handleRestockPart(req.partCode, req.quantity);
          }
          return { ...req, status: nextStatus };
        }
        return req;
      })
    );
  };

  const handleAddVendor = (newVendor: Vendor) => {
    setVendors((prev) => [newVendor, ...prev]);
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
    
    setEquipments(INITIAL_EQUIPMENTS);
    setInterventions(INITIAL_INTERVENTIONS);
    setSpareParts(INITIAL_SPARE_PARTS);
    setCompliance(INITIAL_COMPLIANCE_CHECKS);
    setBudget(BUDGET_2026);
    setVendors(INITIAL_VENDORS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
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
    
    setEquipments([]);
    setInterventions([]);
    setSpareParts([]);
    setCompliance([]);
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
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between antialiased font-sans">
        {/* Top corporate header branding (Login page style) */}
        <header className="bg-white border-b border-neutral-200 shrink-0 shadow-xs py-4">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 select-none mx-auto sm:mx-0">
              <div className="bg-chery-red text-white text-xs font-black px-2.5 py-1.5 rounded-md tracking-wider flex items-center justify-center shadow-xs">
                STA
              </div>
              <span className="font-sans font-black text-lg tracking-wide text-neutral-800">
                CHERY
              </span>
              <div className="border-l border-neutral-200 pl-3 ml-1">
                <span className="font-display font-black text-sm tracking-tight text-neutral-800 block leading-tight">
                  STA TUNISIE
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold tracking-wider block uppercase -mt-0.5">
                  Concessionnaire Officiel Chery
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Central Auth Container */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-2 mb-8 animate-fade-in">
            <span className="text-4xl">🔐</span>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-800 tracking-tight">
              Portail d'Accès GMAO STA
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              Sélectionnez votre profil professionnel et saisissez votre code PIN pour vous connecter à la gestion de maintenance STA Tunisie.
            </p>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {Object.entries(ROLE_LABELS).map(([role, label]) => {
              // Custom icon/style based on role
              let icon = "⚙️";
              let colorClasses = "border-neutral-200 hover:border-neutral-400 hover:shadow-md";
              let badgeText = "Chef d'Atelier";
              let badgeColor = "bg-neutral-100 text-neutral-600";

              if (role === "admin") {
                icon = "🔑";
                colorClasses = "border-red-200 hover:border-chery-red hover:shadow-md bg-red-50/10";
                badgeText = "Administrateur";
                badgeColor = "bg-red-100 text-chery-red";
              } else if (role === "supervisor") {
                icon = "👁️";
                colorClasses = "border-amber-200 hover:border-amber-500 hover:shadow-md bg-amber-50/10";
                badgeText = "Superviseur";
                badgeColor = "bg-amber-100 text-amber-800";
              } else if (role === "magasin") {
                icon = "📦";
                colorClasses = "border-slate-300 hover:border-slate-800 hover:shadow-md bg-slate-50/10";
                badgeText = "Magasinier";
                badgeColor = "bg-slate-800 text-white";
              } else {
                if (role === "service_rapide") icon = "⚡";
                else if (role === "carrosserie") icon = "🎨";
                else if (role === "lavage") icon = "🧼";
                else if (role === "atelier_diagnostic") icon = "🔬";
                else if (role === "atelier_mecanique") icon = "⚙️";
                else if (role === "batiment") icon = "🏢";
              }

              return (
                <button
                  key={role}
                  onClick={() => {
                    setLoginPendingRole(role);
                    setLoginPasswordInput("");
                    setLoginPasswordError(false);
                  }}
                  className={`flex flex-col text-left p-5 rounded-2xl border border-neutral-200 hover:border-neutral-400 hover:shadow-md bg-white transition-all duration-200 cursor-pointer ${colorClasses} group relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{icon}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-neutral-800 leading-snug group-hover:text-chery-red transition-colors">
                    {label}
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-tight">
                    {role === "admin" 
                      ? "Configuration complète & validation globale"
                      : role === "supervisor"
                      ? "Consultation de tous les ateliers en lecture seule"
                      : role === "magasin"
                      ? "Suivi des stocks, pièces de rechange et achats"
                      : "Saisie des pannes et bons de travail de l'atelier"}
                  </p>
                </button>
              );
            })}
          </div>


        </main>

        {/* Inline Password Entry Modal / Prompt */}
        {loginPendingRole && (
          <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-sm w-full p-6 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-3xl">🔑</span>
                <h3 className="text-base font-bold text-neutral-800">
                  Saisir le Code d'Accès
                </h3>
                <p className="text-xs text-neutral-400">
                  Veuillez entrer le PIN pour vous authentifier en tant que :
                </p>
                <p className="text-xs font-bold text-neutral-700 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  {ROLE_LABELS[loginPendingRole]}
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  autoFocus
                  placeholder="Saisir le code / PIN"
                  value={loginPasswordInput}
                  onChange={(e) => {
                    setLoginPasswordInput(e.target.value);
                    setLoginPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLoginVerifyPassword();
                  }}
                  className="w-full text-center tracking-widest text-lg font-bold font-mono border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 outline-none focus:ring-2 focus:ring-chery-red"
                />
                {loginPasswordError && (
                  <p className="text-[11px] text-chery-red font-bold text-center">
                    ❌ Code d'accès PIN incorrect !
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
                  }}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleLoginVerifyPassword}
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  S'authentifier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Corporate Footer */}
        <footer className="bg-white border-t border-neutral-200 py-4 text-center text-[10px] text-neutral-400 shrink-0">
          <p className="font-bold text-neutral-500">
            Portail de GMAO STA Tunisie • Ahmed Amine Ben Salah © 2026
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top corporate header branding */}
      <header className="bg-white border-b border-neutral-200 shrink-0 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Simple & Premium STA Chery Logo */}
            <div className="flex items-center gap-2 select-none">
              <div className="bg-chery-red text-white text-xs font-black px-2.5 py-1.5 rounded-md tracking-wider flex items-center justify-center shadow-xs">
                STA
              </div>
              <span className="font-sans font-black text-lg tracking-wide text-neutral-800">
                CHERY
              </span>
              <div className="hidden sm:block border-l border-neutral-200 pl-3 ml-1">
                <span className="font-display font-black text-sm tracking-tight text-neutral-800 block leading-tight">
                  STA TUNISIE
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold tracking-wider block uppercase -mt-0.5">
                  Concessionnaire Officiel Chery
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2.5 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-200/50">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-subtle"></span>
            <span className="text-xs font-semibold text-neutral-600 font-mono">
              Serveur GMAO Tunisie En Ligne (Port 3000)
            </span>
          </div>

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
                className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-[11px] font-bold py-1.5 px-3 rounded-xl border border-neutral-200 outline-none cursor-pointer shadow-xs transition-all"
              >
                <option value="admin">🔑 Admin: M. Ahmed Amine</option>
                <option value="supervisor">👁️ Superviseur (Lecture seule)</option>
                <option value="magasin">📦 Magasinier (Pièces)</option>
                <option value="service_rapide">⚡ Atelier Service Rapide</option>
                <option value="atelier_mecanique">⚙️ Atelier Mécanique / élec</option>
                <option value="atelier_diagnostic">🔬 Atelier Diagnostic</option>
                <option value="carrosserie">🎨 Atelier Carrosserie</option>
                <option value="lavage">🧼 Atelier Lavage</option>
                <option value="batiment">🏢 Maintenance Bâtiment</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 ml-1 pl-2 border-l border-neutral-200">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs text-neutral-800 block leading-tight">
                  {currentUserRole === "admin" 
                    ? "M. Ahmed Amine" 
                    : currentUserRole === "supervisor" 
                    ? "Superviseur STA" 
                    : currentUserRole === "magasin" 
                    ? "Magasinier Chery" 
                    : "Chef d'Atelier"}
                </span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase block tracking-wider">
                  {currentUserRole === "admin" 
                    ? "Admin Maintenance" 
                    : currentUserRole === "supervisor" 
                    ? "Lecture Totale" 
                    : currentUserRole === "magasin" 
                    ? "Stocks & Achats" 
                    : "Accès Atelier"}
                </span>
              </div>
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-white font-bold text-xs shadow-inner ${
                currentUserRole === "admin" 
                  ? "bg-chery-red border-red-500" 
                  : currentUserRole === "supervisor" 
                  ? "bg-amber-600 border-amber-500" 
                  : currentUserRole === "magasin" 
                  ? "bg-neutral-800 border-neutral-700" 
                  : "bg-blue-600 border-blue-500"
              }`}>
                {currentUserRole === "admin" ? "AA" : currentUserRole === "supervisor" ? "SV" : currentUserRole === "magasin" ? "MG" : "OP"}
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
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

            {/* 🔧 Maintenance Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setMaintenanceOpen(!maintenanceOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "maintenance"
                    ? "bg-neutral-100 text-neutral-800"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="h-4 w-4 text-neutral-500" />
                  <span>🔧 Maintenance</span>
                </div>
                {maintenanceOpen ? <ChevronDown className="h-3.5 w-3.5 text-neutral-500" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />}
              </button>
              
              {maintenanceOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l border-neutral-100 ml-4">
                  {[
                    { id: "preventive", label: "Préventive", type: "Préventif", status: "All", calendar: false },
                    { id: "corrective", label: "Corrective", type: "Correctif", status: "All", calendar: false },
                    { id: "planning", label: "Planning", type: "All", status: "Planifié", calendar: false },
                    { id: "calendrier", label: "Calendrier View", type: "All", status: "All", calendar: true }
                  ].map((sub) => {
                    const isSelected =
                      activeTab === "maintenance" &&
                      (sub.calendar
                        ? showMaintenanceCalendar
                        : selectedMaintenanceType === sub.type && selectedMaintenanceStatus === sub.status && !showMaintenanceCalendar);
                    
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab("maintenance");
                          setSelectedMaintenanceType(sub.type);
                          setSelectedMaintenanceStatus(sub.status);
                          setShowMaintenanceCalendar(sub.calendar);
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

            {/* 📋 Interventions */}
            <button
              onClick={() => {
                setActiveTab("interventions");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "interventions"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4" />
                <span>📋 Interventions</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "interventions" ? "opacity-100" : ""}`} />
            </button>

            {/* 📦 Stock & Pièces */}
            <button
              onClick={() => {
                setActiveTab("inventaire");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "inventaire"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4" />
                <span>📦 Stock & Pièces</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "inventaire" ? "opacity-100" : ""}`} />
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

            {/* 📊 Rapports & Export */}
            <button
              onClick={() => {
                setActiveTab("excel");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "excel"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-4 w-4" />
                <span>📊 Rapports & Export</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "excel" ? "opacity-100" : ""}`} />
            </button>

            {/* 📖 Manuel & Formation */}
            <button
              onClick={() => {
                setActiveTab("guide");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "guide"
                  ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Presentation className="h-4 w-4" />
                <span>📖 Guide & Formation</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "guide" ? "opacity-100" : ""}`} />
            </button>

            {/* ⚙️ Paramètres */}
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
                <span>⚙️ Paramètres</span>
              </div>
              <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === "settings" ? "opacity-100" : ""}`} />
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
                    { id: "interventions", label: "📋 Interventions", icon: FileText },
                    { id: "inventaire", label: "📦 Stock & Pièces", icon: Package },
                    { id: "achats", label: "🛒 Achats", icon: ShoppingCart },
                    { id: "contracts", label: "📑 Contrats & Conformité", icon: ShieldCheck },
                    { id: "excel", label: "📊 Rapports & Export", icon: FileSpreadsheet },
                    { id: "guide", label: "📖 Guide & Formation", icon: Presentation },
                    { id: "settings", label: "⚙️ Paramètres", icon: Settings }
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
              onNavigate={(tab) => {
                if (tab === "equipements") {
                  setSelectedWorkshopFilter("All");
                }
                setActiveTab(tab);
              }}
              onResetDemoData={handleResetDemoData}
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
              initialWorkshop={selectedWorkshopFilter}
              isReadOnly={isEquipmentsReadOnly}
              allowedWorkshop={allowedWorkshop}
              onResetDemoData={handleResetDemoData}
            />
          )}

          {activeTab === "maintenance" && (
            <InterventionsManager
              interventions={interventions}
              equipments={equipments}
              spareParts={spareParts}
              onAddIntervention={handleAddIntervention}
              onUpdateInterventionStatus={handleUpdateInterventionStatus}
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
              initialType="All"
              initialStatus="All"
              showCalendarByDefault={false}
              isReadOnly={isEquipmentsReadOnly}
              allowedWorkshop={allowedWorkshop}
            />
          )}

          {activeTab === "inventaire" && (
            <InventoryManager
              spareParts={spareParts}
              equipments={equipments}
              onRestockPart={handleRestockPart}
              onAddPart={handleAddPart}
              isReadOnly={currentUserRole === "supervisor" || (currentUserRole !== "admin" && currentUserRole !== "magasin")}
              currentRole={currentUserRole}
            />
          )}

          {activeTab === "achats" && (
            <PurchasesManager
              purchaseRequests={purchaseRequests}
              spareParts={spareParts}
              vendors={vendors}
              onAddPurchaseRequest={handleAddPurchaseRequest}
              onUpdatePurchaseRequestStatus={handleUpdatePurchaseRequestStatus}
              onAddVendor={handleAddVendor}
              isReadOnly={isPurchasesReadOnly}
              currentRole={currentUserRole}
            />
          )}

          {activeTab === "contracts" && (
            <ContractsManager
              vendors={vendors}
              contracts={contracts}
              compliance={compliance}
              equipments={equipments}
              onAddComplianceCheck={handleAddComplianceCheck}
            />
          )}

          {activeTab === "excel" && (
            <ExcelBlueprint
              equipments={equipments}
              interventions={interventions}
              spareParts={spareParts}
              contracts={contracts}
              vendors={vendors}
              compliance={compliance}
              budget={budget}
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
            />
          )}

          {activeTab === "guide" && (
            <UserGuide onNavigate={setActiveTab} />
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

            {pendingRole === "admin" && (
              <>
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHelperCodes(!showHelperCodes)}
                    className="text-[10px] text-neutral-400 hover:text-neutral-600 font-semibold underline transition-colors"
                  >
                    {showHelperCodes ? "Masquer l'aide d'accès" : "Afficher l'aide d'accès (Démo)"}
                  </button>
                </div>

                {showHelperCodes && (
                  <div className="text-center py-2 text-[10px] text-neutral-500 font-medium space-y-1 bg-amber-50 rounded-xl border border-amber-100 p-2.5 animate-fade-in">
                    <span className="font-semibold text-amber-800">💡 Code Démo de Secours :</span>
                    <div className="grid grid-cols-2 gap-1 text-[9px] text-neutral-600">
                      <div>Admin: <code className="font-bold font-mono bg-amber-100 px-1 rounded">{passwords.admin}</code></div>
                      <div>Superviseur: <code className="font-bold font-mono bg-amber-100 px-1 rounded">{passwords.supervisor}</code></div>
                      <div>Magasin: <code className="font-bold font-mono bg-amber-100 px-1 rounded">{passwords.magasin}</code></div>
                      <div>Ateliers: <code className="font-bold font-mono bg-amber-100 px-1 rounded">{passwords.service_rapide}</code></div>
                    </div>
                  </div>
                )}
              </>
            )}

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

      {/* Page Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-neutral-500">
            Portail de GMAO & Support Excel d'Ingénierie pour STA Tunisie
          </p>
          <p className="mt-1">
            Concessionnaire Officiel Chery en Tunisie. Conçu et développé par <strong>Ahmed Amine Ben Salah</strong>, Responsable Maintenance et Parc.
          </p>
          <p className="text-[10px] text-neutral-300 mt-2 font-mono">
            STA Tunisie • Ben Arous, Tunisie
          </p>
        </div>
      </footer>
    </div>
  );
}
