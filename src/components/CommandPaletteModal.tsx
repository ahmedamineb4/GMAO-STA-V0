import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Command,
  Wrench,
  FileText,
  Building,
  ShoppingCart,
  Settings,
  HelpCircle,
  History,
  X,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { Equipment, Intervention, PurchaseRequest, Vendor, MaintenanceContract } from "../types";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  interventions: Intervention[];
  purchaseRequests: PurchaseRequest[];
  vendors: Vendor[];
  contracts: MaintenanceContract[];
  onSelectTab: (tab: string) => void;
  onSelectEquipment?: (eq: Equipment) => void;
  onSelectIntervention?: (int: Intervention) => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  equipments,
  interventions,
  purchaseRequests,
  vendors,
  contracts,
  onSelectTab,
  onSelectEquipment,
  onSelectIntervention,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Navigation pages
  const TABS = [
    { id: "dashboard", label: "Tableau de Bord GMAO", icon: LayoutDashboard, category: "Pages Principales", desc: "KPIs, Disponibilité, Conformité & Synthèse" },
    { id: "equipements", label: "Parc Équipements & Machines", icon: Wrench, category: "Pages Principales", desc: "Fiches techniques, QR codes, statuts et dossiers" },
    { id: "interventions", label: "Registre des Interventions", icon: FileText, category: "Pages Principales", desc: "Ordres de travaux, pannes, préventif et correctif" },
    { id: "achats", label: "Gestion des Achats & Fournisseurs", icon: ShoppingCart, category: "Pages Principales", desc: "Commandes de travaux, demandes d'achat et devis" },
    { id: "contracts", label: "Contrats & Conformité APAVE", icon: ShieldCheck, category: "Pages Principales", desc: "Suivi réglementaire et prestataires externes" },
    { id: "finances", label: "Finances & Suivi Budgétaire", icon: Building, category: "Pages Principales", desc: "Consommation des budgets par atelier" },
    { id: "documentation", label: "Dossiers Techniques & Notices", icon: FileText, category: "Pages Principales", desc: "Manuels, schémas électriques et documentations" },
    { id: "logs", label: "Journal d'Audit & Historique", icon: History, category: "Pages Principales", desc: "Historique complet des actions utilisateurs" },
    { id: "guide", label: "Guide & Formation Utilisateur", icon: HelpCircle, category: "Support", desc: "Procédures et manuel d'utilisation GMAO" },
    { id: "settings", label: "Paramètres & Profils d'Accès", icon: Settings, category: "Administration", desc: "Mots de passe, comptes et réinitialisation" }
  ];

  const matchedTabs = TABS.filter(
    (t) =>
      !cleanQuery ||
      t.label.toLowerCase().includes(cleanQuery) ||
      t.desc.toLowerCase().includes(cleanQuery) ||
      t.id.includes(cleanQuery)
  );

  const matchedEquipments = equipments
    .filter(
      (eq) =>
        cleanQuery &&
        (eq.code.toLowerCase().includes(cleanQuery) ||
          eq.name.toLowerCase().includes(cleanQuery) ||
          eq.workshop.toLowerCase().includes(cleanQuery) ||
          (eq.serialNumber && eq.serialNumber.toLowerCase().includes(cleanQuery)) ||
          (eq.location && eq.location.toLowerCase().includes(cleanQuery)))
    )
    .slice(0, 5);

  const matchedInterventions = interventions
    .filter(
      (int) =>
        cleanQuery &&
        (int.id.toLowerCase().includes(cleanQuery) ||
          int.title.toLowerCase().includes(cleanQuery) ||
          int.equipmentCode.toLowerCase().includes(cleanQuery) ||
          int.technician.toLowerCase().includes(cleanQuery))
    )
    .slice(0, 5);

  const matchedPurchases = purchaseRequests
    .filter(
      (pr) =>
        cleanQuery &&
        (pr.id.toLowerCase().includes(cleanQuery) ||
          pr.equipmentName.toLowerCase().includes(cleanQuery) ||
          pr.needReason.toLowerCase().includes(cleanQuery))
    )
    .slice(0, 4);

  const matchedVendors = vendors
    .filter(
      (v) =>
        cleanQuery &&
        (v.name.toLowerCase().includes(cleanQuery) ||
          v.serviceType.toLowerCase().includes(cleanQuery) ||
          v.phone.toLowerCase().includes(cleanQuery))
    )
    .slice(0, 3);

  const totalResults =
    matchedTabs.length +
    matchedEquipments.length +
    matchedInterventions.length +
    matchedPurchases.length +
    matchedVendors.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4 transition-all">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90 sticky top-0 z-10">
          <Search className="h-5 w-5 text-red-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un équipement (ex: EQ-SR-001), une intervention, un achat, ou une page..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700 hidden sm:inline-block">
            ÉCHAP
          </span>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-4 divide-y divide-slate-800/60 custom-scrollbar">
          {totalResults === 0 && (
            <div className="p-8 text-center space-y-2">
              <Search className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Aucun résultat trouvé pour "{query}"</p>
              <p className="text-xs text-slate-500">Essayez de chercher par code machine, titre d'intervention, nom de fournisseur ou page.</p>
            </div>
          )}

          {/* 1. Pages Navigation */}
          {matchedTabs.length > 0 && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1">
                Pages & Navigation ({matchedTabs.length})
              </span>
              {matchedTabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTab(t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-red-400 group-hover:bg-chery-red group-hover:text-white transition-all shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate">{t.label}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{t.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Equipments */}
          {matchedEquipments.length > 0 && (
            <div className="p-2 space-y-1 pt-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1">
                ⚙️ Équipements & Machines ({matchedEquipments.length})
              </span>
              {matchedEquipments.map((eq) => (
                <button
                  key={eq.code}
                  onClick={() => {
                    onSelectTab("equipements");
                    if (onSelectEquipment) onSelectEquipment(eq);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/50 text-blue-400 shrink-0">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{eq.code}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {eq.workshop}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">{eq.name}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    eq.status === "Opérationnel"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : eq.status === "En Panne"
                      ? "bg-red-950 text-red-300 border-red-800 animate-pulse"
                      : "bg-amber-950 text-amber-300 border-amber-800"
                  }`}>
                    {eq.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 3. Interventions */}
          {matchedInterventions.length > 0 && (
            <div className="p-2 space-y-1 pt-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1">
                📋 Interventions & Maintenance ({matchedInterventions.length})
              </span>
              {matchedInterventions.map((int) => (
                <button
                  key={int.id}
                  onClick={() => {
                    onSelectTab("interventions");
                    if (onSelectIntervention) onSelectIntervention(int);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{int.id}</span>
                        <span className="text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50">
                          {int.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 block truncate">{int.title} ({int.equipmentCode})</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    int.status === "Terminée" || int.status === "Terminé" || int.status === "Clôturée"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : int.status === "En cours"
                      ? "bg-blue-950 text-blue-300 border-blue-800"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}>
                    {int.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 4. Purchases */}
          {matchedPurchases.length > 0 && (
            <div className="p-2 space-y-1 pt-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1">
                🛒 Commandes d'Achats & Travaux ({matchedPurchases.length})
              </span>
              {matchedPurchases.map((pr) => {
                const vendorName = vendors.find((v) => v.id === pr.vendorId)?.name || "Fournisseur agréé";
                return (
                  <button
                    key={pr.id}
                    onClick={() => {
                      onSelectTab("achats");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 shrink-0">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block">{pr.id} • {pr.equipmentName}</span>
                        <span className="text-[11px] text-slate-400 block truncate">Fournisseur: {vendorName} • {pr.estimatedCost.toLocaleString()} TND</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {pr.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 5. Vendors */}
          {matchedVendors.length > 0 && (
            <div className="p-2 space-y-1 pt-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1">
                🏢 Fournisseurs & Prestataires ({matchedVendors.length})
              </span>
              {matchedVendors.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectTab("achats");
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-400 shrink-0">
                      <Building className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block">{v.name}</span>
                      <span className="text-[11px] text-slate-400 block truncate">Service: {v.serviceType} • Tél: {v.phone}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-slate-400 text-[11px] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              <Command className="h-3 w-3" /> K
            </span>
            <span>Raccourci Recherche Rapide</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">STA CHERY GMAO v2026</span>
        </div>
      </div>
    </div>
  );
}
