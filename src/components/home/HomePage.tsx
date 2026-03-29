"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { rockSalt, caveat, pangolin } from "@/lib/fonts";

declare global {
  interface Window {
    THREE: typeof import("three");
    pdfjsLib: any;
  }
}

const HELLO_WORDS = [
  "bonjour", "hola", "ciao", "hallo", "olá",
  "こんにちは", "안녕", "مرحبا", "नमस्ते", "สวัสดี",
  "привет", "你好", "γειά", "merhaba", "jambo",
  "sawubona", "salam", "aloha", "shalom", "xin chào",
  "habari", "tere", "ahoj", "salut", "hei",
  "buna", "kamusta", "selam", "bok", "salve",
];

export default function HomePage() {
  const globeRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLParagraphElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const pageInfoRef = useRef<HTMLSpanElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const floatingWordsRef = useRef<HTMLSpanElement[]>([]);
  const lastSpawnRef = useRef(0);
  const threeScriptsLoaded = useRef(false);
  const pdfScriptLoaded = useRef(false);

  const initGlobe = useCallback(() => {
    const container = globeRef.current;
    if (!container || !window.THREE) return;
    while (container.firstChild) container.removeChild(container.firstChild);
    const THREE = window.THREE;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 2.6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    const earthTex = loader.load("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
    const bumpTex = loader.load("https://unpkg.com/three-globe/example/img/earth-topology.png");

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      bumpMap: bumpTex,
      bumpScale: 0.04,
      specular: new THREE.Color(0x111111),
      shininess: 5,
      emissive: new THREE.Color(0x334466),
      emissiveIntensity: 0.3,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.x = 0.41;
    scene.add(earth);

    const cloudTex = loader.load("https://unpkg.com/three-globe/example/img/earth-clouds.png");
    const cloudGeo = new THREE.SphereGeometry(1.008, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    clouds.rotation.x = 0.41;
    scene.add(clouds);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-5, -2, -5);
    scene.add(fill);
    const back = new THREE.DirectionalLight(0xffffff, 0.3);
    back.position.set(0, 5, -5);
    scene.add(back);

    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      earth.rotation.y += 0.0008;
      clouds.rotation.y += 0.00025;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const initPencilCircles = useCallback(() => {
    const links = navRef.current?.querySelectorAll("a");
    if (!links) return;

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
  }, []);

  const initScrollReveal = useCallback(() => {
    const targets = document.querySelectorAll(
      ".split-left, .split-divider, .split-right, .comparison-cards-reveal, .flow-block, .research-stats, .research-heading, .pdf-viewer"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.25 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const initTypewriter = useCallback(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const text = "Our solution.";
    let typed = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !typed) {
            typed = true;
            let i = 0;
            function typeChar() {
              if (i < text.length) {
                heading!.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, 80);
              } else {
                heading!.classList.add("done");
                if (ctaRef.current) ctaRef.current.style.opacity = "1";
              }
            }
            typeChar();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  const initFloatingWords = useCallback(() => {
    const active = floatingWordsRef.current;
    const MAX = 14;

    const handler = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 0.3) return;

      const now = Date.now();
      if (now - lastSpawnRef.current < 320) return;
      lastSpawnRef.current = now;

      const target = e.target as HTMLElement;
      if (
        target.closest(".home-header") ||
        target.closest(".globe-container") ||
        target.closest(".hero-text") ||
        target.closest(".scroll-prompt")
      )
        return;

      if (active.length >= MAX) {
        const oldest = active.shift();
        if (oldest?.parentNode) oldest.remove();
      }

      const el = document.createElement("span");
      el.className = `hover-word ${caveat.className}`;
      el.textContent = HELLO_WORDS[Math.floor(Math.random() * HELLO_WORDS.length)];

      const ox = (Math.random() - 0.5) * 70;
      const oy = (Math.random() - 0.5) * 50;
      el.style.left = e.clientX + ox + "px";
      el.style.top = e.clientY + oy + "px";
      el.style.fontSize = 1.4 + Math.random() * 0.8 + "rem";
      el.style.transform = "rotate(" + ((Math.random() - 0.5) * 20) + "deg)";

      document.body.appendChild(el);
      active.push(el);

      el.addEventListener("animationend", () => {
        if (el.parentNode) el.remove();
        const idx = active.indexOf(el);
        if (idx > -1) active.splice(idx, 1);
      });
    };

    document.body.addEventListener("mousemove", handler);
    return () => document.body.removeEventListener("mousemove", handler);
  }, []);

  const initPdfViewer = useCallback(() => {
    if (!window.pdfjsLib) return;

    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    let pdfDoc: any = null;
    let currentPage = 1;
    const canvas = pdfCanvasRef.current!;

    function renderPage(num: number) {
      pdfDoc.getPage(num).then((page: any) => {
        const containerWidth = pdfViewerRef.current!.clientWidth;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const dpr = window.devicePixelRatio || 1;
        const scale = (containerWidth / unscaledViewport.width) * dpr;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = containerWidth + "px";
        canvas.style.height =
          (containerWidth * unscaledViewport.height) / unscaledViewport.width + "px";

        const ctx = canvas.getContext("2d")!;

        page.render({ canvasContext: ctx, viewport });

        if (pageInfoRef.current)
          pageInfoRef.current.textContent = "Page " + num + " / " + pdfDoc.numPages;
        if (prevBtnRef.current) prevBtnRef.current.disabled = num <= 1;
        if (nextBtnRef.current) nextBtnRef.current.disabled = num >= pdfDoc.numPages;
      });
    }

    window.pdfjsLib.getDocument({
      url: "/BABEL.pdf",
      cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
    }).promise.then((doc: any) => {
      pdfDoc = doc;
      renderPage(1);
    });

    const handlePrev = () => {
      if (currentPage > 1) { currentPage--; renderPage(currentPage); }
    };
    const handleNext = () => {
      if (pdfDoc && currentPage < pdfDoc.numPages) { currentPage++; renderPage(currentPage); }
    };

    prevBtnRef.current?.addEventListener("click", handlePrev);
    nextBtnRef.current?.addEventListener("click", handleNext);

    return () => {
      prevBtnRef.current?.removeEventListener("click", handlePrev);
      nextBtnRef.current?.removeEventListener("click", handleNext);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("home-no-scroll");

    const scrollTimer = setTimeout(() => {
      document.body.classList.remove("home-no-scroll");
      document.body.classList.add("home-scrollable");
    }, 3200);

    return () => {
      clearTimeout(scrollTimer);
      document.body.classList.remove("home-no-scroll", "home-scrollable");
    };
  }, []);

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    const loadThree = () => {
      if (threeScriptsLoaded.current) {
        const c = initGlobe();
        if (c) cleanups.push(c);
        initPencilCircles();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = () => {
        threeScriptsLoaded.current = true;
        const c = initGlobe();
        if (c) cleanups.push(c);
        initPencilCircles();
      };
      document.head.appendChild(script);
    };

    const loadPdf = () => {
      if (pdfScriptLoaded.current) {
        const c = initPdfViewer();
        if (c) cleanups.push(c);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        pdfScriptLoaded.current = true;
        const c = initPdfViewer();
        if (c) cleanups.push(c);
      };
      document.head.appendChild(script);
    };

    loadThree();
    loadPdf();

    const c1 = initScrollReveal();
    if (c1) cleanups.push(c1);
    const c2 = initTypewriter();
    if (c2) cleanups.push(c2);
    const c3 = initFloatingWords();
    if (c3) cleanups.push(c3);

    return () => cleanups.forEach((fn) => fn());
  }, [initGlobe, initPencilCircles, initScrollReveal, initTypewriter, initFloatingWords, initPdfViewer]);

  return (
    <>
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

        <nav ref={navRef} className="home-nav" id="main-nav">
          <Link href="/" className={pathname === "/" ? "active" : ""}>Home</Link>
          <Link href="/translate" className={pathname === "/translate" ? "active" : ""}>Translate</Link>
          <Link href="/train" className={pathname === "/train" ? "active" : ""}>Train</Link>
        </nav>

        <div className="header-spacer" />
      </header>

      <main className="home-main">
        <div className="postit-container">
          <div className={`postit left ${pangolin.className}`}>
            LLMs are overwhelmingly trained on English, with about <strong>92.65%</strong> of GPT-3&apos;s training data coming from English text.
          </div>
          <div className={`postit right ${pangolin.className}`}>
            Yet <strong>fewer than 20%</strong> of people globally speak English, meaning most users are interacting with systems not built around their language.
          </div>
        </div>

        <div className="globe-container" id="globe-container" ref={globeRef} />

        <div className="hero-text">
          <h1>Democratizing AI.</h1>
          <p>
            Building AI that belongs to{" "}
            <span className="underline-wrap">
              the whole world.
              <svg className="pencil-underline" viewBox="0 0 200 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8 Q30 4, 60 7 Q90 10, 120 6 Q150 3, 180 7 Q190 8, 198 6" stroke="#000" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55"/>
                <path d="M4 9 Q40 5, 80 8 Q120 11, 160 7 Q185 5, 196 7" stroke="#000" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.25"/>
              </svg>
            </span>
          </p>
        </div>

        <div className="scroll-prompt">
          <div className="arrow">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>See more.</span>
        </div>
      </main>

      <section className="section-two">
        <div className="split-layout">
          <div className="split-left">
            <h2>AI is leaving non-English speakers behind.</h2>
          </div>
          <div className="split-divider">
            <svg viewBox="0 0 4 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 0 Q3 20, 1.5 40 Q0.5 60, 2.5 80 Q3.5 100, 1.5 120 Q0.5 140, 2.5 160 Q3.5 180, 2 200" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3"/>
            </svg>
          </div>
          <div className="split-right">
            <p>AI can only benefit the world if it benefits <em>everybody</em>. Current LLMs are trained heavily on English-language data, and underperform significantly for the billions of non-English speakers who need it. This risks creating new divides along language lines, causing systematic exclusion for lower-resource languages.</p>
          </div>
        </div>
      </section>

      <section className="comparison-section comparison-cards-reveal">
        <p style={{ width: "100%", textAlign: "center", fontSize: "1.55rem", fontWeight: 700, marginBottom: "0.8rem", color: "#000" }}>
          Consider the following results from the <em>same prompt</em> in Chinese and English.
        </p>

        <div className="flip-card">
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <div className="card-label">Prompt — Chinese</div>
              <div className="card-prompt">Sandy 最初有一整张披萨，她分了一半给朋友 Robert。她吃掉了自己那份中的 6 片里的 2 片。Robert 跑走后吃掉了自己那份的一半，随后一只海鸥从 Robert 吃掉的那部分里叼走了相当于其 1/6 大小的一口。请问现在还剩下多少披萨？</div>
              <div className="card-hint">Hover to see the response →</div>
            </div>
            <div className="flip-card-back">
              <div className="response-label wrong">✗ Incorrect Response</div>
              <pre>{`Sandy：1/3 + Robert：1/4

通分：

1/3 = 4/12, 1/4 = 3/12
剩余 = 4/12 + 3/12 = 7/12

最终答案：
👉 还剩下 7/12 张披萨。`}</pre>
            </div>
          </div>
        </div>

        <div className="flip-card">
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <div className="card-label">Prompt — English</div>
              <div className="card-prompt">Sandy starts with an entire pizza and shares half of it with a friend Robert. She eats 2 out of her 6 slices. Robert runs away and eats half of his portion, and a seagull takes a bite of size 1/6 of what Robert ate. How much pizza is remaining?</div>
              <div className="card-hint">Hover to see the response →</div>
            </div>
            <div className="flip-card-back">
              <div className="response-label correct">✓ Correct Response</div>
              <pre>{`Let's track everything carefully in fractions of the whole pizza.

1. Initial split
   Total pizza = 1
   Sandy gives half to Robert → each gets 1/2

2. Sandy's part
   Her half is divided into 6 slices:
   Each slice = (1/2) ÷ 6 = 1/12
   She eats 2 slices: 2 × 1/12 = 1/6
   Remaining with Sandy: 1/2 - 1/6 = 2/6 = 1/3

3. Robert's part
   Starts with 1/2
   Eats half of it → eats 1/4
   Remaining with Robert: 1/2 - 1/4 = 1/4

4. Seagull
   Eats 1/6 of what Robert ate
   Robert ate 1/4, so seagull eats: 1/6 × 1/4 = 1/24

5. Total remaining pizza
   Before seagull: 1/3 + 1/4 = 4/12 + 3/12 = 7/12
   After seagull: 7/12 - 1/24 = 14/24 - 1/24 = 13/24

Final answer: 13/24 of the pizza remains.`}</pre>
            </div>
          </div>
        </div>

        <h2
          className="typewriter-heading"
          ref={headingRef}
          id="solution-heading"
          style={{ width: "100%", textAlign: "center", fontSize: "2.2rem", fontWeight: 700, marginTop: "2.5rem", marginBottom: "0.8rem", color: "#000" }}
        />
        <p
          className="comparison-cta"
          ref={ctaRef}
          style={{ width: "100%", textAlign: "center", fontSize: "1.55rem", fontWeight: 400, marginTop: 0, color: "#000", maxWidth: "900px", lineHeight: 1.6, opacity: 0, transition: "opacity 0.6s ease" }}
        >
          We want better AI, in <strong>every language</strong>. We turn any prompt into a higher performing English prompt, and bring the results back home seamlessly. We empower users to turn every interaction into improvement: they can <strong>continuously shape AI</strong> in their own language through <strong>real-time feedback</strong>.
        </p>
      </section>

      <section className="flow-section">
        <div className="flow-block">
          <div className="flow-label">Without Babel:</div>
          <div className="flow-steps">
            <div className="flow-box no-babel">Prompt in native language</div>
            <span className="flow-arrow">→</span>
            <div className="flow-box no-babel">Translate to English</div>
            <span className="flow-arrow">→</span>
            <div className="flow-box no-babel">Prompt in English</div>
            <span className="flow-arrow">→</span>
            <div className="flow-box no-babel">Translate output back to native language</div>
          </div>
          <div className="flow-steps" style={{ marginTop: "0.6rem" }}>
            <div className="flow-box no-babel">No way to improve training data from the user end.</div>
          </div>
        </div>

        <div className="flow-block">
          <div className="flow-label">With Babel:</div>
          <div className="flow-steps">
            <div className="flow-box babel">Prompt in native language</div>
          </div>
          <div className="flow-steps" style={{ marginTop: "0.6rem" }}>
            <div className="flow-box babel">Continuously provide feedback to train and refine models.</div>
          </div>
        </div>
      </section>

      <section className="research-section">
        <h2 className="research-heading" style={{ fontSize: "2.2rem", marginBottom: "0.8rem" }}>Our results.</h2>
        <p className="research-stats" style={{ textAlign: "center", fontSize: "1.2rem", lineHeight: 1.8, color: "#2a2a2a", maxWidth: "850px" }}>
          By translating to English beforehand, we found a <strong>25%–75% increase in generated image quality</strong> and a <strong>10%–50% increase in outputted text</strong> when benchmarked using state-of-the-art reward model <em>ImageReward</em> and text evaluator <em>Prometheus</em>, all without burdening the user experience whatsoever.
        </p>
        <h2 className="research-heading">Still curious? Read our paper.</h2>
        <div className="pdf-viewer" id="pdf-viewer" ref={pdfViewerRef}>
          <canvas id="pdf-canvas" ref={pdfCanvasRef} />
          <div className="pdf-controls">
            <button id="pdf-prev" ref={prevBtnRef}>← Previous</button>
            <span id="pdf-page-info" ref={pageInfoRef}>Page 1 / ?</span>
            <button id="pdf-next" ref={nextBtnRef}>Next →</button>
          </div>
        </div>
      </section>
    </>
  );
}
