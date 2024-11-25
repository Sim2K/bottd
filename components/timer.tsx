"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface TimerProps {
  duration: number;
  onTimeout: () => void;
}

export function Timer({ duration, onTimeout }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      setTimeLeft(duration);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, duration, onTimeout]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-[#6B48FF]">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-semibold">Time Left</span>
        </div>
        <span className="font-mono font-bold text-[#6B48FF]">{timeLeft}s</span>
      </div>
      <Progress 
        value={(timeLeft / duration) * 100} 
        className="h-3 bg-[#6B48FF]/20 rounded-full"
      >
        <div 
          className="h-full bg-gradient-to-r from-[#6B48FF] to-[#00C2A8] rounded-full transition-all duration-200"
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        />
      </Progress>
    </div>
  );
}