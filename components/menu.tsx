"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface MenuProps {
  onHistoryClick: () => void;
}

export function AppMenu({ onHistoryClick }: MenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="absolute left-4 top-4 p-2 hover:bg-white/10 rounded-lg"
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] bg-[#2A2356]/95 border-r border-white/10"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={onHistoryClick}
            className="w-full justify-start text-white hover:bg-white/10"
          >
            Game History
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
