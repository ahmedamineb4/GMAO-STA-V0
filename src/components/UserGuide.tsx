import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Presentation,
  BookOpen,
  Wrench,
  Package,
  FileSpreadsheet,
  Download,
  Terminal,
  Server,
  Users,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Cpu
} from "lucide-react";

interface UserGuideProps {
  onNavigate?: (tab: string) => void;
}

export default function UserGuide({ onNavigate }: UserGuideProps) {
  const [slideMode, setSlideMode] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      title: "GMAO • STA Chery Tunisie",
      subtitle: "Portail Moderne de Gestion de Maintenance Assistée par Ordinateur",
      icon: Presentation,
      bg: "from-neutral-900 to-neutral-800 text-white",
      content: (
        <div className="space-y-6">
          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-3">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Objectif Stratégique
            </h4>
            <p className="text-neutral-200 text-xs leading-relaxed">
              Mettre en place un outil d'ingénierie de maintenance centralisé pour le parc d'équipements de la <strong>STA (Société Tunisienne d'Automobiles)</strong>, concessionnaire officiel de la marque <strong>Chery en Tunisie</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-lg block mb-1">📈</span>
              <h5 className="font-bold text-xs text-white mb-1">Disponibilité</h5>
              <p className="text-[11px] text-neutral-300">Suivi rigoureux du taux de disponibilité globale et par atelier (excluant les matériels Hors Service).</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-lg block mb-1">🔧</span>
              <h5 className="font-bold text-xs text-white mb-1">Zéro Papier</h5>
              <p className="text-[11px] text-neutral-300">Digitalisation complète du cycle d'intervention, de la demande de réparation jusqu'à la clôture.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-lg block mb-1">📦</span>
              <h5 className="font-bold text-xs text-white mb-1">Gestion de Stock</h5>
              <p className="text-[11px] text-neutral-300">Sortie automatique des pièces de rechange et pré-calcul des coûts de maintenance réels.</p>
            </div>
          </div>

          <div className="pt-2 text-center text-[10px] text-neutral-400 font-mono">
            Conçu & Développé par Ahmed Amine Ben Salah • Responsable Maintenance & Parc
          </div>
        </div>
      )
    },
    {
      title: "1. Profils d'Accès & Sécurité",
      subtitle: "Un système sécurisé par profils pour chaque acteur des ateliers",
      icon: Users,
      bg: "from-blue-900 to-neutral-900 text-white",
      content: (
        <div className="space-y-4">
          <p className="text-neutral-200 text-xs">
            L'application propose des profils avec des codes d'accès sécurisés (PIN) pour simuler le flux opérationnel réel en atelier :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-400">👤 M. Ahmed Amine (Admin)</span>
                <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Accès Administrateur</span>
              </div>
              <p className="text-[11px] text-neutral-300">Droits illimités : Modification du budget annuel, configuration de la sécurité, ajout et suppression de données, réinitialisation du système.</p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">👤 Superviseur (Direction)</span>
                <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Accès Consultation</span>
              </div>
              <p className="text-[11px] text-neutral-300">Lecture seule globale. Idéal pour présenter les tableaux de bord en réunion sans risquer de modifier accidentellement les données.</p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-400">👤 Magasinier (Stock)</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Accès Stock & Pièces</span>
              </div>
              <p className="text-[11px] text-neutral-300">Gestion des pièces détachées, réapprovisionnements manuels, saisie de nouveaux articles et contrôle du stock d'alerte.</p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-400">👤 Chefs d'Atelier (6 ateliers)</span>
                <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Accès Atelier</span>
              </div>
              <p className="text-[11px] text-neutral-300">Service Rapide, Mécanique, Diagnostic, Carrosserie, Lavage, Bâtiment. Ne voient et ne gèrent que les équipements et interventions de leur atelier respectif.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Gestion du Parc Équipements",
      subtitle: "Fiche technique, taux de fonctionnement et exclusion de calcul",
      icon: Wrench,
      bg: "from-neutral-800 to-stone-900 text-white",
      content: (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs space-y-2">
            <h5 className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Règle métier importante (Hors Stock / Hors Service)
            </h5>
            <p className="text-neutral-200 leading-relaxed text-[11px]">
              Lorsqu'un équipement est obsolète, démonté ou définitivement arrêté, changez son état en <strong>"Hors Service"</strong>. Le système GMAO va l'exclure automatiquement de tous les calculs de disponibilité et de MTBF afin de ne pas fausser vos indicateurs de performance (KPI).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h5 className="font-bold text-white border-b border-white/10 pb-1">➕ Ajouter un Équipement</h5>
              <ul className="list-disc list-inside space-y-1 text-neutral-300 text-[11px]">
                <li>Accédez à l'onglet <strong className="text-white">"Parc Équipements"</strong></li>
                <li>Cliquez sur <strong className="text-white">"+ Ajouter un Équipement"</strong></li>
                <li>Renseignez le Code unique, l'Atelier d'affectation, la date d'installation et la criticité (A, B ou C) pour optimiser les préventions.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white border-b border-white/10 pb-1">💡 Indicateurs Clés (KPI)</h5>
              <ul className="list-disc list-inside space-y-1 text-neutral-300 text-[11px]">
                <li><strong className="text-white">Disponibilité :</strong> Pourcentage basé sur les états des machines actives (Opérationnel=100%, Dégradé=90%, En Maintenance=30%, En Panne=0%).</li>
                <li><strong className="text-white">MTTR :</strong> Temps Moyen de Réparation des pannes correctives.</li>
                <li><strong className="text-white">MTBF :</strong> Temps Moyen entre pannes.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Cycle de Vie des Interventions",
      subtitle: "Du signalement de panne jusqu'à la clôture de la fiche de travaux",
      icon: CheckCircle2,
      bg: "from-emerald-900 to-neutral-900 text-white",
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-neutral-200">
            Le système gère l'ensemble du cycle de vie des travaux avec une intégration intelligente du stock de pièces de rechange :
          </p>

          <div className="relative border-l-2 border-emerald-500/30 pl-5 ml-2.5 space-y-4">
            <div className="relative">
              <div className="absolute -left-[27px] top-0.5 bg-emerald-500 h-3 w-3 rounded-full border-2 border-white"></div>
              <h5 className="font-bold text-white text-xs">Étape 1 : Création de la fiche d'intervention</h5>
              <p className="text-neutral-300 text-[11px]">Indiquer si l'intervention est Préventive ou Corrective (Panne), sélectionner l'équipement ciblé, le niveau d'urgence, et déclarer les techniciens affectés.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[27px] top-0.5 bg-emerald-500 h-3 w-3 rounded-full border-2 border-white"></div>
              <h5 className="font-bold text-white text-xs">Étape 2 : Réquisition de pièces de rechange</h5>
              <p className="text-neutral-300 text-[11px]">Si des pièces du magasin sont nécessaires, ajoutez-les directement dans le formulaire. Le système vérifie en temps réel le stock restant.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[27px] top-0.5 bg-emerald-500 h-3 w-3 rounded-full border-2 border-white"></div>
              <h5 className="font-bold text-white text-xs">Étape 3 : Sortie automatique & Clôture</h5>
              <p className="text-neutral-300 text-[11px]">Lors de la clôture (statut "Terminé"), les quantités de pièces sont soustraites du stock physique. Le budget de l'atelier correspondant est mis à jour instantanément avec le coût total (Pièces + Main d'œuvre).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Gestion de Stock & Approvisionnement",
      subtitle: "Contrôles de stock de sécurité et automatisation des alertes",
      icon: Package,
      bg: "from-purple-900 to-neutral-900 text-white",
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-neutral-200">
            Le magasin centralise toutes les pièces de rechange requises pour la maintenance du parc :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-base">🚨</span>
              <h5 className="font-bold text-white text-[11px]">Alerte de Stock</h5>
              <p className="text-[10px] text-neutral-300">Si le stock actuel tombe en dessous du stock minimum, une étiquette rouge "ALERTE STOCK" s'affiche automatiquement pour commander en urgence.</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-base">📝</span>
              <h5 className="font-bold text-white text-[11px]">Demande d'Achat (DA)</h5>
              <p className="text-[10px] text-neutral-300">Depuis l'onglet "Achats", créez une DA formelle associée à un fournisseur agréé (SOCO, Chery Parts, etc.) pour approbation par l'administrateur.</p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-base">⚡</span>
              <h5 className="font-bold text-white text-[11px]">Réapprovisionnement</h5>
              <p className="text-[10px] text-neutral-300">Lorsqu'une DA passe à l'état "Approuvé", le magasinier peut cliquer sur "Réceptionner" pour incrémenter directement le stock physique.</p>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2.5 items-center">
            <span className="text-amber-400 text-lg">💡</span>
            <p className="text-neutral-300 text-[11px]">
              La liste des fournisseurs contient leurs coordonnées complètes pour envoyer des demandes de devis d'un seul clic.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "5. Rapports, Exports & Excel",
      subtitle: "Génération de rapports d'ingénierie et exportations Excel",
      icon: FileSpreadsheet,
      bg: "from-emerald-800 to-neutral-900 text-white",
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-neutral-200 leading-relaxed">
            Pour assurer la liaison avec l'ingénierie de maintenance et votre direction, l'onglet <strong>"Rapports & Export"</strong> propose un support complet et robuste :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Téléchargements Directs Excel
              </h5>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Pas de fichiers vides ! En cliquant sur <strong>"Exporter les Données (.xlsx)"</strong>, le système compile vos équipements, vos interventions, vos stocks et vos indicateurs financiers dans un fichier Excel multi-feuilles formaté et exploitable immédiatement.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-400" /> Support d'Architecture Excel
              </h5>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Le système affiche également les formules de calcul réelles (SOMME, NB.SI, RECHERCHEV) à copier-coller dans votre tableau Excel interne afin de conserver une parité parfaite entre cette application web et votre reporting papier habituel.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "6. Guide d'Installation & Déploiement",
      subtitle: "Comment installer l'application localement ou en entreprise en 2 minutes",
      icon: Terminal,
      bg: "from-neutral-900 to-red-950 text-white",
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-neutral-200">
            L'application est entièrement autonome et conçue avec des technologies légères (React + Vite + Tailwind CSS) :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-2 font-mono">
              <h5 className="font-bold text-white text-[11px] font-sans flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-neutral-400" /> Mode Local standard
              </h5>
              <div className="text-[10px] text-neutral-300 space-y-1">
                <div># 1. Installer Node.js sur le PC</div>
                <div># 2. Ouvrir le dossier et lancer :</div>
                <div className="text-amber-400">npm install</div>
                <div># 3. Lancer le serveur local :</div>
                <div className="text-amber-400">npm run dev</div>
                <div># L'application s'ouvre sur :</div>
                <div className="text-emerald-400">http://localhost:3000</div>
              </div>
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-2">
              <h5 className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-neutral-400" /> Mode Hors-Ligne & Clé USB
              </h5>
              <p className="text-neutral-300 text-[10px] leading-relaxed">
                Vous pouvez exécuter <strong>npm run build</strong> pour compiler l'ensemble du projet en un seul dossier statique <strong className="text-white">"dist/"</strong>. 
                <br /><br />
                Ce dossier peut être copié sur une clé USB ou stocké sur un serveur de fichiers interne STA sans aucune connexion Internet ni installation technique ! Elle fonctionne 100% hors-ligne.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const ActiveSlideIcon = slides[currentSlide].icon;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
            <Presentation className="h-5 w-5 text-chery-red" />
            Support de Formation & Manuel d'Utilisation
          </h2>
          <p className="text-xs text-neutral-400">
            Tout comprendre sur l'application GMAO de la STA Chery Tunisie, de son fonctionnement à son installation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setSlideMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              slideMode
                ? "bg-white text-neutral-800 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Presentation className="h-3.5 w-3.5" />
            Mode Présentation (Slides)
          </button>
          <button
            onClick={() => setSlideMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !slideMode
                ? "bg-white text-neutral-800 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Manuel Complet (Texte)
          </button>
        </div>
      </div>

      {slideMode ? (
        /* Slides Presentation UI */
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-md overflow-hidden flex flex-col min-h-[500px]">
          {/* Slide Stage */}
          <div className={`flex-1 p-8 md:p-12 bg-gradient-to-br ${slides[currentSlide].bg} flex flex-col justify-center transition-all duration-300 relative`}>
            {/* Background Accent Logo */}
            <div className="absolute right-8 top-8 opacity-10 pointer-events-none">
              <ActiveSlideIcon className="h-40 w-40" />
            </div>

            <div className="max-w-3xl space-y-6 z-10">
              <div className="space-y-2">
                <span className="bg-white/15 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white/90">
                  Diapositive {currentSlide + 1} sur {slides.length}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-white/70 text-sm md:text-base font-medium">
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                {slides[currentSlide].content}
              </div>
            </div>
          </div>

          {/* Slide Controls */}
          <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? "w-8 bg-chery-red" : "w-2.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  aria-label={`Aller à la diapositive ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={handlePrev}
                className="p-2.5 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                title="Diapositive précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Flat Manual View UI */
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 md:p-10 space-y-10">
          <div className="border-b border-neutral-100 pb-6 space-y-2">
            <h3 className="text-2xl font-black text-neutral-800">
              Manuel Complet d'Utilisation de l'Application GMAO
            </h3>
            <p className="text-xs text-neutral-400">
              Ce document fournit une vue d'ensemble détaillée pour utiliser, configurer et déployer cette solution dans vos ateliers.
            </p>
          </div>

          {slides.map((slide, idx) => {
            const Icon = slide.icon;
            return (
              <div key={idx} className="space-y-4 border-b border-neutral-100 pb-8 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 border border-neutral-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-neutral-800">
                      {slide.title}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 text-neutral-800">
                  {slide.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
