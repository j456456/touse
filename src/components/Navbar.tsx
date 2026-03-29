"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { rockSalt } from "@/lib/fonts";

function initPencilCircles(nav: HTMLElement) {
  const links = nav.querySelectorAll("a");

  function seededRandom(seed: number) {
    const x = Math.sin(seed) * 43758.5453;
    return x - Math.floor(x);
  }

  links.forEach((link, linkIdx) => {
    if (link.querySelector("canvas.pencil-circle")) return;

    const canvas = document.createElement("canvas");
    const w = link.offsetWidth + 40;
    const h = link.offsetHeight + 34;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.className = "pencil-circle";
    link.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const drawn = link.classList.contains("active");
    let progress = drawn ? 1 : 0;
    let animating = false;

    const seed = linkIdx * 1000 + 42;
    const points: { x: number; y: number; p: number }[] = [];
    const totalPts = 120;
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2 - 6;
    const ry = h / 2 - 5;

    for (let i = 0; i <= totalPts + 15; i++) {
      const frac = i / totalPts;
      const angle = frac * Math.PI * 2 - Math.PI * 0.6;
      const r1 = seededRandom(seed + i * 7.3) - 0.5;
      const r2 = seededRandom(seed + i * 13.1) - 0.5;
      const r3 = seededRandom(seed + i * 19.7) - 0.5;
      const wobbleR = r1 * 2 + r2 * 1.5 + Math.sin(frac * 5 + seed) * 1.2;
      const wobbleT = r3 * 0.015;
      const a = angle + wobbleT;
      const x = cx + Math.cos(a) * (rx + wobbleR);
      const y = cy + Math.sin(a) * (ry + wobbleR * 0.7);
      const pressure = 0.7 + seededRandom(seed + i * 31.3) * 0.6;
      points.push({ x, y, p: pressure });
    }

    function drawPencilEllipse(t: number) {
      ctx.clearRect(0, 0, w, h);
      if (t <= 0) return;
      const count = Math.floor(points.length * t);
      if (count < 2) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let seg = 0; seg < count - 1; seg++) {
        const p0 = points[seg];
        const p1 = points[seg + 1];
        const avgP = (p0.p + p1.p) / 2;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(157, 184, 193, " + (0.6 + avgP * 0.25) + ")";
        ctx.lineWidth = 1.2 + avgP * 1.8;
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 0.2;
      for (let seg = 0; seg < count - 1; seg += 3) {
        const p0 = points[seg];
        const p1 = points[Math.min(seg + 1, count - 1)];
        ctx.beginPath();
        ctx.strokeStyle = "#9DB8C1";
        ctx.lineWidth = 0.5 + points[seg].p * 0.5;
        ctx.moveTo(p0.x + 1.5, p0.y - 1);
        ctx.lineTo(p1.x + 1.5, p1.y - 1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function animateIn() {
      if (animating && progress < 1) return;
      animating = true;
      progress = 0;
      function step() {
        progress += 0.04;
        if (progress >= 1) { progress = 1; animating = false; }
        drawPencilEllipse(progress);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function animateOut() {
      animating = false;
      progress = 0;
      drawPencilEllipse(0);
    }

    if (drawn) drawPencilEllipse(1);

    link.addEventListener("mouseenter", () => {
      canvas.style.opacity = "1";
      animateIn();
    });

    link.addEventListener("mouseleave", () => {
      if (!link.classList.contains("active")) {
        canvas.style.opacity = "0";
        setTimeout(() => animateOut(), 250);
      }
    });
  });
}

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) initPencilCircles(navRef.current);
  }, [pathname]);

  return (
    <header className="home-header">
      <Link href="/" className="logo">
        <svg className="tower-icon" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2 L14 6" stroke="#000" strokeWidth="1.2" strokeLinecap="round"/>
          <rect x="11" y="6" width="6" height="5" rx="0.5" stroke="#000" strokeWidth="1" fill="none"/>
          <rect x="9" y="11" width="10" height="6" rx="0.5" stroke="#000" strokeWidth="1" fill="none"/>
          <rect x="7" y="17" width="14" height="6" rx="0.5" stroke="#000" strokeWidth="1" fill="none"/>
          <rect x="5" y="23" width="18" height="7" rx="0.5" stroke="#000" strokeWidth="1" fill="none"/>
          <line x1="14" y1="11" x2="14" y2="30" stroke="#000" strokeWidth="0.6" strokeDasharray="1.5 1.5"/>
          <line x1="11" y1="6" x2="9" y2="11" stroke="#000" strokeWidth="0.6"/>
          <line x1="17" y1="6" x2="19" y2="11" stroke="#000" strokeWidth="0.6"/>
          <path d="M3 30 Q14 33 25 30" stroke="#000" strokeWidth="0.8" fill="none"/>
          <line x1="5" y1="30" x2="3" y2="34" stroke="#000" strokeWidth="0.6"/>
          <line x1="23" y1="30" x2="25" y2="34" stroke="#000" strokeWidth="0.6"/>
          <path d="M2 34 Q14 37 26 34" stroke="#000" strokeWidth="0.7" fill="none"/>
        </svg>
        <span
          className={`${rockSalt.className} select-none`}
          style={{ fontSize: "1.8rem", fontWeight: 400, letterSpacing: "0.5px" }}
        >
          Babel
        </span>
      </Link>

      <nav ref={navRef} className="home-nav">
        <Link href="/" className={pathname === "/" ? "active" : ""}>Home</Link>
        <Link href="/translate" className={pathname === "/translate" ? "active" : ""}>Translate</Link>
        <Link href="/train" className={pathname === "/train" ? "active" : ""}>Train</Link>
      </nav>

      <div className="header-spacer" />
    </header>
  );
}
