"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Bottle } from "@/components/bottle";
import { Button } from "@/components/ui/button";
import { History } from "@/components/history";
import { useToast } from "@/components/ui/use-toast";
import { Clock, RotateCcw, History as HistoryIcon, Target } from "lucide-react";

const COLORS = ["#FF4365", "#00C2A8", "#89FC00", "#FFB800", "#6B48FF"];

export default function Home() {
  const [bottles, setBottles] = useState<string[]>([]);
  const [hiddenRow, setHiddenRow] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [matchedCount, setMatchedCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      checkGuess();
      setTimeLeft(20);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const startNewGame = () => {
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const initialBottles = [...COLORS].sort(() => Math.random() - 0.5);
    setHiddenRow(shuffledColors.slice(0, 5));
    setBottles(initialBottles.slice(0, 5));
    setGameWon(false);
    setTimeLeft(20);
    setMatchedCount(0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setBottles((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const checkGuess = () => {
    const correctPositions = bottles.reduce(
      (acc, bottle, index) => (bottle === hiddenRow[index] ? acc + 1 : acc),
      0
    );

    setMatchedCount(correctPositions);

    if (correctPositions === 5) {
      setGameWon(true);
      toast({
        title: "Perfect Match! 🎉",
        description: "You've arranged all bottles correctly!",
      });
      saveGameResult(true);
    } else {
      toast({
        title: "Keep Going!",
        description: `${correctPositions}/5 bottles matched correctly.`,
      });
      saveGameResult(false);
    }
  };

  const saveGameResult = (won: boolean) => {
    const result = {
      date: new Date().toISOString(),
      won,
      attempts: 1,
      timeElapsed: 20 - timeLeft,
    };

    const history = JSON.parse(localStorage.getItem("gameHistory") || "[]");
    localStorage.setItem(
      "gameHistory",
      JSON.stringify([result, ...history].slice(0, 10))
    );
  };

  return (
    <div className="game-container">
      <div className="game-card">
        <h1 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00C2A8]">
          Color Match
        </h1>

        <div className="flex gap-4 mb-6">
          <div className="stats-box">
            <Clock className="w-6 h-6 text-[#00C2A8]" />
            <span className="text-sm font-medium text-white/70">Time Left</span>
            <span className="text-2xl font-bold">{timeLeft}s</span>
          </div>
          <div className="stats-box">
            <Target className="w-6 h-6 text-[#FF4365]" />
            <span className="text-sm font-medium text-white/70">Matched</span>
            <span className="text-2xl font-bold">{matchedCount}/5</span>
          </div>
        </div>

        <div className="bottle-rows">
          <div className="hidden-row">
            <div className="flex justify-center gap-3">
              {hiddenRow.map((color, index) => (
                <div
                  key={`hidden-${index}`}
                  className="bottle hidden-bottle"
                  style={{ backgroundColor: gameWon ? color : '#666' }}
                />
              ))}
            </div>
          </div>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={bottles}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex justify-center gap-3">
                {bottles.map((color) => (
                  <Bottle key={color} id={color} color={color} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex gap-3 justify-center mb-4">
          <Button
            onClick={startNewGame}
            className="flex-1 bg-[#FF4365] hover:bg-[#FF4365]/90 text-white font-semibold py-6 rounded-2xl"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
          <Button
            onClick={checkGuess}
            className="flex-1 bg-gradient-to-r from-[#89FC00] to-[#00C2A8] hover:opacity-90 text-background font-semibold py-6 rounded-2xl"
          >
            Submit Guess
          </Button>
        </div>

        <Button
          onClick={() => setShowHistory(true)}
          variant="outline"
          className="w-full border-2 border-white/20 text-white/70 hover:bg-white/10 font-medium py-4 rounded-2xl"
        >
          <HistoryIcon className="w-4 h-4 mr-2" />
          View History
        </Button>
      </div>

      <History open={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}