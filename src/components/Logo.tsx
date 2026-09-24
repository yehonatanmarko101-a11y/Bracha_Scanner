import React from "react";
import logoImg from "../assets/images/exec-d2904ada-8f8e-4c14-adcc-8888a80ca756.png";

interface LogoProps {
  size?: number;
  className?: string;
  variant?: "icon" | "full";
  textColor?: string;
}

export default function Logo({ 
  size = 80, 
  className = "", 
  variant = "icon",
  textColor = "text-foreground"
}: LogoProps) {
  
  if (variant === "icon") {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`relative overflow-hidden rounded-3xl inline-block select-none shadow-sm ${className}`}
      >
        <img
          src={logoImg}
          alt="BrachaScanner Icon"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-sm" style={{ width: size * 1.3, height: size * 1.3 }}>
        <img
          src={logoImg}
          alt="BrachaScanner"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

