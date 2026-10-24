"use client";

import React, { createContext, useContext, useState } from "react";

export type ModalType =
  | "CREATE_BANK"
  | "CREATE_CARD"
  | "CREATE_PHYSICAL"
  | "CREATE_P2P"
  | "CREATE_GIFT"
  | "NEW_TRANSACTION"
  | "P2P_TRANSACTION"
  | "QUICK_BANK"
  | "SETTINGS"
  | null;

interface ModalContextType {
  activeModal: ModalType;
  modalPayload: any;
  openModal: (type: ModalType, payload?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  activeModal: null,
  modalPayload: null,
  openModal: () => {},
  closeModal: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);

  const openModal = (type: ModalType, payload?: any) => {
    setActiveModal(type);
    setModalPayload(payload || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  return (
    <ModalContext.Provider value={{ activeModal, modalPayload, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
