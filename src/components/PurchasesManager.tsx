/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  Star,
  ArrowRight,
  TrendingUp,
  X,
  FileSpreadsheet
} from "lucide-react";
import { Vendor, PurchaseRequest } from "../types";

interface PurchasesManagerProps {
  vendors: Vendor[];
  purchaseRequests: PurchaseRequest[];
  onAddPurchaseRequest: (req: PurchaseRequest) => void;
  onUpdatePurchaseRequestStatus: (id: string, status: PurchaseRequest["status"]) => void;
  onAddVendor: (vendor: Vendor) => void;
  isReadOnly?: boolean;
  currentRole?: string;
}

export default function PurchasesManager({
  vendors,
  purchaseRequests,
  onAddPurchaseRequest,
  onUpdatePurchaseRequestStatus,
  onAddVendor,
  isReadOnly = false,
  currentRole = "admin"
}: PurchasesManagerProps) {
  // Navigation tabs inside Purchases Manager
  const [activeSubTab, setActiveSubTab] = useState<"requests" | "vendors">("requests");

  // Auth/Role rules
  const canManageWorkflow = !isReadOnly && (currentRole === "admin" || currentRole === "magasin");
  const canManageVendors = !isReadOnly && (currentRole === "admin" || currentRole === "magasin");
  const canCreateRequests = !isReadOnly && currentRole !== "supervisor";

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Add Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [equipmentName, setEquipmentName] = useState("");
  const [needReason, setNeedReason] = useState("");
  const [urgency, setUrgency] = useState<"Faible" | "Moyenne" | "Critique">("Moyenne");
  const [requestedQty, setRequestedQty] = useState<number>(1);
  const [estimatedCost, setEstimatedCost] = useState<number>(1000);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [requesterName, setRequesterName] = useState("M. Ahmed Amine Ben Salah");
  const [purchaseCategory, setPurchaseCategory] = useState<"Équipement" | "Infrastructure">("Équipement");

  // Add Vendor form state
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorService, setVendorService] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorRating, setVendorRating] = useState<number>(4);

  // Sync requester name with active role
  React.useEffect(() => {
    if (currentRole === "admin") {
      setRequesterName("M. Ahmed Amine Ben Salah");
    } else if (currentRole === "supervisor") {
      setRequesterName("Superviseur Maintenance");
    } else {
      const labels: Record<string, string> = {
        service_rapide: "Service Rapide",
        atelier_mecanique: "Atelier Mécanique / Elec",
        atelier_diagnostic: "Atelier Diagnostic",
        carrosserie: "Atelier Carrosserie",
        lavage: "Atelier Lavage",
        reception: "Réception Après-Vente",
        magasin: "Magasin Pièces",
        batiment: "Maintenance Bâtiment"
      };
      setRequesterName(`Atelier ${labels[currentRole] || currentRole}`);
    }
  }, [currentRole]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return purchaseRequests.filter((req) => {
      const vendor = vendors.find((v) => v.id === req.vendorId);
      const vendorName = vendor ? vendor.name.toLowerCase() : "";
      const eqName = req.equipmentName ? req.equipmentName.toLowerCase() : "";
      const reason = req.needReason ? req.needReason.toLowerCase() : "";

      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eqName.includes(searchQuery.toLowerCase()) ||
        reason.includes(searchQuery.toLowerCase()) ||
        vendorName.includes(searchQuery.toLowerCase()) ||
        req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseRequests, vendors, searchQuery, statusFilter]);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      return (
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [vendors, searchQuery]);

  // Cost calculations
  const totalRequestsValue = useMemo(() => {
    return purchaseRequests.reduce((sum, req) => sum + req.estimatedCost, 0);
  }, [purchaseRequests]);

  const pendingRequestsValue = useMemo(() => {
    return purchaseRequests
      .filter((r) => r.status === "En attente" || r.status === "Approuvé")
      .reduce((sum, req) => sum + req.estimatedCost, 0);
  }, [purchaseRequests]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName || !needReason || requestedQty <= 0) {
      alert("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    const newRequest: PurchaseRequest = {
      id: `DA-2026-${String(purchaseRequests.length + 1).padStart(3, "0")}`,
      equipmentName,
      needReason,
      urgency,
      quantity: Number(requestedQty),
      vendorId: selectedVendorId || "",
      requestedBy: requesterName,
      dateRequested: new Date().toISOString().split("T")[0],
      status: "En attente",
      estimatedCost: Number(estimatedCost),
      category: purchaseCategory
    };

    onAddPurchaseRequest(newRequest);
    setShowRequestForm(false);
    setEquipmentName("");
    setNeedReason("");
    setUrgency("Moyenne");
    setRequestedQty(1);
    setEstimatedCost(1000);
    setSelectedVendorId("");
    setPurchaseCategory("Équipement");
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !vendorService) {
      alert("Veuillez renseigner le nom et le type de service du fournisseur.");
      return;
    }

    const newVendor: Vendor = {
      id: `VND-${vendorName.toUpperCase().replace(/\s+/g, "-").slice(0, 10)}`,
      name: vendorName,
      serviceType: vendorService,
      phone: vendorPhone || "+216 -- --- ---",
      email: vendorEmail || "contact@fournisseur.tn",
      contactPerson: vendorContact || "N/A",
      rating: Number(vendorRating)
    };

    onAddVendor(newVendor);
    setShowVendorForm(false);
    setVendorName("");
    setVendorService("");
    setVendorPhone("");
    setVendorEmail("");
    setVendorContact("");
    setVendorRating(4);
  };

  return (
    <div className="space-y-6">
      {/* Role Notice Banner */}
      {!canManageWorkflow && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3.5 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <div>
              <span className="font-bold">Accès Flux d'Achats Restreint</span>
              <p className="text-[11px] text-blue-700/95 mt-0.5">
                {currentRole === "supervisor" 
                  ? "Vous êtes en mode lecture seule (Superviseur). Vous ne pouvez pas créer de demandes ni modifier le workflow."
                  : "En tant qu'opérateur d'Atelier, vous pouvez créer de nouvelles demandes d'équipements (DA), mais seuls l'Administrateur et le Magasin peuvent approuver, commander et réceptionner les articles."}
              </p>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">Info Accès</span>
        </div>
      )}

      {/* KPI stats at the top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Total Demandes Équipement</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {purchaseRequests.length} demandes
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Enregistrées dans l'exercice 2026
          </span>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">En attente / Approuvées</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {purchaseRequests.filter((r) => r.status === "En attente" || r.status === "Approuvé").length} en cours
          </span>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
            Valeur : {pendingRequestsValue.toLocaleString()} TND
          </span>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Volume d'Engagements</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {totalRequestsValue.toLocaleString()} TND
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Investissements d'équipement globaux
          </span>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Partenaires Référencés</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {vendors.length} Fournisseurs
          </span>
          <span className="text-[10px] text-green-600 font-semibold block mt-0.5">
            Agrées par STA Tunisie
          </span>
        </div>
      </div>

      {/* Primary Sub Tabs and Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
        {/* Toggle subtabs */}
        <div className="flex gap-1.5 bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveSubTab("requests");
              setSearchQuery("");
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "requests"
                ? "bg-white text-neutral-800 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            📋 Demandes d'Achat Équipement
          </button>
          <button
            onClick={() => {
              setActiveSubTab("vendors");
              setSearchQuery("");
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "vendors"
                ? "bg-white text-neutral-800 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            🏢 Fournisseurs Agréés ({vendors.length})
          </button>
        </div>

        {/* Global Search & Trigger button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder={activeSubTab === "requests" ? "Chercher DA, équipement, demandeur..." : "Rechercher fournisseur..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-xs bg-neutral-50/50 focus:bg-white outline-none"
            />
          </div>

          {activeSubTab === "requests" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-neutral-200 rounded-lg text-xs py-2 px-3 bg-white outline-none font-medium cursor-pointer"
            >
              <option value="All">Tous les Statuts</option>
              <option value="En attente">En attente</option>
              <option value="Approuvé">Approuvé</option>
              <option value="Commandé">Commandé</option>
              <option value="Reçu">Reçu</option>
              <option value="Refusé">Refusé</option>
            </select>
          )}

          {activeSubTab === "requests" ? (
            canCreateRequests && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer ml-auto md:ml-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouvelle Demande d'Équipement
              </button>
            )
          ) : (
            canManageVendors && (
              <button
                onClick={() => setShowVendorForm(true)}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer ml-auto md:ml-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Référencer Fournisseur
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === "requests" ? (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-700">Registre des Demandes d'Achat d'Équipements</h3>
            <span className="text-xs text-neutral-400">Suivi et validation du workflow d'approvisionnement des ateliers</span>
          </div>

          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
                <ShoppingCart className="h-10 w-10 text-neutral-300 mb-2" />
                <p className="text-sm font-bold">Aucune demande d'équipement</p>
                <p className="text-xs">Aucune demande ne correspond à vos critères.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase bg-neutral-50/20">
                    <th className="py-3 px-4">DA ID</th>
                    <th className="py-3 px-4">Équipement requis & Cause du besoin</th>
                    <th className="py-3 px-4 text-center">Urgence</th>
                    <th className="py-3 px-4 text-center">Quantité</th>
                    <th className="py-3 px-4">Fournisseur préconisé</th>
                    <th className="py-3 px-4">Demandeur</th>
                    <th className="py-3 px-4 text-center">Date demande</th>
                    <th className="py-3 px-4 text-right">Coût estimé (TND)</th>
                    <th className="py-3 px-4 text-center">Statut Workflow</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 font-medium">
                  {filteredRequests.map((req) => {
                    const vendor = vendors.find((v) => v.id === req.vendorId);

                    return (
                      <tr key={req.id} className="hover:bg-neutral-50/50 transition-all">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-400">{req.id}</td>
                        <td className="py-3 px-4 max-w-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-neutral-800 text-xs">
                              {req.equipmentName}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-sm text-[8px] font-extrabold uppercase shrink-0 border ${
                                req.category === "Infrastructure"
                                  ? "bg-purple-50 border-purple-150 text-purple-700"
                                  : "bg-teal-50 border-teal-150 text-teal-700"
                              }`}
                            >
                              {req.category === "Infrastructure" ? "🏢 Infrastructure" : "⚙️ Équipement"}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 block leading-relaxed">
                            {req.needReason}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold inline-block ${
                              req.urgency === "Critique"
                                ? "bg-red-100 text-red-800 animate-pulse-subtle"
                                : req.urgency === "Moyenne"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {req.urgency || "Moyenne"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-neutral-700">
                          {req.quantity} unité(s)
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-600">
                          {vendor ? vendor.name : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-neutral-400" />
                            <span>{req.requestedBy}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-neutral-500">
                          {req.dateRequested}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-800">
                          {req.estimatedCost.toLocaleString()} TND
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold inline-block ${
                              req.status === "Reçu"
                                ? "bg-green-100 text-green-800"
                                : req.status === "Commandé"
                                ? "bg-blue-100 text-blue-800"
                                : req.status === "Approuvé"
                                ? "bg-purple-100 text-purple-800"
                                : req.status === "En attente"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!canManageWorkflow ? (
                              <span className="text-[10px] text-neutral-400 font-bold italic">
                                Lecture Seule
                              </span>
                            ) : (
                              <>
                                {req.status === "En attente" && (
                                  <>
                                    <button
                                      onClick={() => onUpdatePurchaseRequestStatus(req.id, "Approuvé")}
                                      className="bg-green-50 hover:bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-[10px] border border-green-200 cursor-pointer transition-colors"
                                      title="Approuver la demande"
                                    >
                                      Approuver
                                    </button>
                                    <button
                                      onClick={() => onUpdatePurchaseRequestStatus(req.id, "Refusé")}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded text-[10px] border border-red-100 cursor-pointer transition-colors"
                                      title="Refuser la demande"
                                    >
                                      Refuser
                                    </button>
                                  </>
                                )}

                                {req.status === "Approuvé" && (
                                  <button
                                    onClick={() => onUpdatePurchaseRequestStatus(req.id, "Commandé")}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded text-[10px] border border-blue-200 cursor-pointer transition-colors"
                                    title="Générer le bon de commande"
                                  >
                                    Commander
                                  </button>
                                )}

                                {req.status === "Commandé" && (
                                  <button
                                    onClick={() => onUpdatePurchaseRequestStatus(req.id, "Reçu")}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-xs cursor-pointer transition-colors"
                                    title="Confirmer la réception de l'équipement"
                                  >
                                    Réceptionner
                                  </button>
                                )}

                                {(req.status === "Reçu" || req.status === "Refusé") && (
                                  <span className="text-[10px] text-neutral-400 font-bold italic">
                                    Verrouillé
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* VENDORS SUBTAB VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredVendors.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-neutral-400 rounded-xl border border-neutral-100 flex flex-col items-center">
              <Building className="h-10 w-10 text-neutral-300 mb-2" />
              <p className="text-sm font-bold">Aucun partenaire</p>
              <p className="text-xs">Aucun fournisseur ne correspond à votre filtre de recherche.</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between gap-4 hover:border-neutral-200 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider block">
                        {vendor.id}
                      </span>
                      <h4 className="text-xs font-extrabold text-neutral-800 leading-tight">
                        {vendor.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= vendor.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <span className="inline-block bg-neutral-50 border border-neutral-100 text-neutral-500 font-bold px-2 py-0.5 rounded text-[10px]">
                    {vendor.serviceType}
                  </span>

                  <div className="space-y-1 text-[11px] text-neutral-500 border-t border-neutral-50 pt-2.5">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="font-semibold text-neutral-600">{vendor.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="font-mono">{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="font-mono text-neutral-600 truncate">{vendor.email}</span>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-2 rounded-lg text-[11px] text-neutral-500 flex justify-between items-center">
                    <span>Demandes d'équipements</span>
                    <span className="font-bold font-mono text-neutral-800">
                      {purchaseRequests.filter((r) => r.vendorId === vendor.id).length} demande(s)
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* NEW PURCHASE REQUEST FORM DIALOG */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-chery-red" />
                Émettre une Demande d'Équipement (DA)
              </h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Catégorie de la Demande d'Achat *</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200/50">
                  <button
                    type="button"
                    onClick={() => setPurchaseCategory("Équipement")}
                    className={`py-2 px-3 rounded-lg text-center font-bold transition-all cursor-pointer text-[11px] ${
                      purchaseCategory === "Équipement"
                        ? "bg-white text-neutral-800 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    ⚙️ Équipement
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchaseCategory("Infrastructure")}
                    className={`py-2 px-3 rounded-lg text-center font-bold transition-all cursor-pointer text-[11px] ${
                      purchaseCategory === "Infrastructure"
                        ? "bg-white text-neutral-800 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    🏢 Infrastructure
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 pl-1">
                  {purchaseCategory === "Infrastructure"
                    ? "Travaux, gros œuvre, raccordements d'air ou d'électricité, réfection de sol, etc."
                    : "Machines d'atelier, ponts, compresseurs, démonte-pneus, outillage spécialisé."}
                </p>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">
                  {purchaseCategory === "Infrastructure" ? "Nom des travaux / de l'infrastructure requis *" : "Nom de l'équipement requis *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={purchaseCategory === "Infrastructure" ? "ex: Réfection réseau d'air comprimé, Cablage triphasé..." : "ex: Pont élévateur 4T, Lustreuse pneumatique..."}
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Cause / Motif du besoin *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Expliquez en détail pourquoi cet équipement est requis (ex: panne irréparable, augmentation d'activité, sécurité...)"
                  value={needReason}
                  onChange={(e) => setNeedReason(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red text-xs font-medium resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Niveau d'Urgence *</label>
                  <select
                    required
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red text-xs font-semibold cursor-pointer"
                  >
                    <option value="Faible">🟢 Faible (Amélioration)</option>
                    <option value="Moyenne">🟡 Moyenne (Nouveau service)</option>
                    <option value="Critique">🔴 Critique (Panne ou Sécurité)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Quantité requise *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(Math.max(1, Number(e.target.value)))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none text-xs font-mono font-bold focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Coût Estimé Total (TND) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Fournisseur Suggéré (Optionnel)</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red cursor-pointer"
                >
                  <option value="">Sélectionner un fournisseur... (Non spécifié)</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.serviceType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Demandeur</label>
                <input
                  type="text"
                  required
                  disabled
                  value={requesterName}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-100 text-neutral-500 outline-none font-semibold"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer transition-colors"
                >
                  Émettre la Demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW VENDOR FORM DIALOG */}
      {showVendorForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Building className="h-5 w-5 text-neutral-500" />
                Référencer un Nouveau Fournisseur
              </h3>
              <button
                onClick={() => setShowVendorForm(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleVendorSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Raison Sociale / Nom *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Weinmann Tunisie S.A."
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Type de Prestation / Service *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fourniture d'Équipements, Outillage, SAV, Tarage"
                  value={vendorService}
                  onChange={(e) => setVendorService(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Téléphone Bureau</label>
                  <input
                    type="text"
                    placeholder="+216 71 --- ---"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono focus:ring-1 focus:ring-chery-red"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">E-mail de Contact</label>
                  <input
                    type="email"
                    placeholder="contact@societe.tn"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Interlocuteur Principal (Nom complet)</label>
                <input
                  type="text"
                  placeholder="M. Hédi Ben Younes"
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Évaluation Initiale (1 à 5 Étoiles)</label>
                <select
                  value={vendorRating}
                  onChange={(e) => setVendorRating(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-chery-red cursor-pointer"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (Excellent / Certifié)</option>
                  <option value="4">⭐⭐⭐⭐ (Très bon / Fiable)</option>
                  <option value="3">⭐⭐⭐ (Moyen / Standard)</option>
                  <option value="2">⭐⭐ (Insuffisant)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVendorForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-lg font-bold text-center cursor-pointer transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
