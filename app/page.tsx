"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
  const [moveCount, setMoveCount] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize game state
  useEffect(() => {
    if (!isInitialized) {
      const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
      const initialBottles = [...COLORS].sort(() => Math.random() - 0.5);
      setHiddenRow(shuffledColors.slice(0, 5));
      setBottles(initialBottles.slice(0, 5));
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (timeLeft <= 0 || gameWon) {
      checkGuess();
      setTimeLeft(20);
      return;
    }

    const timer = setInterval(() => {
      if (!gameWon) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameWon]);

  const startNewGame = () => {
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const initialBottles = [...COLORS].sort(() => Math.random() - 0.5);
    setHiddenRow(shuffledColors.slice(0, 5));
    setBottles(initialBottles.slice(0, 5));
    setGameWon(false);
    setTimeLeft(20);
    setMatchedCount(0);
    setMoveCount(0);
    setGuessCount(0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setBottles((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        setMoveCount((prev) => prev + 1);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const checkGuess = () => {
    setGuessCount((prev) => prev + 1);
    const correctPositions = bottles.reduce(
      (acc, bottle, index) => (bottle === hiddenRow[index] ? acc + 1 : acc),
      0
    );

    setMatchedCount(correctPositions);

    if (correctPositions === 5) {
      setGameWon(true);
      toast({
        title: "Perfect Match! ",
        description: "You've arranged all bottles correctly!",
        className: "bg-white text-black border-2 border-[#89FC00]",
      });
      saveGameResult(true);
    }
  };

  const saveGameResult = (won: boolean) => {
    const result = {
      date: new Date().toISOString(),
      won,
      attempts: moveCount,
      timeElapsed: 20 - timeLeft,
    };

    const history = JSON.parse(localStorage.getItem("gameHistory") || "[]");
    localStorage.setItem(
      "gameHistory",
      JSON.stringify([result, ...history].slice(0, 10))
    );
  };

  const handleQuit = () => {
    setGameWon(true); // This will stop the timer and reveal bottles
    toast({
      title: "Game Over",
      description: "The correct answer has been revealed.",
      className: "bg-white text-black border-2 border-[#FF4365]",
    });
    saveGameResult(false);
  };

  // Add sensors for both mouse and touch
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  return (
    <div className="game-container">
      <div className="game-card">
        <h1 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00C2A8]">
          Bottld!
        </h1>

        <div className="flex justify-center mb-6">
          <div className="stats-box">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-[#FF4365]" />
              <span className="text-2xl font-bold">{matchedCount}/5</span>
            </div>
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

          {isInitialized && (
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
          )}
        </div>

        <div className="mt-8 mb-4">
          <div className="w-full bg-[#352C6E] rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center text-white/70">
                <Clock className="w-4 h-4 mr-2" />
                <span>Time Left</span>
              </div>
              <span className="font-mono font-bold text-white">{timeLeft}s</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#6B48FF] to-[#00C2A8] h-full rounded-full transition-all duration-200"
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={gameWon ? startNewGame : handleQuit}
            className="flex-1 bg-[#FF4365] hover:bg-[#FF4365]/90 text-white font-semibold py-6 rounded-2xl"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {gameWon ? "Reset" : "Quit"}
          </Button>
          <Button
            onClick={checkGuess}
            className="flex-1 bg-gradient-to-r from-[#89FC00] to-[#00C2A8] hover:opacity-90 text-background font-semibold py-6 rounded-2xl"
          >
            Submit Guess
          </Button>
        </div>

        <div className="text-center mt-4 text-white/70">
          <span className="mr-4">Moves: {moveCount}</span>
          <span>Guesses: {guessCount}</span>
        </div>

        <Button
          onClick={() => setShowHistory(true)}
          variant="outline"
          className="w-full mt-4 border-2 border-white/20 text-white/70 hover:bg-white/10 font-medium py-4 rounded-2xl"
        >
          <HistoryIcon className="w-4 h-4 mr-2" />
          View History
        </Button>
      </div>

      <History open={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}