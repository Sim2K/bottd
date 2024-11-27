"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

interface BottleProps {
  id: string;
  color: string;
}

export function Bottle({ id, color }: BottleProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bottle cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-105"
    >
      <div className="h-[120px] w-[60px] relative">
        <Image
          src={`/images/cans/${color}`}
          alt="Can"
          fill
          className="object-contain"
          sizes="60px"
        />
      </div>
    </div>
  );
}