"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, HelpCircle, CheckCircle2 } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
  const [resolveRef, setResolveRef] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef({ resolve });
    });
  }, []);

  const handleClose = useCallback((value: boolean) => {
    setIsOpen(false);
    if (resolveRef) {
      resolveRef.resolve(value);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const getIcon = () => {
    switch (options.variant) {
      case "danger":
        return <AlertTriangle className="w-10 h-10 text-red-500 bg-red-500/10 p-2.5 rounded-full border border-red-500/20" />;
      case "warning":
        return <AlertTriangle className="w-10 h-10 text-amber-500 bg-amber-500/10 p-2.5 rounded-full border border-amber-500/20" />;
      case "success":
        return <CheckCircle2 className="w-10 h-10 text-emerald-500 bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20" />;
      case "info":
      default:
        return <HelpCircle className="w-10 h-10 text-[#D4AF37] bg-[#D4AF37]/10 p-2.5 rounded-full border border-[#D4AF37]/20" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (options.variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white border-transparent shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-[0_0_15px_rgba(245,158,11,0.2)]";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.2)]";
      case "info":
      default:
        return "bg-[#D4AF37] hover:bg-[#B3932D] text-[#022c22] border-transparent shadow-[0_0_15px_rgba(212,175,55,0.2)]";
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(false); }}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-sm border border-[#D4AF37]/35 bg-[#022c22]/95 backdrop-blur-lg text-[#FDFBF7] p-5 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-4">
          <div className="flex justify-center mt-2">{getIcon()}</div>
          <DialogHeader className="gap-1 flex flex-col items-center">
            <DialogTitle className="text-base font-bold tracking-tight text-white">
              {options.title || "Konfirmasi Tindakan"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-300 font-light mt-1.5 max-w-[280px] leading-relaxed">
              {options.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end -mx-0 -mb-0 p-0 border-t-0 bg-transparent">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="w-full sm:flex-1 rounded-full border-white/10 hover:bg-white/5 text-gray-300 h-9 font-bold transition-all text-xs"
            >
              {options.cancelText || "Batal"}
            </Button>
            <Button
              type="button"
              onClick={() => handleClose(true)}
              className={`w-full sm:flex-1 rounded-full h-9 font-bold transition-all text-xs ${getConfirmButtonStyles()}`}
            >
              {options.confirmText || "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
