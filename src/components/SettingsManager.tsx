/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  Trash2
} from "lucide-react";
import { BudgetYear, Workshop } from "../types";
import { WORKSHOPS } from "../data";

interface SettingsManagerProps {
  budget: BudgetYear;
  onUpdateBudgetAllocation: (workshop: Workshop, amount: number) => void;
  equipments: any[];
  interventions: any[];
  spareParts: any[];
  vendors: any[];
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
}

export default function SettingsManager({
  budget,
  onUpdateBudgetAllocation,
  equipments,
  interventions,
  spareParts,
  vendors,
  purchaseRequests,
  compliance,
  onImportAllData,
  isReadOnly = false,
  currentRole = "admin",
  passwords = {},
  onUpdatePasswords,
  dbMode = "demo",
  onResetDemoData,
  onClearAllData
}: SettingsManagerProps) {
  const isAdmin = currentRole === "admin";
  const isWritable = !isReadOnly && isAdmin;
  // Labor Rate (Local state or mock config)
  const [hourlyRate, setHourlyRate] = useState<number>(60); // default TND/hour
  const [vatRate, setVatRate] = useState<number>(19); // default VAT % in Tunisia
  const [currency, setCurrency] = useState<string>("TND");

  // Passwords editing state (initialized with current passwords)
  const [localPasswords, setLocalPasswords] = useState<Record<string, string>>(() => {
    return passwords || {};
  });
  const [passwordSaveFeedback, setPasswordSaveFeedback] = useState<string | null>(null);

  const handleSavePasswords = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePasswords) {
      onUpdatePasswords(localPasswords);
    }
    setPasswordSaveFeedback("Mots de passe mis à jour avec succès !");
    setTimeout(() => setPasswordSaveFeedback(null), 3000);
  };

  // Success message feedback
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback("Paramètres généraux sauvegardés avec succès !");
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

      setBackupFeedback("Export réussi ! Fichier téléchargé.");
      setTimeout(() => setBackupFeedback(null), 4000);
    } catch (err) {
      setBackupFeedback("Erreur lors de l'export des données.");
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
          setBackupFeedback("Base de données importée et restaurée avec succès !");
          setTimeout(() => setBackupFeedback(null), 5000);
        } else {
          setBackupFeedback("Fichier invalide ou vide.");
          setTimeout(() => setBackupFeedback(null), 4000);
        }
      } catch (err) {
        setBackupFeedback("Erreur de lecture du fichier de sauvegarde.");
        setTimeout(() => setBackupFeedback(null), 4000);
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Intro header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-700">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-800">Paramètres Généraux de l'Application</h2>
            <p className="text-xs text-neutral-400">
              Configurez les seuils financiers, les taux de facturation et gérez l'état de la base de données.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: general parameters */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleSaveParameters} className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2">
              🔧 Facturation & Taux Horaires
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Devise par défaut</label>
                <select
                  disabled={!isWritable}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none disabled:bg-neutral-100 disabled:cursor-not-allowed"
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
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Taux de TVA (%)</label>
                <input
                  type="number"
                  disabled={!isWritable}
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {saveFeedback && (
              <div className="p-2.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-xs font-semibold text-center">
                {saveFeedback}
              </div>
            )}

            {isWritable && (
              <button
                type="submit"
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                Enregistrer les taux
              </button>
            )}
          </form>

          {/* Backup & Restore Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-700">
              💾 Sauvegarde & Restauration
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed">
              L'application s'exécute localement dans votre navigateur. Exportez régulièrement vos données sous forme de fichier pour les sécuriser contre les nettoyages de cache.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Sauvegarder la base (JSON)
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
                    <span className="text-[10px] font-bold text-neutral-600">
                      Restaurer une sauvegarde (JSON)
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      Glissez ou cliquez pour charger votre fichier
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 border border-dashed border-neutral-200 bg-neutral-50 rounded-xl text-center text-[10px] text-neutral-400 font-medium">
                  🔒 Importation verrouillée (Admin uniquement)
                </div>
              )}
            </div>

            {backupFeedback && (
              <div className="p-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold text-center leading-tight">
                {backupFeedback}
              </div>
            )}
          </div>

          {/* Profile Passwords Management Card */}
          {isAdmin && (
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-700 flex items-center gap-1.5">
                <Lock className="h-4.5 w-4.5 text-neutral-500" />
                Mots de Passe des Profils
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Définissez les codes PIN d'accès pour chaque profil utilisateur afin de limiter les privilèges sur la GMAO.
              </p>

              <form onSubmit={handleSavePasswords} className="space-y-3">
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="flex items-center justify-between font-bold text-neutral-600 mb-1">
                      <span>M. Ahmed Amine (Admin) :</span>
                      <span className="text-[9px] bg-red-50 text-chery-red px-1.5 py-0.2 rounded font-mono font-semibold">Privilèges Totaux</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isWritable}
                      value={localPasswords.admin || ""}
                      onChange={(e) => setLocalPasswords({ ...localPasswords, admin: e.target.value })}
                      className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono font-bold text-neutral-700 focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      placeholder="PIN Code"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between font-bold text-neutral-600 mb-1">
                      <span>Superviseur (Lecture Seule) :</span>
                      <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.2 rounded font-mono font-semibold">Lecture Totale</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isWritable}
                      value={localPasswords.supervisor || ""}
                      onChange={(e) => setLocalPasswords({ ...localPasswords, supervisor: e.target.value })}
                      className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono font-bold text-neutral-700 focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      placeholder="PIN Code"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between font-bold text-neutral-600 mb-1">
                      <span>Magasinier (Pièces & Stocks) :</span>
                      <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.2 rounded font-mono font-semibold">Gestion Pièces</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isWritable}
                      value={localPasswords.magasin || ""}
                      onChange={(e) => setLocalPasswords({ ...localPasswords, magasin: e.target.value })}
                      className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono font-bold text-neutral-700 focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      placeholder="PIN Code"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between font-bold text-neutral-600 mb-1">
                      <span>Chefs d'Atelier (Opérateurs) :</span>
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-mono font-semibold">Ateliers Individuels</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isWritable}
                      value={localPasswords.service_rapide || ""}
                      onChange={(e) => {
                        const newPin = e.target.value;
                        setLocalPasswords({
                          ...localPasswords,
                          service_rapide: newPin,
                          atelier_mecanique: newPin,
                          atelier_diagnostic: newPin,
                          carrosserie: newPin,
                          lavage: newPin,
                          batiment: newPin
                        });
                      }}
                      className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono font-bold text-neutral-700 focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      placeholder="PIN Code"
                    />
                  </div>
                </div>

                {passwordSaveFeedback && (
                  <div className="p-2 bg-green-50 border border-green-100 text-green-700 rounded-lg text-[11px] font-semibold text-center leading-tight">
                    {passwordSaveFeedback}
                  </div>
                )}

                {isWritable ? (
                  <button
                    type="submit"
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Sauvegarder les codes d'accès
                  </button>
                ) : (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[10px] text-neutral-400 font-medium text-center">
                    🔒 Modification des PINs réservée à l'Administrateur
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Right column: Budget allocation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-800">
                  Allocations Budgétaires {budget.year} par Atelier
                </h3>
                <p className="text-xs text-neutral-400">
                  Modifiez l'enveloppe allouée à chaque atelier. Le graphique global s'ajustera instantanément.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-neutral-100 px-3 py-1 rounded-full text-neutral-700">
                Budget Total : {budget.totalBudget.toLocaleString()} TND
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WORKSHOPS.map((workshop) => {
                const allocated = budget.allocatedByWorkshop[workshop] || 0;
                const spent = budget.spentByWorkshop[workshop] || 0;
                const percentSpent = Math.min(100, (spent / allocated) * 100);
                const isOverBudget = spent > allocated;

                return (
                  <div
                    key={workshop}
                    className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-neutral-800">{workshop}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${isOverBudget ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        Dépensé : {spent.toLocaleString()} TND
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 block font-semibold">Budget Alloué (TND)</label>
                      <input
                        type="number"
                        disabled={!isWritable}
                        value={allocated}
                        step="1000"
                        onChange={(e) => onUpdateBudgetAllocation(workshop, Number(e.target.value))}
                        className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-chery-red disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Simple progress bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentSpent}%` }}
                          className={`h-full rounded-full ${isOverBudget ? "bg-red-600 animate-pulse-subtle" : percentSpent > 80 ? "bg-amber-500" : "bg-green-500"}`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-neutral-400">
                        <span>Consommation : {percentSpent.toFixed(0)}%</span>
                        {isOverBudget && <span className="text-red-600 font-bold">Alerte : Budget Dépassé !</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
