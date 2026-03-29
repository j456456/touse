"use client";

import { useCallback, useRef, useState } from "react";

const MULTILINGUAL_WORDS = [
  "こんにちは", "مرحبا", "你好", "Bonjour", "Hola", "Привет",
  "Olá", "안녕하세요", "Γεια", "नमस्ते", "Ciao", "Hej",
  "Merhaba", "สวัสดี", "Xin chào", "Habari", "Kamusta",
  "Salam", "Sawubona", "Aloha", "Buna", "Ahoj",
  "Hallo", "Здравейте", "Tere", "Sveiki", "Saluton",
  "Kumusta", "Jambo", "Selam", "Shalom", "Selamat",
  "வணக்கம்", "ಸ್ವಾಗತ", "ස්තුතියි", "Bawo ni",
];

interface FloatingWord {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function HeroSection() {
  const [words, setWords] = useState<FloatingWord[]>([]);
  const counterRef = useRef(0);
  const lastSpawnRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const now = Date.now();
      if (now - lastSpawnRef.current < 120) return;
      lastSpawnRef.current = now;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 60;

      const word: FloatingWord = {
        id: counterRef.current++,
        text: MULTILINGUAL_WORDS[
          Math.floor(Math.random() * MULTILINGUAL_WORDS.length)
        ],
        x: x + offsetX,
        y: y + offsetY,
      };

      setWords((prev) => [...prev.slice(-30), word]);

      setTimeout(() => {
        setWords((prev) => prev.filter((w) => w.id !== word.id));
      }, 2000);
    },
    []
  );

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[50vh] overflow-hidden cursor-default select-none"
      onMouseMove={handleMouseMove}
    >
      {words.map((word) => (
        <span
          key={word.id}
          className="absolute pointer-events-none font-sans animate-[fadeUp_2s_ease-out_forwards]"
          style={{
            left: word.x,
            top: word.y,
            fontSize: `${14 + Math.random() * 10}px`,
            color: "rgba(0, 0, 0, 0.12)",
          }}
        >
          {word.text}
        </span>
      ))}
      <h1 className="relative z-10 text-5xl md:text-7xl font-semibold font-sans text-black text-center">
        Democratize AI.
      </h1>
    </section>
  );
}
