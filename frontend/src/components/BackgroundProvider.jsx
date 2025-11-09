import React, { useMemo, useState, createContext, useContext } from "react";
// Import the portal wrapper from our background folder. The AmbientBackdrop
// was a previous implementation and should not be used here.
import { BackgroundPortal } from "@/components/background";

const BgCtx = createContext(null);

export function BackgroundProvider({ children, defaultEnabled = true, defaultDensity = 28 }) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [density, setDensity] = useState(defaultDensity);

  const value = useMemo(() => ({ enabled, setEnabled, density, setDensity }), [enabled, density]);

  return (
    <BgCtx.Provider value={value}>
      {children}
      <BackgroundPortal enabled={enabled} density={density} />
    </BgCtx.Provider>
  );
}

export function useBackground() {
  return useContext(BgCtx);
}
