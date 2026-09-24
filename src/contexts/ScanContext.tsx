import React, { createContext, useContext, useState, ReactNode } from "react";

interface ScanContextType {
  imageSrc: string | null;
  setImageSrc: (src: string | null) => void;
  scanResult: any | null;
  setScanResult: (result: any | null) => void;
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  return (
    <ScanContext.Provider value={{
      imageSrc,
      setImageSrc,
      scanResult,
      setScanResult,
      isScanning,
      setIsScanning
    }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
}
