"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Bottle } from "@/components/bottle";
import { Button } from "@/components/ui/button";
import { History } from "@/components/history";
import { AppMenu } from "@/components/menu";
import { useToast } from "@/components/ui/use-toast";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { Clock, RotateCcw, History as HistoryIcon, Target } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

const COLORS = ["#FF4365", "#00C2A8", "#89FC00", "#FFB800", "#6B48FF"];

export default function Home() {
  const [bottles, setBottles] = useState<string[]>([]);
  const [hiddenRow, setHiddenRow] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (!showWelcome) {
      startNewGame();
    }
  }, [showWelcome]);

  useEffect(() => {
    if (!isGameRunning) return;

    const gameTimer = setInterval(() => {
      setGameTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(gameTimer);
  }, [isGameRunning]);

  useEffect(() => {
    if (gameWon) {
      return; // Don't start the timer if game is won
    }

    if (timeLeft <= 0) {
      checkGuess(false);
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
    setShowSolution(false);
    setTimeLeft(20);
    setMatchedCount(0);
    setMoveCount(0);
    setGuessCount(0);
    setGameTime(0);
    setIsGameRunning(true);
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
      setMoveCount((prev) => prev + 1);
    }
  };

  const handleQuit = () => {
    setShowSolution(true);
    setGameWon(true); // This will disable the Submit button
    setIsGameRunning(false);
    toast({
      title: "Game Over",
      description: "The solution has been revealed. Click Reset to play again!",
      className: "bg-[#352C6E] border-[#FF4365]/20",
    });
  };

  const checkGuess = (showToast: boolean = true) => {
    const correctPositions = bottles.reduce(
      (acc, bottle, index) => (bottle === hiddenRow[index] ? acc + 1 : acc),
      0
    );

    setMatchedCount(correctPositions);

    if (correctPositions === 5) {
      setGameWon(true);
      setIsGameRunning(false);
      toast({
        title: "Perfect Match!",
        description: `You solved it with ${timeLeft}s left!`,
        className: "bg-[#352C6E] border-[#89FC00]/20",
      });
      saveGameResult(true);
    } else if (showToast) {
      toast({
        title: "Keep Going!",
        description: `${correctPositions}/5 bottles matched correctly.`,
        className: "bg-[#352C6E] border-white/10",
      });
      saveGameResult(false);
    }
    setGuessCount((prev) => prev + 1);
  };

  const saveGameResult = (won: boolean) => {
    if (typeof window === 'undefined') return; // Skip if not in browser

    const result = {
      date: new Date().toISOString(),
      won,
      attempts: guessCount,
      timeElapsed: 20 - timeLeft,
    };

    const history = JSON.parse(localStorage.getItem("gameHistory") || "[]");
    localStorage.setItem(
      "gameHistory",
      JSON.stringify([result, ...history].slice(0, 10))
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-background text-white p-4">
      <AppMenu onHistoryClick={() => setShowHistory(true)} />
      <div className="max-w-lg mx-auto pt-8">
        <div className="relative w-72 h-36 mx-auto mb-8">
          <Image
            src="/images/BOTLD.png"
            alt="Bottld Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#352C6E]/50 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 hover:bg-[#352C6E]/70">
            <div className="flex flex-col items-center">
              <div className="text-white/50 text-sm">Move Timer</div>
              <div className="text-2xl font-bold text-white">{timeLeft}s</div>
            </div>
          </div>
          <div className="bg-[#352C6E]/50 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 hover:bg-[#352C6E]/70">
            <div className="flex items-center justify-center h-full">
              <div className="text-3xl font-bold text-white">
                {matchedCount}/5
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="bg-[#352C6E]/50 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 hover:bg-[#352C6E]/70">
            <div className="flex items-center gap-2 justify-center">
              <Clock className="w-6 h-6 text-[#FFB800]" />
              <span className="text-white/70 text-xl font-semibold">Game time: {formatTime(gameTime)}</span>
            </div>
          </div>
        </div>

        <div className="bottle-rows space-y-8">
          <div className="hidden-row">
            <div className="flex justify-center gap-3">
              {hiddenRow.map((color, index) => (
                <div
                  key={`hidden-${index}`}
                  className="bottle hidden-bottle transition-all duration-500"
                  style={{
                    backgroundColor: showSolution || gameWon ? color : "#666",
                    transform: showSolution || gameWon ? "scale(1.05)" : "scale(1)",
                    boxShadow: showSolution || gameWon ? `0 0 20px ${color}40` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <DndContext
            sensors={sensors}
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

        <div className="mt-8 space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={showSolution || gameWon ? startNewGame : handleQuit}
              className="flex-1 bg-[#FF4365] hover:bg-[#FF4365]/90 text-white font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {showSolution || gameWon ? "Reset" : "Quit"}
            </Button>
            <Button
              onClick={() => checkGuess()}
              disabled={gameWon}
              className="flex-1 bg-gradient-to-r from-[#89FC00] to-[#00C2A8] hover:opacity-90 text-background font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <History open={showHistory} onClose={() => setShowHistory(false)} />
      <WelcomeDialog
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </main>
  );
}