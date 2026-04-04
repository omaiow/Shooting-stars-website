import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type FocusCard = {
  title: string;
  src?: string;
  gradient?: string;
  onClick?: () => void;
  // Optional expandable info
  description?: string;
  process?: string;
  software?: { name: string; role: string }[];
  accentColor?: string;
  // Photo specific fields
  location?: string;
  camera?: string;
  thoughtProcess?: string;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    selected,
    setHovered,
    setSelected,
  }: {
    card: FocusCard;
    index: number;
    hovered: number | null;
    selected: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    setSelected: React.Dispatch<React.SetStateAction<number | null>>;
  }) => {
    const accent = card.accentColor ?? "#a855f7";
    const isSelected = selected === index;
    const hasInfo = !!(card.description || card.process || card.location || card.thoughtProcess || card.software?.length);

    const handleClick = () => {
      if (card.onClick) {
        card.onClick();
      } else if (hasInfo) {
        setSelected(isSelected ? null : index);
      }
    };

    return (
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onClick={handleClick}
        className={cn(
          "rounded-2xl relative overflow-hidden aspect-[4/5] w-full transition-all duration-300 ease-out",
          hasInfo ? "cursor-pointer" : "cursor-default",
          hovered !== null && hovered !== index && selected === null && "blur-sm scale-[0.98]",
          isSelected && "ring-2"
        )}
        style={{
          ...(isSelected ? { ringColor: accent } : {}),
          ...(!card.src ? { background: card.gradient ?? "linear-gradient(135deg,#111,#222)" } : {}),
        }}
      >
        {card.src && (
          <img
            src={card.src}
            alt={card.title}
            className="object-cover absolute inset-0 w-full h-full"
          />
        )}
        {!card.src && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/10 text-xs font-mono tracking-widest uppercase">drop image here</span>
          </div>
        )}

        {/* Hover overlay with title */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-end py-6 px-5 transition-opacity duration-300",
            hovered === index || isSelected ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="w-full">
            {card.title && (
              <div className="text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
                {card.title}
              </div>
            )}
            {hasInfo && (
              <div
                className="text-xs mt-1 font-mono tracking-widest flex items-center gap-1"
                style={{ color: accent }}
              >
                {isSelected ? "— collapse" : "— tap to expand"}
              </div>
            )}
          </div>
        </div>

        {/* Selected border glow */}
        {isSelected && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: `inset 0 0 0 2px ${accent}`, borderRadius: "1rem" }}
          />
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export function FocusCards({ cards }: { cards: FocusCard[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const selectedCard = selected !== null ? cards[selected] : null;
  const accent = selectedCard?.accentColor ?? "#a855f7";

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {cards.map((card, index) => (
          <Card
            key={card.title || index}
            card={card}
            index={index}
            hovered={hovered}
            selected={selected}
            setHovered={setHovered}
            setSelected={setSelected}
          />
        ))}
      </div>

      {/* Expandable info panel */}
      <AnimatePresence>
        {selectedCard && (selectedCard.description || selectedCard.process || selectedCard.location || selectedCard.thoughtProcess || selectedCard.software?.length) && (
          <motion.div
            key={`info-${selected}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
              className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              style={{ borderColor: accent + "33" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="text-xs tracking-widest uppercase font-medium"
                    style={{ color: accent }}
                  >
                    {selectedCard.title}
                  </span>
                  {selectedCard.description && (
                    <p className="text-white/80 text-sm mt-1 leading-relaxed">
                      {selectedCard.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="ml-4 flex-shrink-0 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {selectedCard.process && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase font-medium text-neutral-500 mb-2">How I made it</p>
                  <p className="text-neutral-300 text-sm leading-relaxed">{selectedCard.process}</p>
                </div>
              )}

              {selectedCard.thoughtProcess && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase font-medium text-neutral-500 mb-2">Thought Process</p>
                  <p className="text-neutral-300 text-sm leading-relaxed">{selectedCard.thoughtProcess}</p>
                </div>
              )}

              {selectedCard.location && (
                <div className="mb-4 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-neutral-300 text-sm">{selectedCard.location}</span>
                </div>
              )}

              {selectedCard.camera && (
                <div className="mb-4 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                    <circle cx="12" cy="13" r="3"></circle>
                  </svg>
                  <span className="text-neutral-300 text-sm font-semibold" style={{ color: accent }}>Camera:</span>
                  <span className="text-neutral-300 text-sm">{selectedCard.camera}</span>
                </div>
              )}

              {selectedCard.software && selectedCard.software.length > 0 && (
                <div>
                  <p className="text-xs tracking-widest uppercase font-medium text-neutral-500 mb-3">Software used</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.software.map(s => (
                      <div
                        key={s.name}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 border border-white/5 bg-white/[0.03]"
                      >
                        <span className="text-sm font-semibold" style={{ color: accent }}>{s.name}</span>
                        <span className="text-neutral-500 text-xs">— {s.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
