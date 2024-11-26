"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeDialog({ open, onClose }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[768px] bg-transparent border-0 shadow-none flex flex-col items-center justify-center min-h-screen">
        <DialogHeader>
          <DialogTitle className="sr-only">Welcome to Bottld</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-12">
          <div className="relative w-[512px] h-64">
            <Image
              src="/images/BOTLD.png"
              alt="Bottld Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-[#89FC00] to-[#00C2A8] hover:opacity-90 text-background font-semibold py-6 px-8 rounded-2xl transition-all duration-300 hover:scale-105 text-lg"
          >
            Let&apos;s Play!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
