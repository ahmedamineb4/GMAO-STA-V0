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
  UserCheck
} from "lucide-react";
import { BudgetYear, Workshop } from "../types";
import { WORKSHOPS } from "../data";

interface SettingsManagerProps {
  budget: BudgetYear;
  onUpdateBudgetAllocation: (workshop: Workshop, amount: number) => void;
  onResetDemoData: () => void;
}

export default function SettingsManager({
  budget,
  onUpdateBudgetAllocation,
  onResetDemoData
}: SettingsManagerProps) {
  // Labor Rate (Local state or mock config)
  const [hourlyRate, setHourlyRate] = useState<number>(60); // default TND/hour
  const [vatRate, setVatRate] = useState<number>(19); // default VAT % in Tunisia
  const [currency, setCurrency] = useState<string>("TND");

  // Success message feedback
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback("Paramètres généraux sauvegardés avec succès !");
    setTimeout(() => setSaveFeedback(null), 3000);
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
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Taux de TVA (%)</label>
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono"
                />
              </div>
            </div>

            {saveFeedback && (
              <div className="p-2.5 bg-green-50 border border-green-100 text-green-700 rounded-lg text-xs font-semibold text-center">
                {saveFeedback}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Enregistrer les taux
            </button>
          </form>

          {/* System Maintenance Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2 text-red-600">
              ⚠️ Maintenance Système
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Pour des raisons de démonstration ou de test, vous pouvez réinitialiser l'ensemble des données (équipements, interventions, stocks) à leurs valeurs initiales configurées pour STA Tunisie.
            </p>

            <button
              type="button"
              onClick={onResetDemoData}
              className="w-full bg-red-50 hover:bg-red-100 text-chery-red border border-red-200 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réinitialiser la Base STA Tunisie
            </button>
          </div>
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
                        value={allocated}
                        step="1000"
                        onChange={(e) => onUpdateBudgetAllocation(workshop, Number(e.target.value))}
                        className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-chery-red"
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
