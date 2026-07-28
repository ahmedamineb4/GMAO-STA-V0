/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  FileText,
  Search,
  Plus,
  Download,
  Link,
  Sliders,
  X,
  History,
  FileCode,
  Layers,
  Sparkles,
  RefreshCw,
  Trash2,
  Tag,
  ShieldAlert,
  ChevronRight,
  Briefcase,
  Upload,
  Paperclip,
  FileSpreadsheet,
  FileCheck,
  File
} from "lucide-react";
import { Equipment } from "../types";

export interface GmaoDocument {
  id: string;
  name: string;
  type: "Procédure" | "Instruction de travail" | "Manuel" | "Plan" | "Réglementaire";
  version: string;
  associatedEquipments: string[]; // Equipment codes
  dateAdded: string;
  size: string;
  description: string;
  versions: { version: string; date: string; comment: string; author: string }[];
  fileData?: string; // base64 string
  fileName?: string; // original filename e.g. "Manuel_Chassis.docx"
  fileExtension?: string; // e.g. "pdf", "docx", "xlsx"
  fileMimeType?: string;
}

interface DocumentationManagerProps {
  equipments: Equipment[];
  isReadOnly?: boolean;
}

export default function DocumentationManager({
  equipments,
  isReadOnly = false
}: DocumentationManagerProps) {
  // 1. Initial documents to seed the demo mode
  const INITIAL_DOCUMENTS: GmaoDocument[] = [
    {
      id: "DOC-001",
      name: "Procédure d'inspection des ponts élévateurs à ciseaux",
      type: "Procédure",
      version: "V2.1",
      associatedEquipments: ["EQ-SR-05", "EQ-SR-06", "EQ-SR-07"],
      dateAdded: "2026-02-15",
      size: "1.4 MB",
      description: "Instructions détaillées de sécurité et d'inspection pour les ponts élévateurs de marque Ravaglioli en zone Service Rapide.",
      versions: [
        { version: "V2.1", date: "2026-02-15", comment: "Mise à jour suite aux recommandations de l'Apave Tunisie.", author: "M. Ahmed Amine" },
        { version: "V1.0", date: "2024-05-10", comment: "Création initiale de la procédure.", author: "M. Ahmed Amine" }
      ]
    },
    {
      id: "DOC-002",
      name: "Manuel Technique - Équilibreuse Laser Hoffmann",
      type: "Manuel",
      version: "V1.0",
      associatedEquipments: ["EQ-SR-04"],
      dateAdded: "2025-06-20",
      size: "8.7 MB",
      description: "Manuel constructeur d'utilisation, de calibrage et d'entretien régulier de l'équilibreuse de roues laser.",
      versions: [
        { version: "V1.0", date: "2025-06-20", comment: "Manuel d'origine constructeur en français.", author: "Hoffmann Support" }
      ]
    },
    {
      id: "DOC-003",
      name: "Schéma d'Implantation Réseau Électrique Atelier Mécanique",
      type: "Plan",
      version: "V3.0",
      associatedEquipments: ["EQ-SR-05", "EQ-SR-06", "EQ-SR-07"],
      dateAdded: "2026-01-08",
      size: "4.2 MB",
      description: "Plan électrique complet de l'atelier incluant les raccordements triphasés des ponts et centrales d'air.",
      versions: [
        { version: "V3.0", date: "2026-01-08", comment: "Ajout des lignes d'alimentation du nouveau compresseur.", author: "STEG Tunisie" },
        { version: "V1.0", date: "2022-03-12", comment: "Plan original de construction.", author: "STA Bâtiment" }
      ]
    },
    {
      id: "DOC-004",
      name: "Instruction de travail - Calibrage de la station de recharge climatisation",
      type: "Instruction de travail",
      version: "V1.2",
      associatedEquipments: [],
      dateAdded: "2026-03-01",
      size: "720 KB",
      description: "Pas-à-pas pour purger et calibrer la station d'injection de fluide frigorigène R134a.",
      versions: [
        { version: "V1.2", date: "2026-03-01", comment: "Précision sur la purge de sécurité.", author: "Chef d'Atelier" }
      ]
    },
    {
      id: "DOC-005",
      name: "Arrêté Ministériel Relatif au Contrôle des Cuves sous Pression",
      type: "Réglementaire",
      version: "2024-ED",
      associatedEquipments: [],
      dateAdded: "2024-11-12",
      size: "2.1 MB",
      description: "Texte officiel tunisien régissant les contrôles biannuels obligatoires pour les réservoirs d'air comprimé.",
      versions: [
        { version: "2024-ED", date: "2024-11-12", comment: "Texte de loi applicable.", author: "Gouvernement Tunisien" }
      ]
    }
  ];

  // 2. Load / Save state
  const [documents, setDocuments] = useState<GmaoDocument[]>(() => {
    const saved = localStorage.getItem("chery_gmao_documents");
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  useEffect(() => {
    localStorage.setItem("chery_gmao_documents", JSON.stringify(documents));
  }, [documents]);

  // 3. Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // 4. Document Selection for details
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // 5. Add / Edit form modal
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<GmaoDocument["type"]>("Procédure");
  const [formVersion, setFormVersion] = useState("V1.0");
  const [formDesc, setFormDesc] = useState("");
  const [formAssociated, setFormAssociated] = useState<string[]>([]);
  const [formVersionComment, setFormVersionComment] = useState("Création initiale");

  // File Upload State
  const [formFileData, setFormFileData] = useState<string | null>(null);
  const [formFileName, setFormFileName] = useState<string>("");
  const [formFileExtension, setFormFileExtension] = useState<string>("");
  const [formFileMime, setFormFileMime] = useState<string>("");
  const [formSize, setFormSize] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  // 6. Version control popup
  const [showVersionModal, setShowVersionModal] = useState<string | null>(null);
  const [newVerNumber, setNewVerNumber] = useState("");
  const [newVerComment, setNewVerComment] = useState("");

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === "All" || doc.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, selectedType]);

  const selectedDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || null;
  }, [documents, selectedDocId]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      setFormFileData(base64Data);
      setFormFileName(file.name);
      setFormFileExtension(ext);
      setFormFileMime(file.type);
      setFormSize(formattedSize);

      if (!formName) {
        const titleWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setFormName(titleWithoutExt);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle attaching / updating file directly on an existing document
  const handleAttachFileToDoc = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === docId) {
            return {
              ...d,
              fileData: base64Data,
              fileName: file.name,
              fileExtension: ext,
              fileMimeType: file.type,
              size: formattedSize
            };
          }
          return d;
        })
      );
    };
    reader.readAsDataURL(file);
  };

  // Handle adding new document
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newDoc: GmaoDocument = {
      id: `DOC-${String(documents.length + 1).padStart(3, "0")}`,
      name: formName,
      type: formType,
      version: formVersion,
      associatedEquipments: formAssociated,
      dateAdded: new Date().toISOString().split("T")[0],
      size: formSize || `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      description: formDesc || "Aucune description fournie.",
      fileData: formFileData || undefined,
      fileName: formFileName || undefined,
      fileExtension: formFileExtension || undefined,
      fileMimeType: formFileMime || undefined,
      versions: [
        {
          version: formVersion,
          date: new Date().toISOString().split("T")[0],
          comment: formVersionComment || "Création initiale.",
          author: "M. Ahmed Amine"
        }
      ]
    };

    setDocuments([newDoc, ...documents]);
    setShowForm(false);
    setSelectedDocId(newDoc.id);

    // Reset Form
    setFormName("");
    setFormType("Procédure");
    setFormVersion("V1.0");
    setFormDesc("");
    setFormAssociated([]);
    setFormVersionComment("Création initiale");
    setFormFileData(null);
    setFormFileName("");
    setFormFileExtension("");
    setFormFileMime("");
    setFormSize("");
  };

  // Handle adding new version to existing document
  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVersionModal || !newVerNumber) return;

    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === showVersionModal) {
          const newVer = {
            version: newVerNumber,
            date: new Date().toISOString().split("T")[0],
            comment: newVerComment || "Mise à jour de version.",
            author: "M. Ahmed Amine"
          };
          return {
            ...doc,
            version: newVerNumber,
            versions: [newVer, ...doc.versions]
          };
        }
        return doc;
      })
    );

    setShowVersionModal(null);
    setNewVerNumber("");
    setNewVerComment("");
  };

  // Delete document
  const handleDeleteDoc = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir archiver/supprimer ce document ?")) {
      setDocuments(documents.filter((d) => d.id !== id));
      if (selectedDocId === id) setSelectedDocId(null);
    }
  };

  // Real download handler (Word, Excel, PDF, base64 or generated blob)
  const handleDownload = (doc: GmaoDocument) => {
    if (doc.fileData) {
      const element = document.createElement("a");
      element.href = doc.fileData;
      element.download = doc.fileName || `${doc.name.replace(/\s+/g, "_")}.${doc.fileExtension || "pdf"}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // Determine file extension based on name/type if not uploaded
      let ext = doc.fileExtension || "pdf";
      let mimeType = "application/pdf";
      const nameLower = doc.name.toLowerCase();

      if (nameLower.includes("word") || nameLower.includes("manuel") || nameLower.includes("fiche")) {
        ext = "docx";
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (nameLower.includes("excel") || nameLower.includes("schéma") || nameLower.includes("plan")) {
        ext = "xlsx";
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      const fileContent = `GMAO STA CHERY TUNISIE - DOCUMENT TECHNIQUE
========================================================================
ID: ${doc.id}
Titre: ${doc.name}
Catégorie: ${doc.type}
Version: ${doc.version}
Date: ${doc.dateAdded}
Équipements Associés: ${doc.associatedEquipments.join(", ") || "Ateliers STA Chery"}

DESCRIPTION:
${doc.description}

HISTORIQUE DES VERSIONS:
${doc.versions.map((v) => `- Version ${v.version} (${v.date}) par ${v.author} : ${v.comment}`).join("\n")}
========================================================================`;

      const element = document.createElement("a");
      const fileBlob = new Blob([fileContent], { type: `${mimeType};charset=utf-8` });
      element.href = URL.createObjectURL(fileBlob);
      element.download = doc.fileName || `${doc.id}_${doc.name.replace(/[^a-zA-Z0-9_\-]/g, "_")}.${ext}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const categories: GmaoDocument["type"][] = [
    "Procédure",
    "Instruction de travail",
    "Manuel",
    "Plan",
    "Réglementaire"
  ];

  const getFileFormatBadge = (doc: GmaoDocument) => {
    const ext = (doc.fileExtension || doc.fileName?.split(".").pop() || "").toLowerCase();
    const nameLower = doc.name.toLowerCase();

    if (ext === "pdf" || nameLower.includes("pdf")) {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-1 font-mono">
          📄 PDF
        </span>
      );
    }
    if (ext === "docx" || ext === "doc" || nameLower.includes("word") || nameLower.includes("manuel") || nameLower.includes("instruction") || nameLower.includes("procédure")) {
      return (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-1 font-mono">
          🟦 WORD
        </span>
      );
    }
    if (ext === "xlsx" || ext === "xls" || nameLower.includes("excel") || nameLower.includes("schéma") || nameLower.includes("plan")) {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-1 font-mono">
          🟩 EXCEL
        </span>
      );
    }
    return (
      <span className="bg-neutral-100 text-neutral-700 border border-neutral-200 text-[9px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-1 font-mono">
        📄 FILE
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-chery-red" />
            📚 Centre de Documentation Technique
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez les procédures, fiches techniques constructeur CHERY, manuels d'entretien et documents réglementaires de la STA.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-1.5 bg-chery-red hover:bg-chery-dark text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Ajouter un Document
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher par titre, ID, description, mot clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-neutral-300"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedType("All")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
              selectedType === "All"
                ? "bg-neutral-800 text-white border-neutral-800"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Tous ({documents.length})
          </button>
          {categories.map((cat) => {
            const count = documents.filter((d) => d.type === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedType(cat)}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
                  selectedType === cat
                    ? "bg-chery-red text-white border-chery-red"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main split viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Document list (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Fichiers Disponibles ({filteredDocs.length})
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Cliquer pour inspecter</span>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 flex flex-col items-center">
                <FileText className="h-10 w-10 text-neutral-300 mb-2 animate-pulse" />
                <p className="text-sm font-bold">Aucun document trouvé</p>
                <p className="text-xs mt-1">Modifiez vos mots-clés ou filtrez par catégorie.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredDocs.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors cursor-pointer ${
                        isSelected ? "bg-red-50/10 border-l-4 border-l-chery-red" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500 mt-1">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-neutral-100 text-neutral-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {doc.type}
                            </span>
                            {getFileFormatBadge(doc)}
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {doc.id}
                            </span>
                            <span className="text-[10px] text-neutral-400">•</span>
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 rounded font-mono">
                              {doc.version}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-neutral-800 mt-1.5 hover:text-chery-red transition-colors flex items-center gap-1.5">
                            {doc.name}
                            {doc.fileName && (
                              <span className="text-[10px] font-normal text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
                                📎 {doc.fileName}
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-1 max-w-xl">
                            {doc.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-neutral-100">
                        <div className="text-left sm:text-right text-xs">
                          <span className="text-neutral-400 block">Date d'Ajout :</span>
                          <span className="font-bold text-neutral-600">{doc.dateAdded}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc);
                            }}
                            title="Télécharger"
                            className="p-1.5 rounded-lg bg-neutral-50 text-neutral-500 hover:text-chery-red hover:bg-red-50 border border-neutral-200 transition-colors cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDoc(doc.id);
                              }}
                              title="Supprimer"
                              className="p-1.5 rounded-lg bg-neutral-50 text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-neutral-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <ChevronRight className="h-4 w-4 text-neutral-300 hidden sm:block" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Document detailed inspection card */}
        <div className="lg:col-span-1">
          {selectedDoc ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 space-y-5 sticky top-6">
              {/* Header metadata */}
              <div className="flex justify-between items-start pb-3 border-b border-neutral-100">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono flex-wrap">
                    <span>{selectedDoc.id}</span>
                    <span>•</span>
                    <span className="font-bold text-red-600 uppercase bg-red-50 px-1 rounded">{selectedDoc.type}</span>
                    {getFileFormatBadge(selectedDoc)}
                  </div>
                  <h3 className="text-base font-black text-neutral-800 mt-1 leading-tight">
                    {selectedDoc.name}
                  </h3>
                  {selectedDoc.fileName && (
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded inline-block mt-1">
                      📎 {selectedDoc.fileName}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDocId(null)}
                  className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 shrink-0 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Description box */}
              <div className="text-xs space-y-2 bg-neutral-50 p-4 rounded-xl">
                <span className="font-bold text-neutral-600 block">Description :</span>
                <p className="text-neutral-500 leading-relaxed text-[11px]">{selectedDoc.description}</p>
              </div>

              {/* Technical specs */}
              <div className="grid grid-cols-2 gap-3 text-xs border border-neutral-100 p-4 rounded-xl bg-white">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Version Active :</span>
                  <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    {selectedDoc.version}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Taille Fichier :</span>
                  <span className="font-bold text-neutral-700 inline-block mt-1 font-mono">{selectedDoc.size}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Date Publication :</span>
                  <span className="font-bold text-neutral-700 inline-block mt-1">{selectedDoc.dateAdded}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Auteur / Validateur :</span>
                  <span className="font-bold text-neutral-700 inline-block mt-1">Ahmed Amine</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(selectedDoc)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger {selectedDoc.fileExtension ? `(.${selectedDoc.fileExtension})` : ""}
                  </button>
                  {!isReadOnly && (
                    <button
                      onClick={() => setShowVersionModal(selectedDoc.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-chery-red border border-red-200 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <History className="h-3.5 w-3.5" />
                      Nouvelle Version
                    </button>
                  )}
                </div>

                {!isReadOnly && (
                  <div>
                    <input
                      type="file"
                      ref={attachInputRef}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.csv"
                      className="hidden"
                      onChange={(e) => handleAttachFileToDoc(selectedDoc.id, e)}
                    />
                    <button
                      type="button"
                      onClick={() => attachInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 transition-colors cursor-pointer"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-neutral-500" />
                      {selectedDoc.fileData ? "Remplacer le Fichier Joint" : "Joindre un Document (Word, Excel, PDF)"}
                    </button>
                  </div>
                )}
              </div>

              {/* Equipment relationships */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="h-3.5 w-3.5 text-neutral-500" />
                  Équipements Liés ({selectedDoc.associatedEquipments.length})
                </h4>
                {selectedDoc.associatedEquipments.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic py-2 bg-neutral-50 rounded-lg text-center">
                    Aucun équipement expressément associé.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.associatedEquipments.map((eqCode) => {
                      const eqName = equipments.find((e) => e.code === eqCode)?.name || eqCode;
                      return (
                        <span
                          key={eqCode}
                          className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded text-[10px] font-medium inline-flex items-center gap-1"
                        >
                          <Briefcase className="h-3 w-3 text-neutral-400" />
                          <strong>{eqCode}</strong> : {eqName}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Version control stack (Gestion des versions) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-neutral-500" />
                  Historique des Versions ({selectedDoc.versions.length})
                </h4>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedDoc.versions.map((ver, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/40 text-xs space-y-1 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-red-600 font-mono bg-red-50 px-1.5 rounded text-[10px]">
                          {ver.version}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">{ver.date}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-relaxed italic">
                        "{ver.comment}"
                      </p>
                      <div className="text-[9px] text-neutral-400 text-right">
                        Par: <strong>{ver.author}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-400 flex flex-col items-center justify-center h-full min-h-[300px]">
              <FileText className="h-8 w-8 text-neutral-300 mb-2 animate-bounce" />
              <p className="text-sm font-bold">Aucun document sélectionné</p>
              <p className="text-xs max-w-[200px] mt-1 leading-relaxed">
                Cliquez sur un document à gauche pour inspecter sa fiche, ses versions ou lancer un téléchargement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-chery-red" />
                Enregistrer un Nouveau Document Technique
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* File Attachment Dropzone */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">
                  Fichier à Joindre (Word .docx, Excel .xlsx, PDF, etc.) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 hover:border-chery-red rounded-xl p-4 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition-all text-center space-y-1.5"
                >
                  <Upload className="h-6 w-6 text-chery-red mx-auto" />
                  {formFileName ? (
                    <div>
                      <span className="font-bold text-chery-red block text-xs truncate max-w-xs mx-auto">
                        📎 {formFileName}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        Taille : {formSize} • Format : .{formFileExtension.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-neutral-700 text-xs">
                        Cliquez ici pour sélectionner votre fichier Word, Excel ou PDF
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Formats acceptés : Word (.doc, .docx), Excel (.xls, .xlsx), PDF (.pdf), Images
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Titre du Document *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fiche d'entretien ponts élévateurs"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Catégorie *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as GmaoDocument["type"])}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Version Initiale *</label>
                  <input
                    type="text"
                    required
                    placeholder="V1.0"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white font-mono outline-none focus:ring-1 focus:ring-chery-red"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Description / Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Expliquez brièvement le contenu de ce document..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Commentaire de Version *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Création initiale de la procédure."
                  value={formVersionComment}
                  onChange={(e) => setFormVersionComment(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Associer aux Équipements</label>
                <p className="text-[10px] text-neutral-400 mb-1.5">Sélectionnez un ou plusieurs équipements compatibles.</p>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-3 border border-neutral-200 rounded-lg bg-neutral-50">
                  {equipments.map((eq) => {
                    const isChecked = formAssociated.includes(eq.code);
                    return (
                      <label key={eq.code} className="flex items-center gap-2 text-[11px] text-neutral-600 cursor-pointer hover:text-neutral-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormAssociated([...formAssociated, eq.code]);
                            } else {
                              setFormAssociated(formAssociated.filter((code) => code !== eq.code));
                            }
                          }}
                          className="rounded text-chery-red focus:ring-chery-red h-3.5 w-3.5 border-neutral-300"
                        />
                        <span className="font-bold font-mono">{eq.code}</span> - {eq.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
                >
                  Enregistrer le Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Version Modal Popup */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <History className="h-5 w-5 text-chery-red" />
              Publier une Nouvelle Version du Document
            </h3>

            <form onSubmit={handleAddVersion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Nouveau Numéro de Version *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: V2.2"
                  value={newVerNumber}
                  onChange={(e) => setNewVerNumber(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-white font-mono outline-none focus:ring-1 focus:ring-chery-red"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Notes / Modifications de cette Version *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Détaillez les révisions apportées dans cette mise à jour technique..."
                  value={newVerComment}
                  onChange={(e) => setNewVerComment(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-2.5 bg-neutral-50/50 outline-none focus:ring-1 focus:ring-chery-red resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium text-center cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chery-red hover:bg-chery-dark text-white py-2.5 rounded-lg font-bold text-center cursor-pointer"
                >
                  Valider la Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
