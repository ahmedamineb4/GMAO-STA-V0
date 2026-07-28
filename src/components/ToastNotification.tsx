import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-xs font-bold text-white max-w-md ${
          type === "success"
            ? "bg-slate-900/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40"
            : type === "error"
            ? "bg-slate-900/95 border-red-500/50 text-red-100 shadow-red-950/40"
            : "bg-slate-900/95 border-blue-500/50 text-blue-100 shadow-blue-950/40"
        }`}
      >
        {type === "success" && (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        )}
        {type === "error" && (
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
        )}
        {type === "info" && (
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
        )}
        <span className="flex-1 leading-snug">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ml-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
