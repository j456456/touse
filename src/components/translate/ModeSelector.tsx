"use client";

import type { Mode } from "@/lib/types";

const MODES: { value: Mode; label: string; description: string }[] = [
  { value: "native", label: "Native", description: "Send prompt as-is" },
  {
    value: "translate",
    label: "Via English",
    description: "Translate → English → Back",
  },
  {
    value: "compare",
    label: "Compare",
    description: "Side-by-side comparison",
  },
];

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ mode, onModeChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-celadon/30">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          disabled={disabled}
          className={`
            flex flex-col px-4 py-2.5 rounded-xl text-left transition-all duration-200
            ${
              mode === m.value
                ? "bg-black text-white shadow-md"
                : "bg-white text-black border border-black/10 hover:bg-black/5"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <span className="text-sm font-medium font-sans">{m.label}</span>
          <span
            className={`text-[11px] leading-tight ${
              mode === m.value ? "text-white/60" : "text-black/40"
            }`}
          >
            {m.description}
          </span>
        </button>
      ))}
    </div>
  );
}
