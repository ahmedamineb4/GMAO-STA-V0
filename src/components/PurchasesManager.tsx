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
  Package,
  ArrowRight,
  TrendingUp,
  X,
  FileSpreadsheet
} from "lucide-react";
import { Vendor, SparePart, PurchaseRequest } from "../types";

interface PurchasesManagerProps {
  vendors: Vendor[];
  spareParts: SparePart[];
  purchaseRequests: PurchaseRequest[];
  onAddPurchaseRequest: (req: PurchaseRequest) => void;
  onUpdatePurchaseRequestStatus: (id: string, status: PurchaseRequest["status"]) => void;
  onAddVendor: (vendor: Vendor) => void;
}

export default function PurchasesManager({
  vendors,
  spareParts,
  purchaseRequests,
  onAddPurchaseRequest,
  onUpdatePurchaseRequestStatus,
  onAddVendor
}: PurchasesManagerProps) {
  // Navigation tabs inside Purchases Manager
  const [activeSubTab, setActiveSubTab] = useState<"requests" | "vendors">("requests");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Add Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedPartCode, setSelectedPartCode] = useState("");
  const [requestedQty, setRequestedQty] = useState<number>(10);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [requesterName, setRequesterName] = useState("M. Ahmed Amine Ben Salah");

  // Add Vendor form state
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorService, setVendorService] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorRating, setVendorRating] = useState<number>(4);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return purchaseRequests.filter((req) => {
      const part = spareParts.find((p) => p.code === req.partCode);
      const vendor = vendors.find((v) => v.id === req.vendorId);
      const partName = part ? part.name.toLowerCase() : "";
      const vendorName = vendor ? vendor.name.toLowerCase() : "";

      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.partCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partName.includes(searchQuery.toLowerCase()) ||
        vendorName.includes(searchQuery.toLowerCase()) ||
        req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseRequests, spareParts, vendors, searchQuery, statusFilter]);

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

  // Auto-calculated estimated cost on request form
  const computedEstimatedCost = useMemo(() => {
    const part = spareParts.find((p) => p.code === selectedPartCode);
    return part ? part.unitPrice * requestedQty : 0;
  }, [selectedPartCode, requestedQty, spareParts]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartCode || !selectedVendorId || requestedQty <= 0) {
      alert("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    const newRequest: PurchaseRequest = {
      id: `DA-2026-${String(purchaseRequests.length + 1).padStart(3, "0")}`,
      partCode: selectedPartCode,
      quantity: Number(requestedQty),
      vendorId: selectedVendorId,
      requestedBy: requesterName,
      dateRequested: new Date().toISOString().split("T")[0],
      status: "En attente",
      estimatedCost: computedEstimatedCost
    };

    onAddPurchaseRequest(newRequest);
    setShowRequestForm(false);
    setSelectedPartCode("");
    setRequestedQty(10);
    setSelectedVendorId("");
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
      {/* KPI stats at the top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
        <div className="p-3 bg-neutral-50 rounded-lg text-xs">
          <span className="text-neutral-400 block font-semibold uppercase">Total Demandes d'Achat</span>
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
          <span className="text-neutral-400 block font-semibold uppercase">Volume Commandes</span>
          <span className="text-xl font-extrabold text-neutral-800 font-mono mt-0.5">
            {totalRequestsValue.toLocaleString()} TND
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Engagements globaux d'achats
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
            📋 Demandes d'Achat & Suivi
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
              placeholder={activeSubTab === "requests" ? "Chercher DA, pièce, fournisseur..." : "Rechercher fournisseur..."}
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
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex items-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer ml-auto md:ml-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle Demande (DA)
            </button>
          ) : (
            <button
              onClick={() => setShowVendorForm(true)}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer ml-auto md:ml-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Référencer Fournisseur
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === "requests" ? (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-700">Registre des Demandes d'Achat & Approvisionnement</h3>
            <span className="text-xs text-neutral-400">Restockage automatique magasin lors du passage au statut "Reçu"</span>
          </div>

          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
                <ShoppingCart className="h-10 w-10 text-neutral-300 mb-2" />
                <p className="text-sm font-bold">Aucune demande d'achat</p>
                <p className="text-xs">Aucune demande ne correspond à vos filtres de recherche.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase bg-neutral-50/20">
                    <th className="py-3 px-4">DA ID</th>
                    <th className="py-3 px-4">Pièce demandée</th>
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
                    const part = spareParts.find((p) => p.code === req.partCode);
                    const vendor = vendors.find((v) => v.id === req.vendorId);

                    return (
                      <tr key={req.id} className="hover:bg-neutral-50/50 transition-all">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-400">{req.id}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-neutral-700 block font-mono">{req.partCode}</span>
                          <span className="text-[11px] text-neutral-500 block">
                            {part ? part.name : "Pièce Inconnue"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-neutral-700">
                          {req.quantity} unités
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
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer transition-colors flex items-center gap-1"
                                title="Passer commande officielle"
                              >
                                Commandé <ArrowRight className="h-3 w-3" />
                              </button>
                            )}

                            {req.status === "Commandé" && (
                              <button
                                onClick={() => onUpdatePurchaseRequestStatus(req.id, "Reçu")}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer transition-colors flex items-center gap-1"
                                title="Enregistrer la réception et restocker automatiquement"
                              >
                                Réceptionner <Package className="h-3 w-3" />
                              </button>
                            )}

                            {req.status === "Reçu" && (
                              <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Stocké
                              </span>
                            )}

                            {req.status === "Refusé" && (
                              <span className="text-[10px] text-neutral-400 font-medium">Rejeté</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-xl border border-neutral-100 text-neutral-400">
              <Building className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold">Aucun fournisseur trouvé</p>
              <p className="text-xs">Modifiez vos filtres ou effectuez un nouveau référencement.</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs space-y-4 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Score rating in corner */}
                <div className="absolute top-4 right-4 flex items-center gap-0.5 bg-yellow-50 px-2 py-0.5 rounded-full text-yellow-600 text-[10px] font-bold">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{vendor.rating} / 5</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                    {vendor.id}
                  </span>
                  <h4 className="font-bold text-neutral-800 text-sm leading-tight pr-12">
                    {vendor.name}
                  </h4>
                  <span className="bg-neutral-100 text-neutral-700 font-semibold text-[10px] px-2 py-0.5 rounded inline-block">
                    {vendor.serviceType}
                  </span>
                </div>

                <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs text-neutral-500 font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span>Contact : <strong className="text-neutral-700">{vendor.contactPerson}</strong></span>
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
                  <span>Demandes associées</span>
                  <span className="font-bold font-mono text-neutral-800">
                    {purchaseRequests.filter((r) => r.vendorId === vendor.id).length} demande(s)
                  </span>
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
                Émettre une Demande d'Achat (DA)
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
                <label className="block font-bold text-neutral-600 mb-1">Pièce de Rechange Cible *</label>
                <select
                  required
                  value={selectedPartCode}
                  onChange={(e) => setSelectedPartCode(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                >
                  <option value="">Sélectionner une pièce...</option>
                  {spareParts.map((part) => (
                    <option key={part.code} value={part.code}>
                      [{part.code}] {part.name} (Stock actuel: {part.currentStock} u • {part.unitPrice} TND / u)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Quantité Demandée *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={requestedQty}
                  onChange={(e) => setRequestedQty(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Fournisseur Suggéré *</label>
                <select
                  required
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                >
                  <option value="">Sélectionner un fournisseur...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.serviceType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Nom du Demandeur</label>
                <input
                  type="text"
                  required
                  disabled
                  value={requesterName}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-100 text-neutral-500 outline-none"
                />
              </div>

              {selectedPartCode && (
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold text-neutral-600">
                    <span>Prix unitaire :</span>
                    <span className="font-mono">
                      {(spareParts.find((p) => p.code === selectedPartCode)?.unitPrice || 0).toLocaleString()} TND
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-neutral-600">
                    <span>Quantité :</span>
                    <span className="font-mono">x {requestedQty}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-extrabold text-neutral-800 pt-1.5 border-t border-red-200/50">
                    <span>Coût Estimé Total :</span>
                    <span className="text-chery-red font-mono text-sm">{computedEstimatedCost.toLocaleString()} TND</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
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
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">E-mail de Contact</label>
                  <input
                    type="email"
                    placeholder="contact@societe.tn"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none font-mono"
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
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Évaluation Initiale (1 à 5 Étoiles)</label>
                <select
                  value={vendorRating}
                  onChange={(e) => setVendorRating(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
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
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
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
