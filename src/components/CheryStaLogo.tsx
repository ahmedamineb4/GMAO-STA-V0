import React, { useState } from "react";

interface CheryStaLogoProps {
  className?: string;
  variant?: "full" | "light" | "dark" | "compact";
  height?: number | string;
  showBadge?: boolean;
}

export const CheryStaSvgLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = "h-10 w-auto",
  style
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 920 200"
    className={`${className} object-contain shrink-0`}
    style={style}
    aria-label="STA Chery Tunisie Logo"
  >
    <defs>
      <linearGradient id="cheryChrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="25%" stopColor="#E2E8F0" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="75%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>

      <linearGradient id="cheryDarkChrome" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>

      <linearGradient id="cheryVividRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D00000" />
        <stop offset="100%" stopColor="#C8102E" />
      </linearGradient>
    </defs>

    {/* LEFT PORTION: CHERY LOGO */}
    <g transform="translate(10, 5)">
      <ellipse cx="150" cy="62" rx="135" ry="50" fill="none" stroke="url(#cheryChrome)" strokeWidth="16" />
      <ellipse cx="150" cy="62" rx="135" ry="50" fill="none" stroke="url(#cheryDarkChrome)" strokeWidth="2.5" />
      <ellipse cx="150" cy="62" rx="112" ry="34" fill="none" stroke="url(#cheryChrome)" strokeWidth="6" />

      <path d="M 150 22 L 205 80 L 182 80 L 150 42 L 118 80 L 95 80 Z" fill="url(#cheryChrome)" />
      <path d="M 118 80 C 138 62, 162 62, 182 80 C 162 70, 138 70, 118 80 Z" fill="url(#cheryDarkChrome)" />
      
      <text x="150" y="168" fontFamily="'Arial Black', 'Impact', sans-serif" fontSize="50" fontWeight="900" fill="url(#cheryVividRed)" textAnchor="middle" letterSpacing="12">CHERY</text>
    </g>

    {/* SEPARATOR / DIVIDER LINE */}
    <line x1="365" y1="15" x2="365" y2="185" stroke="#CBD5E1" strokeWidth="2.5" opacity="0.6" />

    {/* RIGHT PORTION: STA LOGO */}
    <g transform="translate(390, 8)">
      <g fill="url(#cheryVividRed)">
        <path d="M 15 15 L 145 15 L 145 42 L 60 42 C 48 42, 42 48, 42 58 C 42 68, 48 73, 68 78 L 112 88 C 138 94, 148 108, 148 128 C 148 152, 128 162, 92 162 L 5 162 L 5 135 L 92 135 C 102 135, 108 130, 108 122 C 108 114, 102 109, 82 105 L 45 95 C 18 88, 8 74, 8 54 C 8 32, 22 15, 70 15 Z" />
        <path d="M 135 15 L 270 15 L 270 42 L 220 42 L 220 162 L 178 162 L 178 42 L 135 42 Z" />
        <path d="M 298 15 L 360 15 L 435 162 L 388 162 L 370 126 L 290 126 L 272 162 L 230 162 Z M 330 46 L 300 102 L 360 102 Z" />
      </g>

      <path d="M 0 160 C 80 140, 180 98, 280 98 C 335 98, 380 115, 480 156 C 380 134, 275 118, 180 118 C 90 118, 25 145, 0 160 Z" fill="#1E293B" />
      <path d="M 110 128 C 160 105, 240 102, 300 116 C 250 112, 170 112, 110 128 Z" fill="#C8102E" opacity="0.9" />

      <text x="235" y="192" fontFamily="'Trebuchet MS', 'Segoe UI', 'Arial', sans-serif" fontSize="28" fontWeight="800" fill="#C8102E" textAnchor="middle" letterSpacing="1">Société Tunisienne d'Automobiles</text>
    </g>
  </svg>
);

export const CheryStaLogo: React.FC<CheryStaLogoProps> = ({
  className = "h-9 w-auto",
  variant = "full",
  height,
  showBadge = false
}) => {
  const [imgError, setImgError] = useState(false);
  const officialLogoJpg = "/sta_chery_official_logo.jpg";

  const isDarkVariant = variant === "dark";
  const customStyle = height ? { height } : undefined;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {!imgError ? (
        <img
          src={officialLogoJpg}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          alt="STA Chery Tunisie"
          className="h-full w-auto max-h-12 object-contain rounded-sm"
          style={customStyle}
        />
      ) : (
        <CheryStaSvgLogo className="h-full w-auto max-h-12" style={customStyle} />
      )}

      {showBadge && (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-100 text-chery-red border border-red-200 shrink-0">
          GMAO STA
        </span>
      )}
    </div>
  );
};

export default CheryStaLogo;

