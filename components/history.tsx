"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { format } from "date-fns";
import { Trophy, Clock } from "lucide-react";

interface HistoryProps {
  open: boolean;
  onClose: () => void;
}

interface GameResult {
  date: string;
  won: boolean;
  timeElapsed: number;
}

export function History({ open, onClose }: HistoryProps) {
  const [history, setHistory] = useState<GameResult[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]");
    setHistory(savedHistory);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#2A2356] text-white border-none rounded-3xl max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Game History
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {history.map((game: GameResult, index: number) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white/90">
                  {format(new Date(game.date), "MMM d, HH:mm")}
                </span>
                <div
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
                    game.won
                      ? "bg-[#89FC00]/20 text-[#89FC00]"
                      : "bg-[#FF4365]/20 text-[#FF4365]"
                  }`}
                >
                  {game.won ? <Trophy className="w-4 h-4" /> : null}
                  {game.won ? "Won" : "Lost"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="w-4 h-4" />
                <span>{game.timeElapsed}s</span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-white/50 py-4">No games played yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}