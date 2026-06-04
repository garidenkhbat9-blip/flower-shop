"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface DialogOptions {
  title?: string;
  message: string;
  type: "alert" | "confirm";
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AdminDialogContextType {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const AdminDialogContext = createContext<AdminDialogContextType | null>(null);

export function useAdminDialog() {
  const context = useContext(AdminDialogContext);
  if (!context) {
    throw new Error("useAdminDialog must be used within an AdminDialogProvider");
  }
  return context;
}

export function AdminDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const alert = useCallback((message: string, title = "Мэдэгдэл") => {
    return new Promise<void>((resolve) => {
      setDialog({
        title,
        message,
        type: "alert",
        onConfirm: () => {
          setDialog(null);
          resolve();
        }
      });
    });
  }, []);

  const confirm = useCallback((message: string, title = "Баталгаажуулах") => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        title,
        message,
        type: "confirm",
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <AdminDialogContext.Provider value={{ alert, confirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
            onClick={() => {
              if (dialog.type === "confirm" && dialog.onCancel) {
                dialog.onCancel();
              } else if (dialog.onConfirm) {
                dialog.onConfirm();
              }
            }}
          />
          
          {/* Dialog Box - Premium minimalist style */}
          <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-[400px] p-6 sm:p-8 rounded-[4px] transform transition-all duration-300 scale-100 flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="space-y-2">
              {dialog.title && (
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                  {dialog.title}
                </h3>
              )}
              <p className="text-sm font-semibold text-black leading-relaxed">
                {dialog.message}
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              {dialog.type === "confirm" && (
                <button
                  onClick={dialog.onCancel}
                  className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-black border border-black/20 hover:bg-[#FCFBF9] transition-all rounded-[2px] cursor-pointer"
                >
                  Цуцлах
                </button>
              )}
              <button
                onClick={dialog.onConfirm}
                className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] bg-[#1A1A1A] text-white hover:bg-black transition-all rounded-[2px] shadow-lg shadow-black/5 cursor-pointer"
              >
                Зөвшөөрөх
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDialogContext.Provider>
  );
}
