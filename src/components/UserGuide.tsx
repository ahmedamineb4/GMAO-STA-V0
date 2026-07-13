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
  const [docPage, setDocPage] = useState<number>(1);

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
      title: "2b. Pas-à-Pas : Créer un Équipement",
      subtitle: "Tutoriel détaillé pour ajouter un nouvel appareil dans la base",
      icon: Wrench,
      bg: "from-blue-950 to-neutral-900 text-white",
      content: (
        <div className="space-y-3 text-xs text-left">
          <p className="text-neutral-200 leading-relaxed">
            L'ajout d'un nouvel équipement est réservé à l'Administrateur (M. Ahmed Amine) et s'effectue en quelques étapes simples :
          </p>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 1 : Se connecter en mode Admin</span>
              <p className="text-neutral-300 text-[11px]">Assurez-vous de sélectionner le profil <strong className="text-white">Admin (Ahmed Amine)</strong> en haut à droite et de saisir le code PIN de sécurité correspondant.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 2 : Accéder à l'onglet Parc Équipements</span>
              <p className="text-neutral-300 text-[11px]">Cliquez sur l'onglet <strong className="text-white">"Parc Équipements"</strong> dans le menu de gauche.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 3 : Ouvrir le formulaire d'ajout</span>
              <p className="text-neutral-300 text-[11px]">Cliquez sur le bouton bleu <strong className="text-white">"+ Ajouter un Équipement"</strong> situé en haut à droite.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 4 : Renseigner les champs critiques</span>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Saisissez le <strong>Nom</strong> (ex: Pont Ciseaux 03), le <strong>Code Unique</strong> (ex: EQ-SR-03), choisissez l'<strong>Atelier</strong> (ex: Service Rapide) et la <strong>Criticité</strong> (A, B ou C). Renseignez aussi la date d'achat et la garantie pour un suivi complet.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 5 : Enregistrer la machine</span>
              <p className="text-neutral-300 text-[11px]">Cliquez sur <strong className="text-white">"Créer l'équipement"</strong>. L'appareil est sauvegardé instantanément.</p>
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
      title: "4b. Pas-à-Pas : Demande d'Achat (DA)",
      subtitle: "Tutoriel détaillé pour lancer et valider un réapprovisionnement",
      icon: Package,
      bg: "from-purple-950 to-neutral-900 text-white",
      content: (
        <div className="space-y-3 text-xs text-left">
          <p className="text-neutral-200 leading-relaxed">
            Le processus de commande et d'approvisionnement des pièces de rechange est structuré et sécurisé :
          </p>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 1 : Ouvrir le module Achats</span>
              <p className="text-neutral-300 text-[11px]">Accédez à l'onglet <strong className="text-white">"Achats & DAs"</strong> depuis le menu principal de gauche.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 2 : Créer une nouvelle Demande d'Achat</span>
              <p className="text-neutral-300 text-[11px]">Cliquez sur le bouton violet <strong className="text-white">"+ Nouvelle Demande d'Achat (DA)"</strong>.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 3 : Renseigner les détails de commande</span>
              <p className="text-neutral-300 text-[11px]">
                Sélectionnez la <strong>Pièce de rechange</strong> requise dans la liste déroulante, indiquez la <strong>Quantité</strong>, choisissez le <strong>Fournisseur agréé</strong>, définissez l'<strong>Atelier émetteur</strong> et le degré d'urgence.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 4 : Validation par l'Admin (Ahmed Amine)</span>
              <p className="text-neutral-300 text-[11px]">
                La demande apparaît dans la liste. L'administrateur l'examine puis clique sur <strong className="text-white">"Valider"</strong>. La DA passe alors au statut <strong className="text-blue-300">"Commandé"</strong>.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Étape 5 : Réception physique au magasin</span>
              <p className="text-neutral-300 text-[11px]">
                Une fois les pièces reçues dans les ateliers de Tunis, le magasinier ouvre la DA correspondante et clique sur le bouton vert <strong className="text-emerald-400">"Réceptionner les Pièces"</strong>. Le stock informatique est alors crédité automatiquement !
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4c. Formation Dédiée : Chef d'Atelier",
      subtitle: "Guide condensé et bonnes pratiques opérationnelles pour les chefs d'ateliers",
      icon: Users,
      bg: "from-amber-950 to-neutral-900 text-white",
      content: (
        <div className="space-y-4 text-xs text-left">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs space-y-2">
            <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" /> Vos privilèges et obligations simplifiés
            </h5>
            <p className="text-neutral-200 leading-relaxed text-[11px]">
              Chaque chef d'atelier (Service Rapide, Mécanique, Diag, Carrosserie, Lavage, Bâtiment) accède uniquement aux données de sa section via son <strong>code PIN unique</strong> (par défaut <span className="text-amber-400 font-bold">0000</span>, modifiable dans les paramètres).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h5 className="font-bold text-emerald-400 border-b border-white/10 pb-1">🛒 Demandes d'Achat (DA) Assouplies</h5>
              <ul className="list-disc list-inside space-y-1 text-neutral-300 text-[11px]">
                <li>Vous pouvez créer une demande d'achat d'équipement en toute liberté.</li>
                <li><strong>Fournisseur Optionnel :</strong> Le champ "Fournisseur Suggéré" n'est plus obligatoire ! S'il est inconnu, laissez-le vide.</li>
                <li>Saisissez simplement le <strong className="text-white">nom de l'équipement</strong>, la <strong className="text-white">cause du besoin</strong>, l'urgence, et la quantité requise.</li>
                <li>L'Administrateur se charge d'affecter le fournisseur officiel de la STA lors de sa phase de validation.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-emerald-400 border-b border-white/10 pb-1">📋 Cycle de Panne & Clôture</h5>
              <ul className="list-disc list-inside space-y-1 text-neutral-300 text-[11px]">
                <li><strong className="text-white">Signalement :</strong> Mettez l'équipement en état "En Panne" et créez une fiche d'intervention.</li>
                <li><strong className="text-white">Pièces Détachées :</strong> Ajoutez directement vos pièces. À la clôture (statut "Terminé"), elles sortent automatiquement du stock physique magasin.</li>
                <li><strong className="text-white">Mise au rebut :</strong> Utilisez l'état "Hors Service" pour éliminer les vieux appareils des calculs statistiques de disponibilité.</li>
              </ul>
            </div>
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
    },
    {
      title: "7. Support de Formation Officiel",
      subtitle: "Visualisez la fiche d'utilisation et téléchargez-la directement",
      icon: Download,
      bg: "from-neutral-900 to-emerald-950 text-white",
      content: (
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocPage(page);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    docPage === page
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  Page {page}
                </button>
              ))}
            </div>

            <a
              href="/api/download-chef-guide"
              download="Fiche_Formation_Chef_Atelier_GMAO_STA.doc"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-transparent"
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger .doc
            </a>
          </div>

          {/* Interactive Page Container */}
          <div className="transition-all duration-300">
            {docPage === 1 && (
              <div className="bg-neutral-800/80 text-white p-5 rounded-2xl border border-neutral-700 space-y-4 max-w-2xl mx-auto shadow-inner text-center">
                <div className="text-xl font-extrabold text-red-500 tracking-wider">STA CHERY TUNISIE</div>
                <div className="text-sm font-black text-white tracking-tight">FICHE DE FORMATION DÉDIÉE</div>
                <div className="text-[11px] text-neutral-300 italic">Guide d'Utilisation Pratique pour le Chef d'Atelier (GMAO)</div>
                
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-700/50 text-left space-y-2">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-amber-400" /> Guide Opérationnel Spécialisé :
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Ce document a été spécifiquement conçu pour accompagner le Chef d'Atelier. Il résume l'accès par code PIN sécurisé, le contrôle du parc d'équipements, le cycle complet d'intervention (bons de travaux) et la formulation des demandes d'achat (DA).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left border-t border-neutral-700/50 pt-3 text-[10px] text-neutral-400 font-mono">
                  <div>
                    <strong>Auteur :</strong> M. Ahmed Amine Ben Salah<br />
                    <strong>STA Tunisie :</strong> Concessionnaire Chery
                  </div>
                  <div className="text-right">
                    <strong>Version :</strong> 1.0 • 2026<br />
                    <strong>Statut :</strong> Officiel & Validé
                  </div>
                </div>
              </div>
            )}

            {docPage === 2 && (
              <div className="bg-neutral-800/80 text-white p-5 rounded-2xl border border-neutral-700 space-y-4 max-w-2xl mx-auto text-left">
                <div className="space-y-2 border-b border-neutral-700/50 pb-3">
                  <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">1. Rôle & Accès de l'Atelier (Sécurité par Code PIN)</h5>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Pour refléter l'organisation opérationnelle de la <strong>STA</strong>, l'application est compartimentée en ateliers. Chaque Chef d'Atelier accède à l'application avec un <strong>code PIN sécurisé (par défaut : 0000)</strong> :
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-neutral-300 font-mono bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-700/30">
                    <div>• Service Rapide</div>
                    <div>• Atelier Mécanique / élec</div>
                    <div>• Atelier Diagnostic</div>
                    <div>• Carrosserie</div>
                    <div>• Lavage</div>
                    <div>• Maintenance Bâtiment</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[10px] text-amber-300 leading-relaxed">
                    <strong>🔒 Règle de cloisonnement :</strong> Le Chef d'Atelier ne voit et ne gère que les équipements et bons de travaux appartenant strictement à son propre atelier. L'administrateur supervise l'intégralité du parc.
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">2. Suivi du Parc & Création d'un Équipement</h5>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Le parc de chaque atelier affiche le taux de disponibilité en temps réel de ses machines.
                  </p>
                  <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-[10px] text-red-300 leading-relaxed">
                    <strong>⚠️ Règle Métier Majeure - Équipement "Hors Service" :</strong> Lorsqu'un équipement est déclassé, vendu ou définitivement arrêté, changez son état en <strong>"Hors Service"</strong>. La GMAO l'exclura alors automatiquement de tous les calculs de taux de disponibilité globale pour éviter de fausser les indicateurs de performance.
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-200">Tutoriel pas-à-pas de création d'équipement :</span>
                    <ol className="list-decimal list-inside text-[11px] text-neutral-300 space-y-0.5 pl-1 leading-relaxed">
                      <li>Connectez-vous avec le profil et allez dans "Parc Équipements".</li>
                      <li>Cliquez sur le bouton bleu "+ Ajouter un Équipement".</li>
                      <li>Saisissez le Nom (ex: Pont Ciseaux 03), le Code Unique (ex: EQ-SR-03), sélectionnez l'Atelier, et attribuez la Criticité (A, B ou C).</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {docPage === 3 && (
              <div className="bg-neutral-800/80 text-white p-5 rounded-2xl border border-neutral-700 space-y-4 max-w-2xl mx-auto text-left">
                <div className="space-y-2 border-b border-neutral-700/50 pb-3">
                  <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">3. Cycle Complet des Interventions (Bons de travaux)</h5>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Les interventions de maintenance peuvent être effectuées en interne par nos techniciens, ou confiées à un prestataire extérieur qualifié :
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-1 pl-1 leading-relaxed">
                    <li><strong>1. Création :</strong> Renseignez le titre, l'équipement concerné, l'urgence et le type (Préventif, Correctif, Réglementaire).</li>
                    <li><strong>2. Exécutant :</strong> Interne (Technicien STA) ou Externe (Prestataire).</li>
                    <li><strong>3. Pièces :</strong> Ajoutez les pièces consommées du magasin central. Le stock est vérifié en temps réel.</li>
                    <li><strong>4. Clôture :</strong> Passez à "En cours" puis "Terminé", saisissez la durée réelle et les notes de clôture.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">4. Formulation d'une Demande d'Achat (DA)</h5>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    En cas de besoin de nouvel outillage ou de travaux d'aménagement de l'atelier, le Chef d'Atelier ou le Magasinier formule une Demande d'Achat (DA) numérique.
                  </p>
                  <div className="bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-700/40 text-[10px] space-y-1 leading-relaxed">
                    <div className="text-amber-400 font-bold">• Choix Catégorie :</div>
                    <p className="text-neutral-300">Spécifier s'il s'agit d'un <strong>Équipement</strong> (machines, outils) ou d'une <strong>Infrastructure</strong> (réseau d'air, raccordement électrique, sols, bâtiment, etc. non inclus dans les machines).</p>
                    
                    <div className="text-amber-400 font-bold mt-1">• Fournisseur Optionnel :</div>
                    <p className="text-neutral-300">Le champ "Fournisseur Suggéré" est facultatif. Vous pouvez sélectionner <strong>"Non spécifié"</strong> si vous n'avez pas de devis.</p>
                  </div>
                </div>
              </div>
            )}

            {docPage === 4 && (
              <div className="bg-neutral-800/80 text-white p-5 rounded-2xl border border-neutral-700 space-y-4 max-w-2xl mx-auto text-left">
                <div className="space-y-2 pb-2">
                  <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">Procédure de soumission</h5>
                  <ol className="list-decimal list-inside text-[11px] text-neutral-300 space-y-1 bg-neutral-900/30 p-3 rounded-xl border border-neutral-700/30 leading-relaxed">
                    <li>Dans l'onglet <strong>"Achats"</strong>, cliquez sur <strong>"+ Nouvelle Demande d'Achat (DA)"</strong>.</li>
                    <li>Sélectionnez la catégorie (<strong>Équipement</strong> ou <strong>Infrastructure</strong>).</li>
                    <li>Saisissez l'intitulé, le motif précis du besoin, la quantité demandée, le coût estimé et le niveau d'urgence.</li>
                    <li>Indiquez votre nom de demandeur et cliquez sur <strong>"Soumettre la Demande d'Achat"</strong>.</li>
                  </ol>
                </div>

                <div className="border-t border-neutral-700 pt-3 text-center space-y-1">
                  <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider">FIN DE LA FICHE DE FORMATION CHEF D'ATELIER</div>
                  <p className="text-[10px] text-neutral-400">
                    Pour toute assistance technique, contactez M. Ahmed Amine Ben Salah, administrateur de la GMAO STA.
                  </p>
                </div>
              </div>
            )}
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

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/download-chef-guide"
            download="Fiche_Formation_Chef_Atelier_GMAO_STA.doc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            🎓 Télécharger la Fiche de Formation (.doc)
          </a>

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
