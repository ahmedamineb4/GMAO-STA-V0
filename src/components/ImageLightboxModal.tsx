import React, { useState, useEffect } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RefreshCcw,
  Camera
} from "lucide-react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = "Aperçu & Zoom Photo"
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset zoom & position whenever image changes or modal opens
  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetTransform();
  }, [initialIndex, isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        handlePrev();
      } else if (e.key === "ArrowRight" && images.length > 1) {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        resetTransform();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, zoomScale]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentSrc = images[currentIndex] || images[0];

  const resetTransform = () => {
    setZoomScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 0.75);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetTransform();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetTransform();
  };

  const handleToggleZoom = () => {
    if (zoomScale > 1) {
      resetTransform();
    } else {
      setZoomScale(2);
    }
  };

  // Mouse drag handlers for panning when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomScale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = currentSrc;
      link.download = `gmao-photo-detail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erreur téléchargement photo", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Bar Navigation & Actions */}
      <div
        className="w-full flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-2xl px-4 py-3 text-white shadow-2xl shrink-0 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-chery-red/20 text-chery-red border border-chery-red/30 shrink-0">
            <Camera className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-white truncate">{title}</h3>
            {images.length > 1 && (
              <span className="text-[10px] text-neutral-400 font-bold block">
                Photo {currentIndex + 1} sur {images.length}
              </span>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            title="Dézoomer (-)"
            disabled={zoomScale <= 0.75}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/80 cursor-pointer transition-all disabled:opacity-40"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {/* Zoom scale indicator badge */}
          <button
            type="button"
            onClick={handleToggleZoom}
            title="Cliquez pour basculer 100% / 200%"
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-black font-mono border border-neutral-700/80 cursor-pointer min-w-[54px] text-center"
          >
            {Math.round(zoomScale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            title="Agrandir / Zoomer (+)"
            disabled={zoomScale >= 4}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/80 cursor-pointer transition-all disabled:opacity-40"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Rotate */}
          <button
            type="button"
            onClick={handleRotate}
            title="Faire pivoter 90°"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/80 cursor-pointer transition-all"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Reset transform */}
          <button
            type="button"
            onClick={resetTransform}
            title="Réinitialiser le zoom"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/80 cursor-pointer transition-all"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>

          <div className="h-5 w-[1px] bg-neutral-800 mx-1 hidden sm:block" />

          {/* Download photo */}
          <button
            type="button"
            onClick={handleDownload}
            title="Télécharger l'image"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-blue-400 hover:text-blue-300 border border-neutral-700/80 cursor-pointer transition-all hidden sm:flex"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            title="Fermer (Échap)"
            className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 cursor-pointer transition-all ml-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage Viewport */}
      <div
        className="relative flex-1 w-full my-3 flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-900/40 border border-neutral-800/60"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          if (e.deltaY < 0) {
            handleZoomIn();
          } else {
            handleZoomOut();
          }
        }}
        style={{ cursor: zoomScale > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in" }}
      >
        {/* Gallery Prev Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 z-20 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 shadow-2xl cursor-pointer transition-transform hover:scale-110"
            title="Photo Précédente"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* The Image Element */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={currentSrc}
            alt={title}
            referrerPolicy="no-referrer"
            onClick={handleToggleZoom}
            className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl transition-transform duration-100 ease-out select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale}) rotate(${rotation}deg)`,
              transformOrigin: "center center"
            }}
          />
        </div>

        {/* Gallery Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 shadow-2xl cursor-pointer transition-transform hover:scale-110"
            title="Photo Suivante"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom info helper bar */}
      <div
        className="w-full flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-2 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Maximize2 className="h-3.5 w-3.5 text-chery-red" />
          <span>Double-cliquez sur la photo ou faites défiler la molette pour zoomer / dézoomer. Glissez la souris pour explorer les détails.</span>
        </span>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold text-neutral-500">
          <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Échap</kbd> Fermer
          <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 font-bold">+</kbd> Zoom +
          <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 font-bold">-</kbd> Zoom -
        </div>
      </div>
    </div>
  );
}
