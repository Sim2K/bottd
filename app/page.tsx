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
import { WelcomeDialog } from "@/components/welcome-dialog"; // Import WelcomeDialog component
import { useToast } from "@/components/ui/use-toast";
import { Clock, RotateCcw, History as HistoryIcon, Target } from "lucide-react";
import Image from "next/image"; // Import Image component from next/image

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
  const [showWelcome, setShowWelcome] = useState(true); // Add showWelcome state
  const { toast } = useToast();

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
  }, [timeLeft, gameWon]);

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
        title: "Perfect Match! ",
        description: `You solved it with ${timeLeft}s left!`,
      });
      saveGameResult(true);
    } else if (showToast) {
      toast({
        title: "Keep Going!",
        description: `${correctPositions}/5 bottles matched correctly.`,
      });
      saveGameResult(false);
    }
    setGuessCount((prev) => prev + 1);
  };

  const saveGameResult = (won: boolean) => {
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] to-[#2A2356] p-4 md:p-8">
      <div className="max-w-md mx-auto bg-[#2A2356]/50 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
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
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#00C2A8]" />
              <span className="text-white/70 text-lg">Move timer: {timeLeft}s</span>
            </div>
          </div>
          <div className="bg-[#352C6E]/50 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 hover:bg-[#352C6E]/70">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-[#FF4365]" />
              <span className="text-white/70 text-lg">Matched: {matchedCount}/5</span>
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
              onClick={showSolution ? startNewGame : handleQuit}
              className="flex-1 bg-[#FF4365] hover:bg-[#FF4365]/90 text-white font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {showSolution ? "Reset" : "Quit"}
            </Button>
            <Button
              onClick={() => checkGuess()}
              disabled={gameWon}
              className="flex-1 bg-gradient-to-r from-[#89FC00] to-[#00C2A8] hover:opacity-90 text-background font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Guess
            </Button>
          </div>

          <div className="text-center text-white/70 font-medium space-x-6">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4365]"></span>
              Moves: {moveCount}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C2A8]"></span>
              Guesses: {guessCount}
            </span>
          </div>

          <Button
            onClick={() => setShowHistory(true)}
            variant="outline"
            className="w-full border-2 border-white/10 text-white/70 hover:bg-white/5 font-medium py-4 rounded-2xl transition-all duration-300"
          >
            <HistoryIcon className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>
      </div>

      <History open={showHistory} onClose={() => setShowHistory(false)} />
      <WelcomeDialog open={showWelcome} onClose={() => setShowWelcome(false)} />
    </div>
  );
}