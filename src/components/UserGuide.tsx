/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Presentation,
  BookOpen,
  Wrench,
  Package,
  FileSpreadsheet,
  Terminal,
  ShieldCheck,
  Cpu,
  User,
  CheckCircle2,
  HelpCircle,
  PlayCircle,
  PlusCircle,
  AlertOctagon,
  FileText,
  BadgeAlert,
  ArrowRight,
  Lock
} from "lucide-react";

interface UserGuideProps {
  onNavigate?: (tab: string) => void;
  currentUserRole?: string;
}

type TrainingRole = "atelier" | "magasinier" | "superviseur";
type TrainingGuideTopic = "creation" | "panne" | "cloture";

export default function UserGuide({ onNavigate, currentUserRole = "atelier" }: UserGuideProps) {
  const [activeRole, setActiveRole] = useState<TrainingRole>("atelier");
  const [activeTopic, setActiveTopic] = useState<TrainingGuideTopic>("panne");

  const isAdmin = currentUserRole === "admin";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-red-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-chery-red via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-chery-red bg-red-500/10 border border-chery-red/20 w-fit px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            Support & Auto-Formation
          </div>
          <h1 className="text-3xl font-black tracking-tight font-display text-white">
            Manuel d'Utilisation & Support GMAO
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Centre de formation interactive et règles d'utilisation de la plateforme de maintenance assistée pour STA Tunisie (Chery).
          </p>
        </div>
      </div>

      {/* 📚 NEW SECTION: Step-by-Step Practical Guides (Création, Panne, Clôture) */}
      <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 md:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-chery-red text-xs font-mono">
            <PlayCircle className="h-4 w-4" />
            MODULES PRATIQUES INTERACTIFS
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Procédures Opérationnelles Standards (SOP)
          </h2>
          <p className="text-xs text-neutral-500">
            Cliquez sur les onglets ci-dessous pour suivre les consignes visuelles de saisie et de traitement des flux.
          </p>
        </div>

        {/* Topic Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-neutral-200/50">
          <button
            onClick={() => setActiveTopic("creation")}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTopic === "creation"
                ? "bg-white text-slate-900 shadow-sm border border-neutral-200"
                : "text-neutral-500 hover:text-slate-800"
            }`}
          >
            <PlusCircle className={`h-4 w-4 ${activeTopic === "creation" ? "text-chery-red" : ""}`} />
            1. Créer Équipement / Infra
          </button>
          
          <button
            onClick={() => setActiveTopic("panne")}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTopic === "panne"
                ? "bg-white text-slate-900 shadow-sm border border-neutral-200"
                : "text-neutral-500 hover:text-slate-800"
            }`}
          >
            <AlertOctagon className={`h-4 w-4 ${activeTopic === "panne" ? "text-chery-red" : ""}`} />
            2. Alerter / Déclarer une Panne
          </button>

          <button
            onClick={() => setActiveTopic("cloture")}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTopic === "cloture"
                ? "bg-white text-slate-900 shadow-sm border border-neutral-200"
                : "text-neutral-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${activeTopic === "cloture" ? "text-emerald-600" : ""}`} />
            3. Clôture & Sorties Pièces
          </button>
        </div>

        {/* Visual Topic Contents */}
        {activeTopic === "creation" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase bg-chery-red/10 text-chery-red px-2 py-0.5 rounded-full font-mono">Qui peut faire ça ?</span>
                <p className="text-xs text-neutral-600">Réservé uniquement aux rôles d'écriture habilités (<strong>Administrateur / Chef d'Atelier</strong>).</p>
              </div>
              <span className="bg-slate-200/60 text-slate-700 font-mono text-[10px] px-3 py-1 rounded-lg">🔒 Requiert PIN</span>
            </div>

            <div className="relative border-l-2 border-neutral-200 pl-6 ml-3 space-y-8 text-xs">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">1</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Ouvrir le formulaire "Ajouter un Équipement"</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    Naviguez vers l'onglet <strong className="text-slate-800">⚙️ Parc Équipements</strong>. Cliquez sur le bouton d'action <strong className="text-slate-800">Ajouter Équipement</strong>. Si vous n'êtes pas authentifié, saisissez le PIN atelier requis.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">2</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Renseigner la Fiche Technique de l'Équipement</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 bg-white p-3.5 rounded-xl border border-neutral-200/50">
                    <div>
                      <strong className="text-slate-700 block text-[10px] uppercase font-mono">Désignation & Code</strong>
                      <p className="text-neutral-500 text-[11px]">Saisissez un nom explicite (ex: <em>Pont Élévateur N°4</em>) et un code unique de repérage technique.</p>
                    </div>
                    <div>
                      <strong className="text-slate-700 block text-[10px] uppercase font-mono">Catégorisation Rigoureuse</strong>
                      <p className="text-neutral-500 text-[11px]">Sélectionnez soit <strong className="text-slate-800">Équipement</strong>, soit <strong className="text-slate-800">Infrastructure</strong> (ex: compresseur d'air, bâtiment).</p>
                    </div>
                    <div>
                      <strong className="text-slate-700 block text-[10px] uppercase font-mono">Atelier d'affectation</strong>
                      <p className="text-neutral-500 text-[11px]">Associez l'équipement à son atelier d'exploitation réel pour l'imputation budgétaire automatique.</p>
                    </div>
                    <div>
                      <strong className="text-slate-700 block text-[10px] uppercase font-mono">Criticité (A/B/C)</strong>
                      <p className="text-neutral-500 text-[11px]">Cochez <strong className="text-chery-red">"Hautement Critique"</strong> si l'arrêt de cette machine paralyse totalement un atelier.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">3</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Date d'Acquisition & Garantie d'Usine</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    Indiquez précisément la fin de la garantie constructeur. Si cette date est antérieure à aujourd'hui, le système génèrera automatiquement une alerte rouge <strong className="text-chery-red">"Garantie Expirée"</strong> dans le journal d'administration pour anticiper la souscription de contrats de maintenance.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">✓</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-emerald-700">Enregistrement & Audit Log Automatique</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    Cliquez sur <strong className="text-slate-800">Enregistrer l'équipement</strong>. Le matériel apparaît instantanément dans la flotte STA Tunisie et une ligne d'audit inviolable contenant l'horodatage précis et votre identité est écrite dans le <strong className="text-slate-800">📜 Journal d'Audit</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTopic === "panne" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase bg-chery-red/10 text-chery-red px-2 py-0.5 rounded-full font-mono">Qui peut faire ça ?</span>
                <p className="text-xs text-neutral-600"><strong>Tous les chefs d'ateliers</strong> en cas de panne d'une machine ou d'un outil de travail.</p>
              </div>
              <span className="bg-slate-200/60 text-slate-700 font-mono text-[10px] px-3 py-1 rounded-lg">⏱️ Durée : 1 minute</span>
            </div>

            <div className="relative border-l-2 border-neutral-200 pl-6 ml-3 space-y-8 text-xs">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">1</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Déclencher le Correctif</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    Dans le menu principal, allez sur <strong className="text-slate-800">🛠️ Interventions</strong>. Cliquez sur <strong className="text-slate-800">Nouvelle Intervention</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">2</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Renseigner le Type "Correctif" & l'Urgence</h4>
                  <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl max-w-3xl space-y-2">
                    <div className="flex items-center gap-2 text-chery-red font-bold text-[11px]">
                      <BadgeAlert className="h-4 w-4" />
                      RECOMMANDATIONS DE SAISIE DE PANNE :
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 text-[11px] leading-relaxed">
                      <li>Sélectionnez bien le type <strong className="text-slate-900">Correctif</strong> (et non Préventif).</li>
                      <li>Choisissez l'équipement concerné dans la liste déroulante (son code s'affichera).</li>
                      <li>Précisez l'urgence : <strong className="text-chery-red">Haute (Panne totale bloquante)</strong> ou <strong className="text-amber-600">Moyenne (Performance dégradée)</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">3</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Description du Dysfonctionnement</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    Décrivez succinctement les symptômes de la panne pour orienter le technicien (ex: <em>"Fuite hydraulique sous le vérin droit, descente saccadée"</em>). Indiquez la date estimée de remise en service.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">✓</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-emerald-700">Alerte Immédiate au Dashboard</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    Dès l'enregistrement, l'équipement passe automatiquement au statut <strong className="text-chery-red">"En Panne"</strong>. Le tableau de bord affiche instantanément un voyant critique dans la section <strong className="text-slate-800">Alertes & Diagnostics</strong> informant l'administrateur et les autres ateliers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTopic === "cloture" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-mono">Conséquence Système</span>
                <p className="text-xs text-neutral-600">Enregistrement des rapports, clôture d'activité et mise à jour de la disponibilité en direct.</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-700 font-mono text-[10px] px-3 py-1 rounded-lg">⚙️ Automatisation active</span>
            </div>

            <div className="relative border-l-2 border-neutral-200 pl-6 ml-3 space-y-8 text-xs">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">1</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Renseigner le Rapport de Diagnostic</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    À l'intérieur du bon d'intervention actif, complétez la check-list des points de contrôle effectués et renseignez les notes de diagnostic ou observations de réparation finales.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-chery-red text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">2</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900">Signer et Clôturer le Bon</h4>
                  <p className="text-neutral-500 leading-relaxed max-w-3xl">
                    Saisissez la signature du technicien intervenant et passez le statut de l'intervention à <strong className="text-emerald-600">"Terminée"</strong> ou <strong className="text-emerald-600">"Clôturée"</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-5 w-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white">✓</div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-emerald-700">Remise en Service & Imputation Financière</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 max-w-3xl mt-2">
                    <div className="space-y-1">
                      <strong className="text-slate-800 text-[10px] uppercase font-mono block">💰 Main d'œuvre</strong>
                      <p className="text-neutral-600 text-[11px]">Le coût de la main d'œuvre de l'intervention est soustrait du budget restant de l'atelier.</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-slate-800 text-[10px] uppercase font-mono block">✅ Disponibilité</strong>
                      <p className="text-neutral-600 text-[11px]">L'équipement est automatiquement libéré et marqué à nouveau comme <strong className="text-emerald-600">"Opérationnel"</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bento Grid layout for concise reference modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Profils et Rôles (WITH PIN PROTECTION CHECK!) */}
        <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 shadow-premium space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-chery-red" />
              1. Profils & Codes d'Accès Sécurisés
            </h3>
            {isAdmin ? (
              <span className="bg-emerald-500/10 text-emerald-700 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                🔓 Vue Admin (PINs Affichés)
              </span>
            ) : (
              <span className="bg-red-500/10 text-chery-red font-mono font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                🔒 Vue Sécurisée (PINs Masqués)
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            La GMAO est cloisonnée par rôles. Les actions de modification requièrent de s'authentifier à l'aide de votre code PIN personnel.
          </p>
          <div className="space-y-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-neutral-100 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Chef d'Atelier (6 divisions)</span>
                <span className="text-neutral-500 text-[11px]">Création d'interventions correctives, planification et suivi de son atelier.</span>
              </div>
              <span className="bg-blue-500/10 text-blue-600 font-mono font-bold px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                PIN: {isAdmin ? "0000" : "••••"}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-neutral-100 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Administrateur (M. Ahmed Amine)</span>
                <span className="text-neutral-500 text-[11px]">Pilotage global, configuration budgétaire, d'équipements et logs d'audit.</span>
              </div>
              <span className="bg-red-500/10 text-chery-red font-mono font-bold px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                PIN: {isAdmin ? "1924" : "••••"}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-neutral-100 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Magasinier (Pièces & Stocks)</span>
                <span className="text-neutral-500 text-[11px]">Sorties de pièces, réapprovisionnements et fiches articles.</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 font-mono font-bold px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                PIN: {isAdmin ? "2026" : "••••"}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-neutral-100 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Superviseur (Direction)</span>
                <span className="text-neutral-500 text-[11px]">Lecture seule globale pour présentation en comité.</span>
              </div>
              <span className="bg-amber-500/10 text-amber-600 font-mono font-bold px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                PIN: {isAdmin ? "1234" : "••••"}
              </span>
            </div>
          </div>

          {!isAdmin && (
            <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-2xl text-[11px] text-neutral-600 leading-relaxed flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-chery-red shrink-0 mt-0.5" />
              <span>
                Pour des raisons de sécurité, les codes PIN ne sont pas visibles sur votre session. <strong>Veuillez contacter l'Administrateur (M. Ahmed Amine)</strong> pour obtenir votre code PIN d'atelier.
              </span>
            </div>
          )}
        </div>

        {/* Module 2: Règles Métier Critiques */}
        <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 shadow-premium space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-chery-red" />
            2. Directives & Règles Métier Systèmes
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Consignes strictes d'exploitation de la GMAO pour garantir l'intégrité des données de maintenance.
          </p>
          <div className="space-y-3">
            <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-100/50 space-y-1">
              <span className="font-bold text-xs text-chery-red block flex items-center gap-1.5">
                ⚠️ Statut "Hors Service" (Déclassement)
              </span>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Tout équipement obsolète ou définitivement arrêté doit être passé au statut <strong>"Hors Service"</strong>. La GMAO l'exclut automatiquement de tous les calculs de disponibilité technique et MTBF pour éviter les biais statistiques.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1">
              <span className="font-bold text-xs text-emerald-700 block flex items-center gap-1.5">
                💰 Clôture d'Intervention & Imputation Budgétaire
              </span>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                À la clôture d'une fiche d'intervention (statut <strong>"Terminé"</strong>), le coût total de l'intervention (fournitures + main d'œuvre) est automatiquement imputé sur le budget annuel de l'atelier concerné.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-1">
              <span className="font-bold text-xs text-blue-700 block flex items-center gap-1.5">
                🛒 Demandes d'Achat (DAs)
              </span>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Les chefs d'ateliers peuvent soumettre des demandes d'achat en toute autonomie. L'affectation d'un fournisseur agréé est facultative à la création et peut être complétée par l'administrateur.
              </p>
            </div>
          </div>
        </div>

        {/* Module 3: Interfaçage Excel */}
        <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 shadow-premium space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            3. Interfaçage Excel & Formules
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Pour assurer la liaison avec votre outil de reporting classique, copier les formules suivantes pour reproduire les statistiques de cette GMAO dans vos fichiers Excel :
          </p>
          <div className="space-y-2 font-mono text-[10px] text-slate-700">
            <div className="bg-slate-50 p-3 rounded-2xl border border-neutral-100">
              <span className="font-sans font-bold text-slate-900 block text-[11px] mb-1">Taux de Disponibilité :</span>
              <code>=NB.SI(D:D; "Opérationnel")/NB.SI.ENS(D:D; "&lt;&gt;Hors Service")</code>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-neutral-100">
              <span className="font-sans font-bold text-slate-900 block text-[11px] mb-1">MTTR Moyen (Heures) :</span>
              <code>=SOMME.SI.ENS(E:E; B:B; "Correctif"; F:F; "Terminé")/NB.SI.ENS(B:B; "Correctif"; F:F; "Terminé")</code>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-neutral-100">
              <span className="font-sans font-bold text-slate-900 block text-[11px] mb-1">Consommation Budgétaire :</span>
              <code>=SOMME.SI.ENS(G:G; H:H; "Atelier Mécanique")</code>
            </div>
          </div>
        </div>

        {/* Module 4: Architecture Technique */}
        <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 shadow-premium space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Terminal className="h-5 w-5 text-slate-700" />
              4. Installation & Mode Hors-Ligne
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              La GMAO est conçue pour fonctionner avec un maximum d'indépendance technologique, garantissant sa durabilité.
            </p>
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-slate-100 text-[11px] font-bold flex items-center justify-center text-slate-700 shrink-0">1</span>
                <div>
                  <strong className="text-slate-800">Aucune dépendance Cloud complexe :</strong>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Le système est entièrement autonome et stocke les informations en LocalStorage sécurisé directement sur la machine.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-slate-100 text-[11px] font-bold flex items-center justify-center text-slate-700 shrink-0">2</span>
                <div>
                  <strong className="text-slate-800">Sauvegarde automatique :</strong>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Un pont d'écriture sauvegarde automatiquement la base de données sur disque local toutes les minutes en tâche de fond.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-slate-100 text-[11px] font-bold flex items-center justify-center text-slate-700 shrink-0">3</span>
                <div>
                  <strong className="text-slate-800">Mode portable :</strong>
                  <p className="text-[11px] text-neutral-500 mt-0.5">L'application compilée peut être copiée sur clé USB pour une exécution 100% hors-ligne dans des ateliers isolés.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 text-center text-[10px] text-neutral-400 font-mono">
            STA Tunisie • Ingénierie de Maintenance & GMAO 2.0
          </div>
        </div>

      </div>
    </div>
  );
}
