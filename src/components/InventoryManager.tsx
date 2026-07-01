/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Truck,
  Layers,
  DollarSign,
  Briefcase
} from "lucide-react";
import { SparePart, Equipment } from "../types";

interface InventoryManagerProps {
  spareParts: SparePart[];
  equipments: Equipment[];
  onRestockPart: (code: string, quantity: number) => void;
  onAddPart: (newPart: SparePart) => void;
  isReadOnly?: boolean;
  currentRole?: string;
}

export default function InventoryManager({
  spareParts,
  equipments,
  onRestockPart,
  onAddPart,
  isReadOnly = false,
  currentRole = "admin"
}: InventoryManagerProps) {
  // Check if current user has modification rights for inventory (only admin & magasin)
  const canModifyInventory = !isReadOnly && (currentRole === "admin" || currentRole === "magasin");
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Add Part Form Modal State
  const [showAddForm, setShowAddForm] = useState(false);

  // New Part form inputs
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState<number>(10);
  const [newReorder, setNewReorder] = useState<number>(4);
  const [newPrice, setNewPrice] = useState<number>(55);
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("Mécanique");

  // Get categories list
  const categories = useMemo(() => {
    const list = new Set(spareParts.map((sp) => sp.category));
    return Array.from(list);
  }, [spareParts]);

  // Inventory value calculations
  const inventoryStats = useMemo(() => {
    const totalItems = spareParts.length;
    const totalPartsCount = spareParts.reduce((acc, p) => acc + p.currentStock, 0);
    const totalValuation = spareParts.reduce((acc, p) => acc + p.currentStock * p.unitPrice, 0);
    const lowStockCount = spareParts.filter((p) => p.currentStock <= p.reorderPoint).length;

    return { totalItems, totalPartsCount, totalValuation, lowStockCount };
  }, [spareParts]);

  // Filter parts list
  const filteredParts = useMemo(() => {
    return spareParts.filter((sp) => {
      const matchesSearch =
        sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sp.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || sp.category === selectedCategory;
      const matchesLowStock = !onlyLowStock || sp.currentStock <= sp.reorderPoint;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [spareParts, searchQuery, selectedCategory, onlyLowStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      alert("Veuillez renseigner le Code et le Nom de la pièce.");
      return;
    }

    if (spareParts.some((p) => p.code.toUpperCase() === newCode.toUpperCase())) {
      alert(`Erreur : Le code pièce "${newCode}" existe déjà !`);
      return;
    }

    const created: SparePart = {
      code: newCode.toUpperCase(),
      name: newName,
      currentStock: Number(newStock),
      reorderPoint: Number(newReorder),
      unitPrice: Number(newPrice),
      location: newLocation || "Rayon Général",
      category: newCategory,
      compatibleEquipments: []
    };

    onAddPart(created);
    setShowAddForm(false);

    // Reset Form
    setNewCode("");
    setNewName("");
    setNewLocation("");
  };

  return (
    <div className="space-y-6">
      {/* Access alert if restricted */}
      {!canModifyInventory && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🔒</span>
            <div>
              <span className="font-bold">Mode Consultation Restreint (Atelier)</span>
              <p className="text-[11px] text-amber-700/95 mt-0.5">Seuls le Magasinier et l'Administrateur ont les droits requis pour ajouter des pièces ou enregistrer des réceptions de stocks.</p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">Lecture Seule</span>
        </div>
      )}

      {/* Inventory Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-neutral-50 text-neutral-600 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Désignations uniques
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {inventoryStats.totalItems}
            </span>
            <span className="text-xs text-neutral-400 font-medium block mt-0.5">
              Références enregistrées
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-neutral-50 text-neutral-600 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Quantité en Stock
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {inventoryStats.totalPartsCount} u
            </span>
            <span className="text-xs text-neutral-400 font-medium block mt-0.5">
              Volume d'unités physiques
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-chery-red rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Alertes Rupture / Bas
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-chery-red">
              {inventoryStats.lowStockCount}
            </span>
            <span className="text-xs text-red-600 font-semibold block mt-0.5">
              Sous le seuil de réappro
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
              Valeur du Stock
            </span>
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-800">
              {inventoryStats.totalValuation.toLocaleString()} TND
            </span>
            <span className="text-xs text-green-600 font-medium block mt-0.5">
              Actif immobilisé en magasin
            </span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-xs">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par Code, Nom, Emplacement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50/50 focus:bg-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-neutral-200 rounded-lg text-xs py-2 px-3 bg-white outline-none font-medium cursor-pointer"
          >
            <option value="All">Toutes les Catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Alert Filter Toggle */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`flex items-center gap-1.5 border rounded-lg text-xs py-2 px-3 font-medium transition-colors cursor-pointer ${
              onlyLowStock
                ? "border-red-200 bg-red-50 text-chery-red"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Stock Critique
          </button>

          {canModifyInventory && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer ml-auto md:ml-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Enregistrer Pièce
            </button>
          )}
        </div>
      </div>

      {/* Parts Inventory Table */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-700">Registre des Pièces de Rechange (STA Magasin)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase bg-neutral-50/20">
                <th className="py-3 px-4">Code Pièce</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-center">Stock Actuel</th>
                <th className="py-3 px-4 text-center">Seuil Min.</th>
                <th className="py-3 px-4 text-right">Prix Unitaire (TND)</th>
                <th className="py-3 px-4 text-right font-bold">Valeur du Stock (TND)</th>
                <th className="py-3 px-4">Emplacement</th>
                <th className="py-3 px-4 text-center">Alerte Réappro</th>
                <th className="py-3 px-4 text-center">Action Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 font-medium">
              {filteredParts.map((part) => {
                const isLow = part.currentStock <= part.reorderPoint;
                const stockVal = part.currentStock * part.unitPrice;

                return (
                  <tr key={part.code} className={`hover:bg-neutral-50/50 transition-all ${isLow ? "bg-amber-50/20" : ""}`}>
                    <td className="py-3 px-4 font-mono font-bold text-neutral-400">{part.code}</td>
                    <td className="py-3 px-4 font-bold text-neutral-800 text-[13px]">{part.name}</td>
                    <td className="py-3 px-4 text-neutral-500">{part.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-sm ${
                          isLow
                            ? "text-red-700 bg-red-100/60 animate-pulse-subtle"
                            : "text-neutral-700 bg-neutral-100"
                        }`}
                      >
                        {part.currentStock} u
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-neutral-500">
                      {part.reorderPoint} u
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-neutral-600">
                      {part.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-800">
                      {stockVal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">{part.location}</td>
                    <td className="py-3 px-4 text-center">
                      {isLow ? (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded-sm text-[10px] font-bold">
                          REAPPRO REQUIS
                        </span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-sm text-[10px] font-semibold">
                          Conforme (OK)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canModifyInventory ? (
                        <button
                          onClick={() => onRestockPart(part.code, 10)}
                          className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-md transition-colors cursor-pointer mx-auto shadow-xs"
                        >
                          <Truck className="h-3 w-3" />
                          +10 Reçu
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-bold">Lecture</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Drawer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-chery-red" />
                Enregistrer une Nouvelle Référence
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Code Pièce *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: PR-SR-FILT2"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 uppercase outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Désignation *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Filtre à air Pont"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-neutral-50/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Stock Initial</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Seuil Alerte (Reorder)</label>
                  <input
                    type="number"
                    value={newReorder}
                    onChange={(e) => setNewReorder(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Prix Unitaire (TND)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                  >
                    <option value="Filtres & Fluides">Filtres & Fluides</option>
                    <option value="Hydraulique">Hydraulique</option>
                    <option value="Pneumatique">Pneumatique</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Buses & Raccords">Buses & Raccords</option>
                    <option value="Électricité">Électricité</option>
                    <option value="Électronique">Électronique</option>
                    <option value="Filtration Air">Filtration Air</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Emplacement Magasin</label>
                <input
                  type="text"
                  placeholder="ex: Rayon C-4"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
                >
                  Enregistrer Pièce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
