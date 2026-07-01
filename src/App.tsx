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
  HelpCircle,
  Menu,
  X
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
  Workshop
} from "./types";

import {
  INITIAL_EQUIPMENTS,
  INITIAL_SPARE_PARTS,
  INITIAL_INTERVENTIONS,
  INITIAL_VENDORS,
  INITIAL_CONTRACTS,
  INITIAL_COMPLIANCE_CHECKS,
  BUDGET_2026
} from "./data";

// Sub Components
import GmaoDashboard from "./components/GmaoDashboard";
import EquipmentsManager from "./components/EquipmentsManager";
import InterventionsManager from "./components/InterventionsManager";
import InventoryManager from "./components/InventoryManager";
import ContractsManager from "./components/ContractsManager";
import ExcelBlueprint from "./components/ExcelBlueprint";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Reactive States (With LocalStorage persistence fallback)
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem("chery_gmao_equipments");
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS;
  });

  const [interventions, setInterventions] = useState<Intervention[]>(() => {
    const saved = localStorage.getItem("chery_gmao_interventions");
    return saved ? JSON.parse(saved) : INITIAL_INTERVENTIONS;
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    const saved = localStorage.getItem("chery_gmao_spare_parts");
    return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
  });

  const [vendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [contracts] = useState<MaintenanceContract[]>(INITIAL_CONTRACTS);

  const [compliance, setCompliance] = useState<ComplianceCheck[]>(() => {
    const saved = localStorage.getItem("chery_gmao_compliance");
    return saved ? JSON.parse(saved) : INITIAL_COMPLIANCE_CHECKS;
  });

  const [budget, setBudget] = useState<BudgetYear>(() => {
    const saved = localStorage.getItem("chery_gmao_budget");
    return saved ? JSON.parse(saved) : BUDGET_2026;
  });

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
    localStorage.setItem("chery_gmao_compliance", JSON.stringify(compliance));
  }, [compliance]);

  useEffect(() => {
    localStorage.setItem("chery_gmao_budget", JSON.stringify(budget));
  }, [budget]);

  // -------------------------------------------------------------
  // CORE GMAO WORKFLOW OPERATIONS & SYSTEM INTEGRATIONS
  // -------------------------------------------------------------

  // A. Add a new Equipment Asset
  const handleAddEquipment = (newEq: Equipment) => {
    setEquipments((prev) => [newEq, ...prev]);
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

  // Reset demo data to initial values
  const handleResetDemoData = () => {
    if (window.confirm("Voulez-vous réinitialiser l'ensemble des données aux valeurs par défaut de STA Tunisie ?")) {
      localStorage.removeItem("chery_gmao_equipments");
      localStorage.removeItem("chery_gmao_interventions");
      localStorage.removeItem("chery_gmao_spare_parts");
      localStorage.removeItem("chery_gmao_compliance");
      localStorage.removeItem("chery_gmao_budget");
      setEquipments(INITIAL_EQUIPMENTS);
      setInterventions(INITIAL_INTERVENTIONS);
      setSpareParts(INITIAL_SPARE_PARTS);
      setCompliance(INITIAL_COMPLIANCE_CHECKS);
      setBudget(BUDGET_2026);
      setActiveTab("dashboard");
    }
  };

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

            {/* Logo placeholder mimicking Chery and STA Tunisie */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-chery-red rounded-lg flex items-center justify-center text-white font-extrabold text-sm tracking-tighter shadow-md shadow-red-500/20">
                CHY
              </div>
              <div>
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

          {/* User Profile avatar for Ahmed Amine Ben Salah */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="font-bold text-xs text-neutral-800 block leading-tight">
                M. Ahmed Amine Ben Salah
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold uppercase block tracking-wider">
                Responsable Maintenance & Parc
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              AB
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6 relative">
        
        {/* Navigation Sidebar (Desktop version) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 pb-2 block border-b border-neutral-100 mb-2">
              Pilotage & GMAO
            </span>

            {[
              { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
              { id: "equipements", label: "Registre Équipements", icon: Wrench },
              { id: "interventions", label: "Bons d'Intervention", icon: FileText },
              { id: "inventaire", label: "Magasin & Pièces", icon: Package },
              { id: "contracts", label: "Contrats & Conformité", icon: ShieldAlert },
              { id: "excel", label: "Générateur Excel", icon: FileSpreadsheet }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-chery-red text-white shadow-md shadow-red-500/10"
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`h-3 w-3 opacity-30 ${activeTab === tab.id ? "opacity-100" : ""}`} />
                </button>
              );
            })}
          </div>

          {/* Quick action checklist / system status card */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-xs space-y-3.5 text-xs">
            <h4 className="font-bold text-neutral-800 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <Settings className="h-3.5 w-3.5 text-neutral-500" />
              Actions Système
            </h4>
            <div className="space-y-2">
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Pour faire une démonstration à vos ateliers ou réinitialiser les stocks fictifs.
              </p>
              <button
                onClick={handleResetDemoData}
                className="w-full bg-neutral-100 hover:bg-red-50 hover:text-chery-red border border-transparent hover:border-red-100 text-neutral-600 font-bold py-2 rounded-xl transition-all cursor-pointer text-center text-[11px]"
              >
                Réinitialiser STA Données
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-neutral-900/40 backdrop-blur-xs">
            <div className="bg-white w-64 max-w-sm h-full p-5 flex flex-col justify-between shadow-2xl relative animate-fade-in-left">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-chery-red rounded flex items-center justify-center text-white font-extrabold text-xs">
                      CHY
                    </div>
                    <span className="font-display font-black text-xs text-neutral-800">STA Chery Tunisie</span>
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
                    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
                    { id: "equipements", label: "Registre Équipements", icon: Wrench },
                    { id: "interventions", label: "Bons d'Intervention", icon: FileText },
                    { id: "inventaire", label: "Magasin & Pièces", icon: Package },
                    { id: "contracts", label: "Contrats & Conformité", icon: ShieldAlert },
                    { id: "excel", label: "Générateur Excel", icon: FileSpreadsheet }
                  ].map((tab) => {
                    const Icon = tab.icon;
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
                        <Icon className="h-4.5 w-4.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2">
                <button
                  onClick={() => {
                    handleResetDemoData();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-50 text-chery-red font-bold py-2 rounded-lg text-xs text-center cursor-pointer"
                >
                  Réinitialiser les données
                </button>
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
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "equipements" && (
            <EquipmentsManager
              equipments={equipments}
              interventions={interventions}
              onAddEquipment={handleAddEquipment}
              onUpdateStatus={handleUpdateEquipmentStatus}
            />
          )}

          {activeTab === "interventions" && (
            <InterventionsManager
              interventions={interventions}
              equipments={equipments}
              spareParts={spareParts}
              onAddIntervention={handleAddIntervention}
              onUpdateInterventionStatus={handleUpdateInterventionStatus}
            />
          )}

          {activeTab === "inventaire" && (
            <InventoryManager
              spareParts={spareParts}
              equipments={equipments}
              onRestockPart={handleRestockPart}
              onAddPart={handleAddPart}
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
        </main>
      </div>

      {/* Page Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-neutral-500">
            Portail de GMAO & Support Excel d'Ingénierie pour STA Tunisie
          </p>
          <p className="mt-1">
            Concessionnaire Officiel Chery en Tunisie. Développé pour M. Ahmed Amine Ben Salah, Responsable Maintenance et Parc.
          </p>
          <p className="text-[10px] text-neutral-300 mt-2 font-mono">
            STA Tunisie • Zone Industrielle Charguia II • Tunis, Tunisie
          </p>
        </div>
      </footer>
    </div>
  );
}
