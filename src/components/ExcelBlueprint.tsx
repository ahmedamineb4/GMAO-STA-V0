/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  BookOpen,
  HelpCircle,
  CheckCircle,
  Table,
  Cpu,
  Info,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Zap,
  Sparkles
} from "lucide-react";
import { generateSTAExcelFile } from "../utils/excelGenerator";
import { Equipment, Intervention, SparePart, MaintenanceContract, BudgetYear, ComplianceCheck, Vendor } from "../types";

interface ExcelBlueprintProps {
  equipments: Equipment[];
  interventions: Intervention[];
  spareParts: SparePart[];
  contracts: MaintenanceContract[];
  vendors: Vendor[];
  compliance: ComplianceCheck[];
  budget: BudgetYear;
}

export default function ExcelBlueprint({
  equipments,
  interventions,
  spareParts,
  contracts,
  vendors,
  compliance,
  budget
}: ExcelBlueprintProps) {
  const [activeTab, setActiveTab] = useState<string>("equipements");
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleDownload = () => {
    generateSTAExcelFile(equipments, interventions, spareParts, contracts, vendors, compliance, budget);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const sheetsSpecs = [
    {
      id: "equipements",
      name: "1. EQUIPEMENTS",
      role: "Inventaire et fiche d'identité technique de l'ensemble du parc machines et outillages de la concession.",
      dropdowns: [
        { name: "Atelier / Service", values: ["Service Rapide", "Atelier Mécanique", "Atelier Diagnostic", "Carrosserie", "Lavage", "Réception Après-Vente", "Magasin Pièces de Rechange", "Maintenance Bâtiment"] },
        { name: "Statut", values: ["Opérationnel", "Dégradé", "En Maintenance", "En Panne"] }
      ],
      columns: [
        { col: "A", name: "Code Équipement", type: "Texte unique", validation: "Longueur de texte 4-10 (ex: EQ-SR-01)", formula: "Saisie manuelle" },
        { col: "B", name: "Nom de l'Équipement", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "C", name: "Atelier / Service", type: "Texte (Liste)", validation: "Validation par liste déroulante des services", formula: "Liste déroulante" },
        { col: "D", name: "Statut de Fonctionnement", type: "Texte (Liste)", validation: "Validation par liste déroulante des statuts", formula: "Liste déroulante" },
        { col: "E", name: "Date d'Achat", type: "Date", validation: "Format Date (JJ/MM/AAAA)", formula: "Saisie manuelle" },
        { col: "F", name: "Date Fin Garantie", type: "Date", validation: "Format Date (JJ/MM/AAAA)", formula: "Saisie manuelle" },
        { col: "G", name: "Prix d'Achat (TND)", type: "Décimal", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "H", name: "Localisation", type: "Texte", validation: "Saisie libre (ex: Baie 1)", formula: "Saisie manuelle" },
        { col: "I", name: "Numéro de Série", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "J", name: "Critique ?", type: "Texte (OUI/NON)", validation: "Validation par liste {OUI;NON}", formula: "Saisie manuelle" },
        { col: "K", name: "Dernier Contrôle", type: "Date", validation: "Format Date", formula: "Saisie manuelle" },
        { col: "L", name: "Intervalle (Mois)", type: "Entier", validation: "Nombre supérieur ou égal à 0", formula: "Saisie manuelle" },
        { col: "M", name: "MTBF Cible (h)", type: "Entier", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "N", name: "MTTR Cible (h)", type: "Entier", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "O", name: "Statut Garantie", type: "Texte calculé", validation: "Automatique", formula: '=SI(F2<AUJOURDHUI();"Garantie Expirée";"Sous Garantie")' }
      ],
      formatting: [
        { condition: "Équipement en Panne", formula: '=$D2="En Panne"', style: "Remplissage rouge clair (#FFEBEC), texte rouge foncé (#8F101B)" },
        { condition: "Équipement Critique", formula: '=$J2="OUI"', style: "Bordure épaisse rouge ou texte rouge en gras" },
        { condition: "Garantie Expirée", formula: '=$O2="Garantie Expirée"', style: "Texte gris italique" }
      ]
    },
    {
      id: "interventions",
      name: "2. INTERVENTIONS",
      role: "Historique complet de toutes les opérations de maintenance curative, préventive et réglementaire effectuées sur la concession.",
      dropdowns: [
        { name: "Type", values: ["Préventif", "Correctif", "Réglementaire"] },
        { name: "Statut", values: ["Planifié", "En cours", "Terminé", "Annulé"] }
      ],
      columns: [
        { col: "A", name: "ID Intervention", type: "Texte", validation: "ex: INT-2026-001", formula: "Saisie manuelle" },
        { col: "B", name: "Code Équipement", type: "Texte", validation: "Doit exister dans EQUIPEMENTS (Validation via RECHV)", formula: "Saisie manuelle ou Liste déroulante" },
        { col: "C", name: "Type d'Intervention", type: "Texte (Liste)", validation: "Liste déroulante des types", formula: "Liste déroulante" },
        { col: "D", name: "Titre / Descriptif", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "E", name: "Date d'Intervention", type: "Date", validation: "Format Date (JJ/MM/AAAA)", formula: "Saisie manuelle" },
        { col: "F", name: "Durée (Heures)", type: "Décimal", validation: "Nombre supérieur à 0", formula: "Saisie manuelle" },
        { col: "G", name: "Coût Pièces (TND)", type: "Décimal", validation: "Nombre supérieur ou égal à 0", formula: "Saisie manuelle" },
        { col: "H", name: "Coût M.O. (TND)", type: "Décimal", validation: "Nombre supérieur ou égal à 0", formula: "Saisie manuelle" },
        { col: "I", name: "Coût Total (TND)", type: "Décimal calculé", validation: "Automatique", formula: "=G2+H2" },
        { col: "J", name: "Technicien / Prestataire", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "K", name: "Statut du Bon", type: "Texte (Liste)", validation: "Liste déroulante des statuts", formula: "Liste déroulante" },
        { col: "L", name: "Notes de Diagnostic", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" }
      ],
      formatting: [
        { condition: "Intervention en cours", formula: '=$K2="En cours"', style: "Remplissage bleu très clair, texte bleu foncé" },
        { condition: "Intervention Planifiée", formula: '=$K2="Planifié"', style: "Remplissage jaune très clair, texte orange" },
        { condition: "Coût élevé (> 1000 TND)", formula: '=$I2>1000', style: "Texte rouge foncé en gras, avec icône de mise en garde" }
      ]
    },
    {
      id: "pieces",
      name: "3. PIECES_RECHANGE",
      role: "Suivi du stock physique, des valeurs financières d'inventaire et génération automatique des demandes d'achats.",
      dropdowns: [
        { name: "Alerte Réappro", values: ["Alerte Stock Bas", "Stock OK"] }
      ],
      columns: [
        { col: "A", name: "Code Pièce", type: "Texte unique", validation: "ex: PR-SR-FL1", formula: "Saisie manuelle" },
        { col: "B", name: "Désignation", type: "Texte", validation: "Saisie libre", formula: "Saisie manuelle" },
        { col: "C", name: "Stock Actuel", type: "Entier", validation: "Nombre supérieur ou égal à 0", formula: "Saisie physique" },
        { col: "D", name: "Seuil d'Alerte (Min)", type: "Entier", validation: "Nombre supérieur à 0", formula: "Déterminé par criticité" },
        { col: "E", name: "Prix Unitaire (TND)", type: "Décimal", validation: "Nombre supérieur à 0", formula: "Prix d'achat fournisseur" },
        { col: "F", name: "Alerte Réappro", type: "Texte calculé", validation: "Automatique", formula: '=SI(C2<=D2;"Alerte Stock Bas";"Stock OK")' },
        { col: "G", name: "Valeur Stock (TND)", type: "Décimal calculé", validation: "Automatique", formula: "=C2*E2" },
        { col: "H", name: "Emplacement Magasin", type: "Texte", validation: "Saisie libre (ex: Rayon A-4)", formula: "Saisie manuelle" },
        { col: "I", name: "Catégorie", type: "Texte", validation: "ex: Hydraulique, Électricité", formula: "Saisie manuelle" }
      ],
      formatting: [
        { condition: "Stock Critique / À commander", formula: '=$F2="Alerte Stock Bas"', style: "Remplissage rouge clair, texte rouge gras (Indique une commande immédiate)" },
        { condition: "Stock à Zéro", formula: '=$C2=0', style: "Remplissage rouge vif et texte blanc en gras" }
      ]
    },
    {
      id: "compliance",
      name: "4. CONTROLES_REGLEMENTAIRES",
      role: "Registre de conformité légale et suivi des PV d'épreuves obligatoires délivrés par les organismes certifiés.",
      dropdowns: [
        { name: "Statut", values: ["Conforme", "Non conforme", "En attente d'action"] }
      ],
      columns: [
        { col: "A", name: "ID Contrôle", type: "Texte", validation: "ex: CMP-2026-01", formula: "Saisie manuelle" },
        { col: "B", name: "Code Équipement", type: "Texte", validation: "Doit exister dans EQUIPEMENTS", formula: "Saisie manuelle" },
        { col: "C", name: "Libellé du Contrôle", type: "Texte", validation: "Saisie libre (ex: Épreuve hydraulique)", formula: "Saisie manuelle" },
        { col: "D", name: "Organisme Agrée", type: "Texte (Liste)", validation: "Validation Apave, SGS, etc.", formula: "Saisie manuelle" },
        { col: "E", name: "Date de l'Inspection", type: "Date", validation: "Format Date", formula: "Saisie physique" },
        { col: "F", name: "Prochaine Date", type: "Date", validation: "Date d'échéance future", formula: "Calculé ou Saisie" },
        { col: "G", name: "Statut de Conformité", type: "Texte (Liste)", validation: "Liste déroulante de conformité", formula: "Liste déroulante" },
        { col: "H", name: "Référence Rapport", type: "Texte", validation: "Saisie de la réf du PV physique", formula: "Saisie manuelle" },
        { col: "I", name: "Alerte Échéance", type: "Texte calculé", validation: "Automatique", formula: '=SI(F2<AUJOURDHUI();"EXPIRE / REFAIRE";SI(F2<AUJOURDHUI()+30;"Échéance Proche (<30j)";"À jour"))' }
      ],
      formatting: [
        { condition: "Contrôle Échu (Périmé)", formula: '=$F2<AUJOURDHUI()', style: "Remplissage rouge foncé, texte blanc gras. Risque juridique !" },
        { condition: "Échéance à moins de 30 jours", formula: '=$F2<AUJOURDHUI()+30', style: "Remplissage orange clair, texte orange foncé" }
      ]
    },
    {
      id: "budget",
      name: "5. SUIVI_BUDGETAIRE",
      role: "Maîtrise financière du budget annuel de maintenance par service avec alerte automatique de dépassement.",
      dropdowns: [],
      columns: [
        { col: "A", name: "Atelier / Service", type: "Texte unique", validation: "Uniques par ligne", formula: "Saisie des 8 ateliers" },
        { col: "B", name: "Budget Alloué (TND)", type: "Décimal", validation: "Nombre supérieur à 0", formula: "Saisie de la direction générale" },
        { col: "C", name: "Dépenses Actuelles (TND)", type: "Décimal calculé", validation: "Automatique", formula: '=SOMME.SI(INTERVENTIONS!B:B;EQUIPEMENTS!A:A;INTERVENTIONS!I:I)' },
        { col: "D", name: "Reste Budget (TND)", type: "Décimal calculé", validation: "Automatique", formula: "=B2-C2" },
        { col: "E", name: "Alerte Dépassement", type: "Texte calculé", validation: "Automatique", formula: '=SI(C2>B2;"DEPASSEMENT !!!";"Budget OK")' },
        { col: "F", name: "Taux Consommation (%)", type: "Pourcentage", validation: "Automatique", formula: "=C2/B2" }
      ],
      formatting: [
        { condition: "Budget Dépassé !", formula: '=$E2="DEPASSEMENT !!!"', style: "Remplissage rouge vif, texte rouge gras" },
        { condition: "Consommation saine (< 80%)", formula: '=$F2<0.8', style: "Texte vert" }
      ]
    }
  ];

  const currentSheet = sheetsSpecs.find((s) => s.id === activeTab) || sheetsSpecs[0];

  return (
    <div className="space-y-6">
      {/* Excel Download Callout */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-red-950 text-white rounded-2xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-chery-red via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-chery-red font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 animate-pulse-subtle" />
              Générateur Automatique de Fichier Excel
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Télécharger Votre Classeur Excel Clé en Main
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Ne perdez pas de temps à ressaisir toutes les colonnes et formules.
              Nous avons programmé un bouton qui génère instantanément un classeur <strong>.xlsx d'origine</strong> pré-configuré avec les 6 feuilles demandées,
              tous les codes équipements, pièces de rechange, contrats et budgets de STA Tunisie, incluant les formules Excel natives (SI, IF, TODAY, SUM).
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2.5 bg-chery-red hover:bg-chery-dark text-white px-6 py-4 rounded-xl font-bold text-sm shadow-xl hover:shadow-red-900/30 transition-all cursor-pointer group self-stretch md:self-auto"
          >
            <Download className="h-5 w-5 animate-bounce" />
            Télécharger le Modèle Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Sheet specifications segment */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-chery-red" />
            Guide et Spécifications Techniques du Classeur Excel
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Parcourez ci-dessous la configuration technique exacte, feuille par feuille, pour recréer vous-même ce classeur dans Microsoft Excel ou en comprendre les relations d'ingénierie.
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="flex flex-wrap border-b border-neutral-100 gap-1.5 pb-2">
          {sheetsSpecs.map((sh) => (
            <button
              key={sh.id}
              onClick={() => setActiveTab(sh.id)}
              className={`text-xs font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
                activeTab === sh.id
                  ? "bg-chery-red text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              {sh.name}
            </button>
          ))}
        </div>

        {/* Specs Content */}
        <div className="space-y-5 animate-fade-in">
          {/* Objectif */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs">
            <span className="font-bold text-neutral-400 uppercase tracking-wider block text-[10px]">
              Rôle de cette feuille Excel
            </span>
            <p className="text-neutral-700 font-medium mt-1 leading-relaxed">{currentSheet.role}</p>
          </div>

          {/* List validation fields */}
          {currentSheet.dropdowns.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-neutral-400" />
                Listes Déroulantes & Validation de Données
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSheet.dropdowns.map((drop, idx) => (
                  <div key={idx} className="bg-neutral-50/50 p-3 rounded-lg border border-neutral-100 text-xs">
                    <span className="font-bold text-neutral-600 block mb-1">Colonne: {drop.name}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {drop.values.map((v, i) => (
                        <span key={i} className="bg-white px-2 py-0.5 rounded border border-neutral-150 text-[10px] font-mono text-neutral-600">
                          {v}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-2">
                      Astuce Excel : Sélectionner la colonne &rarr; Données &rarr; Validation des données &rarr; Autoriser : Liste &rarr; Source : Saisir les valeurs séparées par un point-virgule (ou référencer une plage).
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Columns Specifications Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Table className="h-3.5 w-3.5 text-neutral-400" />
              Structure des colonnes du Tableau
            </h4>
            <div className="overflow-x-auto border border-neutral-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-bold">
                    <th className="py-2.5 px-4 text-center">Col.</th>
                    <th className="py-2.5 px-4">Nom du Champ / En-tête</th>
                    <th className="py-2.5 px-4">Type de Donnée</th>
                    <th className="py-2.5 px-4">Validation Excel / Consignes</th>
                    <th className="py-2.5 px-4">Formule Excel (Syntaxe FR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {currentSheet.columns.map((col, index) => {
                    const isFormula = col.formula.startsWith("=");

                    return (
                      <tr key={index} className="hover:bg-neutral-50/20 font-medium">
                        <td className="py-2.5 px-4 text-center font-bold text-neutral-400 font-mono">
                          {col.col}
                        </td>
                        <td className="py-2.5 px-4 text-neutral-800 font-bold">{col.name}</td>
                        <td className="py-2.5 px-4 text-neutral-500 font-semibold">{col.type}</td>
                        <td className="py-2.5 px-4 text-neutral-400 text-[11px] leading-relaxed">
                          {col.validation}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-700">
                          {isFormula ? (
                            <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded border border-neutral-150">
                              <span className="text-chery-red select-all">{col.formula}</span>
                              <button
                                onClick={() => copyToClipboard(col.formula, `${currentSheet.id}-${col.col}`)}
                                className="ml-auto text-[10px] bg-neutral-200 hover:bg-neutral-300 px-1 py-0.5 rounded text-neutral-600 transition-colors cursor-pointer"
                              >
                                {copiedFormula === `${currentSheet.id}-${col.col}` ? <Check className="h-3 w-3 text-green-600" /> : "Copier"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">{col.formula}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conditional Formatting Rules */}
          {currentSheet.formatting.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-neutral-400" />
                Mise en Forme Conditionnelle (Automatisation Visuelle)
              </h4>
              <div className="space-y-2.5">
                {currentSheet.formatting.map((fmt, idx) => (
                  <div key={idx} className="bg-neutral-50/30 p-3 rounded-lg border border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-medium">
                    <div className="space-y-0.5">
                      <span className="text-neutral-800 font-bold block">{fmt.condition}</span>
                      <span className="text-neutral-400 text-[10px] block">Règle par formule :</span>
                      <code className="text-chery-red bg-white px-1.5 py-0.5 rounded border border-neutral-150 font-mono text-[11px] block md:inline-block">
                        {fmt.formula}
                      </code>
                    </div>
                    <div className="p-2.5 bg-white border border-neutral-150 rounded text-neutral-600 text-[11px] max-w-sm">
                      <strong className="block text-neutral-700 mb-0.5">Format appliqué :</strong>
                      {fmt.style}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Best practices tips */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Recommandations d'Expert pour Ahmed Amine Ben Salah
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-600 leading-relaxed font-medium">
          <li className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1">
            <strong className="text-neutral-800 block text-[13px]">1. Protection du Classeur</strong>
            <span>
              Verrouillez les feuilles <strong>EQUIPEMENTS</strong>, <strong>SUIVI_BUDGETAIRE</strong> et <strong>CONTROLES_REGLEMENTAIRES</strong> en lecture seule pour l'équipe technique, et ne laissez modifiables que les colonnes de prélèvement de pièces et d'heures d'interventions. Cela évitera l'altération involontaire des formules complexes.
            </span>
          </li>
          <li className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1">
            <strong className="text-neutral-800 block text-[13px]">2. Utilisation des Formules Français vs Anglais</strong>
            <span>
              Si vous utilisez Excel configuré en Français, utilisez <strong>AUJOURDHUI()</strong>, <strong>SI()</strong>, et <strong>SOMME.SI()</strong>. Si votre version d'Excel est en Anglais, remplacez-les respectivement par <strong>TODAY()</strong>, <strong>IF()</strong>, et <strong>SUMIF()</strong>. Le modèle automatique .xlsx généré par notre bouton gère nativement cette traduction !
            </span>
          </li>
          <li className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1">
            <strong className="text-neutral-800 block text-[13px]">3. Liaison Magasin Pièces & Bons</strong>
            <span>
              L'intégration de la formule <code>SOMME.SI</code> dans le budget permet de lier dynamiquement le coût total de maintenance au prix de sortie des pièces détachées. Veillez à ce que les techniciens renseignent scrupuleusement le <strong>Code Équipement</strong> correct sur chaque bon pour une imputation analytique exacte !
            </span>
          </li>
          <li className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1">
            <strong className="text-neutral-800 block text-[13px]">4. Graphiques Croisés Dynamiques (GCD)</strong>
            <span>
              Pour reproduire les graphiques du tableau de bord Web dans votre Excel, sélectionnez le tableau d'interventions, allez dans <strong>Insertion &rarr; Tableau Croisé Dynamique</strong>. Placez "Service" en lignes, et "Coût Total" en valeurs. Cliquez ensuite sur "Graphique Croisé Dynamique (Histogramme)" pour obtenir le rapport analytique.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
