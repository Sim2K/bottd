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

const ALL_CANS = [
  "can-1.png",
  "can-2.png",
  "can-3.png",
  "can-4.png",
  "can-5.png",
  "can-6.png",
  "can-7.png",
];

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
    if (!isGameRunning || gameWon) {
      return; // Don't start the timer if game is not running or is won
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
  }, [timeLeft, isGameRunning, gameWon]);

  const startNewGame = () => {
    // Randomly select 5 cans from the available 8
    const selectedCans = [...ALL_CANS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    // Create two random arrangements of the selected cans
    const shuffledHidden = [...selectedCans].sort(() => Math.random() - 0.5);
    const shuffledBottles = [...selectedCans].sort(() => Math.random() - 0.5);

    setHiddenRow(shuffledHidden);
    setBottles(shuffledBottles);
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
            src="/images/botlld_logo.png"
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
              <div className="text-2xl font-bold text-white">{isGameRunning && !gameWon ? timeLeft : "--"}s</div>
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

        <div className="bottle-rows space-y-3 min-h-[250px] flex flex-col justify-center">
          <div className={`hidden-row ${(showSolution || gameWon) ? 'game-over' : ''}`}>
            <div className="flex justify-center gap-2 min-h-[120px]">
              {hiddenRow.map((can, index) => (
                <div
                  key={`hidden-${index}`}
                  className={`bottle ${!(showSolution || gameWon) ? 'hidden-bottle' : ''} transition-all duration-500`}
                >
                  {(showSolution || gameWon) ? (
                    <div className="h-[120px] w-[60px] relative">
                      <Image
                        src={`/images/cans/${can}`}
                        alt="Can"
                        fill
                        className="object-contain"
                        sizes="60px"
                        style={{
                          transform: "scale(1.05)",
                          filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))"
                        }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-[60px] h-[120px] bg-gray-600 rounded-lg"
                      style={{
                        transform: "scale(1)"
                      }}
                    />
                  )}
                </div>
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
              <div className="flex justify-center gap-2 min-h-[120px]">
                {bottles.map((can) => (
                  <Bottle key={can} id={can} color={can} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-center gap-6 mt-4 w-full max-w-md mx-auto">
          <div className="flex-1 bg-[#352C6E]/50 backdrop-blur-sm rounded-xl px-4 py-2 transition-all duration-300 hover:bg-[#352C6E]/70">
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/50 text-sm">Moves:</span>
              <span className="text-lg font-bold text-white">{moveCount}</span>
            </div>
          </div>
          <div className="flex-1 bg-[#352C6E]/50 backdrop-blur-sm rounded-xl px-4 py-2 transition-all duration-300 hover:bg-[#352C6E]/70">
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/50 text-sm">Guesses:</span>
              <span className="text-lg font-bold text-white">{guessCount}</span>
            </div>
          </div>
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