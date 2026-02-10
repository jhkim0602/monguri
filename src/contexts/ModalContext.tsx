"use client";

// 요놈은 layout.tsx에서 모달 띄울려면 어쩔 수 없다고 합니다 그래서 존재하는거니까 뭐 쩔수인거임

import React, { createContext, useContext, useState, ReactNode } from "react";
import CommonModal, { ModalType } from "@/components/ui/CommonModal";

interface ModalOptions {
  title: string;
  content: React.ReactNode;
  type?: ModalType;
  onConfirm?: (inputValue?: any) => void;
  onClose?: () => void | Promise<void>;
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

  const closeModal = async () => {
    // 사용자 정의 onClose 콜백이 있으면 호출 (자동 저장 등)
    if (modalProps.onClose) {
      await modalProps.onClose();
    }
    setIsOpen(false);
  };

  // onClose를 제외한 나머지 props만 전달
  const { onClose: _, ...restModalProps } = modalProps;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <CommonModal isOpen={isOpen} onClose={closeModal} {...restModalProps} />
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
