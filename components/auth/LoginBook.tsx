import { useEffect, useRef } from "react";

import {
  buildEpicycles,
  epicycleChain,
  penDown,
  type EpicycleChain,
  type EpicycleModel,
} from "@/lib/epicycles";
import {
  LOGIN_BOOK_CONTOURS,
  LOGIN_BOOK_HEIGHT,
  LOGIN_BOOK_WIDTH,
} from "@/lib/loginBookContours";

const BRAND = "#12556F";
const CIRCLES = 100; // enough for a readable word, cheap to draw
const DURATION = 6; // seconds for one pass
const PAD_X = 14;
const PAD_Y = 75;

const RULED =
  "repeating-linear-gradient(0deg, transparent 0 33px, rgba(18,85,111,.10) 33px 34px), #fbf6e9";

/**
 * Left-hand login visual: a flat sketched open book. On the right page spinning
 * circles (Fourier epicycles) write "openlibry"; the finished word is filled in.
 * Click the word to replay. Shown when LOGIN_STYLE=book.
 */
export default function LoginBook({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !canvas.parentElement) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const model: EpicycleModel = buildEpicycles(LOGIN_BOOK_CONTOURS);

    let dpr = 1;
    let sc = 1;
    let raf = 0;
    let t = 0;
    let last = 0;
    let done = false;
    let trail: Array<[number, number, boolean]> = [];

    const setTransform = () =>
      ctx.setTransform(
        dpr * sc,
        0,
        0,
        dpr * sc,
        dpr * sc * PAD_X,
        dpr * sc * PAD_Y,
      );

    function drawFrame(chain: EpicycleChain | null) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      setTransform();
      ctx!.lineCap = ctx!.lineJoin = "round";
      if (chain) {
        ctx!.lineWidth = 1 / sc;
        for (let j = 0; j < chain.length - 1 && j < 60; j++) {
          const r = chain[j + 1][2];
          if (r < 2.5 || r > 260) continue;
          ctx!.strokeStyle = "rgba(18,85,111,.22)";
          ctx!.beginPath();
          ctx!.arc(chain[j][0], chain[j][1], r, 0, 7);
          ctx!.stroke();
          ctx!.strokeStyle = "rgba(18,85,111,.40)";
          ctx!.beginPath();
          ctx!.moveTo(chain[j][0], chain[j][1]);
          ctx!.lineTo(chain[j + 1][0], chain[j + 1][1]);
          ctx!.stroke();
        }
      }
      ctx!.strokeStyle = BRAND;
      ctx!.lineWidth = 5;
      ctx!.beginPath();
      let pen = false;
      for (const p of trail) {
        if (!p[2]) {
          pen = false;
          continue;
        }
        if (pen) ctx!.lineTo(p[0], p[1]);
        else {
          ctx!.moveTo(p[0], p[1]);
          pen = true;
        }
      }
      ctx!.stroke();
      if (chain) {
        const tip = chain[chain.length - 1];
        ctx!.fillStyle = "#c2410c";
        ctx!.beginPath();
        ctx!.arc(tip[0], tip[1], 7, 0, 7);
        ctx!.fill();
      }
    }

    function drawFinal() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      setTransform();
      const path = new Path2D();
      let run: Array<[number, number, number]> = [];
      const flush = () => {
        if (run.length > 2) {
          run.forEach((p, i) =>
            i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]),
          );
          path.closePath();
        }
        run = [];
      };
      const S = 3000;
      for (let i = 0; i < S; i++) {
        const u = i / S;
        if (penDown(model, u)) {
          const chain = epicycleChain(model, u, CIRCLES);
          run.push(chain[chain.length - 1]);
        } else flush();
      }
      flush();
      ctx!.fillStyle = BRAND;
      ctx!.fill(path, "evenodd");
    }

    function redraw() {
      if (done) drawFinal();
      else drawFrame(raf ? epicycleChain(model, t, CIRCLES) : null);
    }

    function fit() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas!.clientWidth;
      if (!cssW) return;
      sc = cssW / (LOGIN_BOOK_WIDTH + PAD_X * 2);
      const cssH = Math.round((LOGIN_BOOK_HEIGHT + PAD_Y * 2) * sc);
      canvas!.style.height = `${cssH}px`;
      canvas!.width = cssW * dpr;
      canvas!.height = cssH * dpr;
      redraw();
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let chain: EpicycleChain | null = null;
      for (let s = 0; s < 6; s++) {
        t += dt / DURATION / 6;
        if (t >= 1) {
          raf = 0;
          done = true;
          drawFinal();
          return;
        }
        chain = epicycleChain(model, t, CIRCLES);
        const q = chain[chain.length - 1];
        trail.push([q[0], q[1], penDown(model, t)]);
      }
      drawFrame(chain);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      cancelAnimationFrame(raf);
      t = 0;
      trail = [];
      done = false;
      if (reduce) {
        done = true;
        drawFinal();
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(fit);
    observer.observe(canvas.parentElement);
    canvas.addEventListener("click", start);
    fit();
    start();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("click", start);
    };
  }, []);

  return (
    <div
      className={`relative items-center justify-center overflow-hidden p-7 ${className}`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 55%, #f4f9fa 0%, #dfe9ec 62%, #c9d9de 100%)",
      }}
      aria-hidden="true"
    >
      {/* faint ruled-paper desk */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 31px, rgba(18,85,111,.12) 31px 32px)",
        }}
      />

      <svg width="0" height="0" className="absolute">
        <filter
          id="loginbook-wobble"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
      </svg>

      {/* cover */}
      <div
        className="relative w-full max-w-[940px] rounded-[14px] p-4"
        style={{
          aspectRatio: "1.46 / 1",
          background: `linear-gradient(160deg, #1a6a88, ${BRAND} 55%, #0d3f54)`,
          boxShadow: "0 30px 45px -18px rgba(0,0,0,.45), 0 4px 0 #0b3446",
        }}
      >
        <div
          className="relative flex h-full w-full overflow-hidden rounded-md"
          style={{
            boxShadow: "0 0 0 3px rgba(255,255,255,.55), 0 0 0 4px #e4d9bd",
          }}
        >
          {/* left page: bookshelf sketch */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{
              background: `linear-gradient(270deg, rgba(0,0,0,.16), transparent 14%), ${RULED}`,
            }}
          >
            <div className="absolute inset-y-[7%] left-[7%] right-[9%] flex items-center justify-center">
              <svg
                viewBox="0 0 170 200"
                className="h-auto w-[78%] overflow-visible"
                style={{ filter: "url(#loginbook-wobble)" }}
                fill="none"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g stroke={BRAND}>
                  <rect x="10" y="10" width="150" height="180" />
                  <path d="M10 70 H160 M10 130 H160" />
                </g>
                <g stroke="#2b3a42">
                  <path d="M24 70 V28 H40 V70 M44 70 V36 H56 V70 M60 70 V24 H78 V70 M104 70 L96 36 L110 32 L120 68" />
                  <path d="M22 130 V90 H34 V130 M38 130 V82 H54 V130 M58 130 V96 H70 V130 M100 130 V86 H118 V130 M122 130 V94 H134 V130" />
                  <path d="M24 190 V150 H44 V190 M48 190 V142 H60 V190 M64 190 V156 H84 V190" />
                </g>
                <path stroke="#c2410c" d="M120 190 V140 H138 V190" />
                <path
                  stroke="#2b3a42"
                  fill="rgba(18,85,111,.15)"
                  d="M92 190 V160 H112 V190 Z"
                />
              </svg>
            </div>
          </div>

          {/* right page: the writing */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{
              background: `linear-gradient(90deg, rgba(0,0,0,.16), transparent 14%), ${RULED}`,
            }}
          >
            <div
              className="absolute -top-0.5 right-[9%] h-[84px] w-[22px] bg-[#c2410c]"
              style={{
                clipPath: "polygon(0 0,100% 0,100% 100%,50% 84%,0 100%)",
              }}
            />
            <div className="absolute inset-y-[7%] left-[6%] right-[3%] flex flex-col justify-center">
              <canvas ref={canvasRef} className="block w-full cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
