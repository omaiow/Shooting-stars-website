import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type FocusCard = {
  title: string;
  src?: string;
  gradient?: string;
  onClick?: () => void;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: FocusCard;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={card.onClick}
      className={cn(
        "rounded-2xl relative overflow-hidden aspect-[4/5] w-full transition-all duration-300 ease-out cursor-pointer",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
      style={!card.src ? { background: card.gradient ?? "linear-gradient(135deg,#111,#222)" } : undefined}
    >
      {card.src && (
        <img
          src={card.src}
          alt={card.title}
          className="object-cover absolute inset-0 w-full h-full"
        />
      )}
      {/* Placeholder label when no image */}
      {!card.src && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/10 text-xs font-mono tracking-widest uppercase">drop image here</span>
        </div>
      )}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-6 px-5 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
          {card.title}
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

export function FocusCards({ cards }: { cards: FocusCard[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}

