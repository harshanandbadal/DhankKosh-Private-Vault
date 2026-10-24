"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
  setPrivate: (val: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivate: false,
  togglePrivacy: () => {},
  setPrivate: () => {},
});

export function PrivacyProvider({
  children,
  initialPrivate = false,
}: {
  children: React.ReactNode;
  initialPrivate?: boolean;
}) {
  const [isPrivate, setIsPrivate] = useState<boolean>(initialPrivate);

  useEffect(() => {
    const saved = localStorage.getItem("dhankosh_privacy_mode");
    if (saved !== null) {
      setIsPrivate(saved === "true");
    }
  }, []);

  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      const next = !prev;
      localStorage.setItem("dhankosh_privacy_mode", String(next));
      return next;
    });
  };

  const setPrivate = (val: boolean) => {
    setIsPrivate(val);
    localStorage.setItem("dhankosh_privacy_mode", String(val));
  };

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, setPrivate }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
