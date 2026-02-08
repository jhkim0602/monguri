"use client";

// 요놈은 layout.tsx에서 모달 띄울려면 어쩔 수 없다고 합니다 그래서 존재하는거니까 뭐 쩔수인거임

import React, { createContext, useContext, useState, ReactNode } from "react";
import CommonModal, { ModalType } from "@/components/ui/CommonModal";

interface ModalOptions {
  title: string;
  content: React.ReactNode;
  type?: ModalType;
  onConfirm?: (inputValue?: any) => void;
  confirmText?: string;
  cancelText?: string;
  inputPlaceholder?: string;
  defaultValue?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  inputType?: "text" | "textarea";
}

interface ModalContextType {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<ModalOptions>({
    title: "",
    content: null,
  });

  const openModal = (options: ModalOptions) => {
    setModalProps(options);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <CommonModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
