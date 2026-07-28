import React from "react";

interface CheryStaLogoProps {
  className?: string;
  variant?: "full" | "light" | "dark" | "compact";
  height?: number | string;
}

export const CheryStaLogo: React.FC<CheryStaLogoProps> = ({
  className = "h-10 w-auto",
  variant = "full",
  height
}) => {
  const logoSrc = "/sta_chery_logo.svg";

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <img
          src={logoSrc}
          alt="STA Chery Tunisie Logo"
          className="h-8 w-auto object-contain filter brightness-105 contrast-125 drop-shadow-xs"
          style={height ? { height } : undefined}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Chery - STA Société Tunisienne d'Automobiles"
        className="h-10 md:h-12 w-auto object-contain filter brightness-105 contrast-125 transition-transform duration-200 hover:scale-105"
        style={height ? { height } : undefined}
      />
    </div>
  );
};

export default CheryStaLogo;
