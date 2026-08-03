/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  Info,
  Layers,
  Wrench,
  FileText,
  Package,
  ShoppingCart,
  DollarSign,
  ShieldCheck,
  Download
} from "lucide-react";
import { ActivityLog } from "../types";

interface AuditLogsProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
  currentUserRole: string;
}

export default function AuditLogs({ logs, onClearLogs, currentUserRole }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [onlyMyUserLogs, setOnlyMyUserLogs] = useState<boolean>(true);

  const filteredLogs = useMemo(() => {
    const isAdmin = currentUserRole === "admin";
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userRole.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === "All" || log.type === selectedType;

      const matchesUser = isAdmin
        ? (!onlyMyUserLogs || (log.userRole && log.userRole.toLowerCase().includes(currentUserRole.toLowerCase())))
        : ((log.userRole && log.userRole.toLowerCase().includes(currentUserRole.toLowerCase())) ||
           (currentUserRole && currentUserRole.toLowerCase().includes(log.userRole ? log.userRole.toLowerCase() : "")));
      
      return matchesSearch && matchesType && matchesUser;
    });
  }, [logs, searchTerm, selectedType, onlyMyUserLogs, currentUserRole]);

  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "equipment":
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case "intervention":
        return <FileText className="h-4 w-4 text-orange-600" />;
      case "spare_part":
        return <Package className="h-4 w-4 text-emerald-600" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      case "budget":
        return <DollarSign className="h-4 w-4 text-amber-600" />;
      case "compliance":
        return <ShieldCheck className="h-4 w-4 text-sky-600" />;
      default:
        return <History className="h-4 w-4 text-slate-600" />;
    }
  };

  const getLogTypeBadge = (type: ActivityLog["type"]) => {
    switch (type) {
      case "equipment":
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">Équipement</span>;
      case "intervention":
        return <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100">Intervention</span>;
      case "spare_part":
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">Stock & Pièces</span>;
      case "purchase":
        return <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100">Achats & DA</span>;
      case "budget":
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">Budget</span>;
      case "compliance":
        return <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-100">Conformité</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-100">Autre</span>;
    }
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ["ID", "Horodatage", "Acteur", "Action", "Détails", "Type"];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.timestamp,
      log.userRole,
      log.action,
      log.details.replace(/"/g, '""'),
      log.type
    ]);
    
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.map(val => `"${val}"`).join(";"))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GMAO_Historique_Modifications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="audit-logs-section">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <History className="h-4 w-4 text-chery-red" />
            JOURNAL D'AUDIT COMPLET
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Historique des Modifications
          </h1>
          <p className="text-xs text-neutral-400">
            Suivi complet en temps réel de tous les ajouts, modifications et actions effectués par les utilisateurs de la GMAO.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filteredLogs.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all border border-slate-700 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Exporter (.csv)
            </button>
          )}
          {currentUserRole === "admin" && onClearLogs && logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all border border-red-500/20 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Effacer l'historique
            </button>
          )}
        </div>
      </div>

      {/* Control Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher une action, détails ou acteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-red-500/15 focus:border-chery-red transition-all"
          />
        </div>

        {/* Action Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-red-500/15 focus:border-chery-red transition-all cursor-pointer appearance-none"
          >
            <option value="All">Filtrer par type : Tous</option>
            <option value="equipment">Équipements & Infrastructure</option>
            <option value="intervention">Interventions & Réparations</option>
            <option value="spare_part">Pièces & Stock</option>
            <option value="purchase">Demandes d'Achat (DA)</option>
            <option value="budget">Budgets</option>
            <option value="compliance">Conformité réglementaire</option>
            <option value="other">Système & Autre</option>
          </select>
        </div>

        {/* User filter toggle & counter */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {currentUserRole === "admin" ? (
            <button
              type="button"
              onClick={() => setOnlyMyUserLogs(!onlyMyUserLogs)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer text-xs flex items-center gap-1.5 ${
                onlyMyUserLogs
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {onlyMyUserLogs ? "🔒 Mes modifications uniquement" : "👁️ Tous les utilisateurs"}
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              🔒 Vos modifications uniquement
            </span>
          )}
          <div className="text-neutral-500 font-mono text-[11px] shrink-0">
            {filteredLogs.length} logs
          </div>
        </div>
      </div>

      {/* Log Feed Display */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 text-center space-y-3">
          <History className="h-8 w-8 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800">Aucun historique disponible</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {searchTerm || selectedType !== "All"
              ? "Essayez d'ajuster vos critères de recherche ou filtres pour trouver des correspondances."
              : "Le journal d'audit est vide. Les modifications apparaîtront ici dès qu'un équipement, une pièce ou une intervention sera créé ou modifié."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200/60 rounded-2xl overflow-hidden shadow-xs">
          <div className="max-h-[600px] overflow-y-auto divide-y divide-neutral-100">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/50 transition-all flex items-start gap-4 text-xs"
              >
                {/* Visual Icon indicator */}
                <div className="h-8 w-8 rounded-xl bg-slate-50 border border-neutral-100 flex items-center justify-center shrink-0">
                  {getLogIcon(log.type)}
                </div>

                {/* Content body */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{log.action}</span>
                      {getLogTypeBadge(log.type)}
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400 text-[10px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {log.timestamp}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        <User className="h-2.5 w-2.5" />
                        {log.userRole === "admin"
                          ? "M. Ahmed Amine (Admin)"
                          : log.userRole === "magasin"
                          ? "Magasinier"
                          : log.userRole === "supervisor"
                          ? "Superviseur"
                          : `Chef d'Atelier: ${log.userRole}`}
                      </span>
                    </div>
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed font-sans">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
