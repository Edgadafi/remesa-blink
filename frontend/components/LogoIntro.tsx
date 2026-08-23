"use client";

import {
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dashboard } from "@/components/Dashboard";

/* ── Timeline (ms) — total ~8.5s ─────────────────────────────── */
const MS = {
  particlesEnd: 2000,
  bubbleStart: 1800,
  bubbleEnd: 3600,
  letterStart: 3200,
  letterEnd: 4800,
  dotStart: 4800,
  dotEnd: 6000,
  wordmark: 5800,
  idle: 6000,
  dissolve: 10000,
  total: 11000,
} as const;

const VIEW_W = 200;
const VIEW_H = 168;

const BUBBLE_PATH =
  "M 44 28 C 44 18 52 10 64 10 H 136 C 148 10 156 18 156 28 V 96 C 156 106 148 114 136 114 H 78 L 52 138 L 58 114 H 64 C 52 114 44 106 44 96 Z";

const GOLD = "#C9A84C";
const GREEN_DARK = "#163D28";
const GREEN_MID = "#2B6E4A";
const CREAM = "#F7F4EA";

const easeCinematic: Transition["ease"] = [0.22, 1, 0.36, 1];
const easeSoft: Transition["ease"] = [0.45, 0, 0.15, 1];

type LogoIntroProps = {
  children?: ReactNode;
  onComplete?: () => void;
  skipIntro?: boolean;
};

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  alpha: number;
  phase: number;
  delay: number;
};

function sampleBubbleOutline(pathEl: SVGPathElement, count: number): Particle[] {
  const len = pathEl.getTotalLength();
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * len;
    const pt = pathEl.getPointAtLength(t);
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    return {
      x: pt.x + Math.cos(angle) * dist,
      y: pt.y + Math.sin(angle) * dist,
      tx: pt.x,
      ty: pt.y,
      size: 0.8 + Math.random() * 2.4,
      alpha: 0.25 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2,
      delay: Math.random() * 0.35,
    };
  });
}

function useGoldenParticles(
  active: boolean,
  pathRef: React.RefObject<SVGPathElement>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const path = pathRef.current;
    const canvas = canvasRef.current;
    if (!path || !canvas) return;

    particlesRef.current = sampleBubbleOutline(path, 140);
    startRef.current = 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { cssW, cssH };
    };

    let { cssW, cssH } = resize();
    const scaleX = () => cssW / VIEW_W;
    const scaleY = () => cssH / VIEW_H;

    const draw = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;

      if (elapsed > MS.bubbleEnd + 800) return;

      const traceProgress = Math.min(Math.max((elapsed - 200) / MS.particlesEnd, 0), 1);
      const fadeOut = elapsed > MS.bubbleStart
        ? 1 - Math.min((elapsed - MS.bubbleStart) / 1200, 1)
        : 1;

      ctx.clearRect(0, 0, cssW, cssH);

      const sx = scaleX();
      const sy = scaleY();
      const scale = Math.max(sx, sy);

      for (const p of particlesRef.current) {
        const localT = Math.min(
          Math.max((traceProgress - p.delay) / (1 - p.delay * 0.5), 0),
          1
        );
        const ease = 1 - (1 - localT) ** 4;
        const swirl = Math.sin(now * 0.003 + p.phase) * 3 * (1 - ease);
        const x = (p.x + (p.tx - p.x) * ease + swirl) * sx;
        const y = (p.y + (p.ty - p.y) * ease + swirl * 0.5) * sy;
        const alpha = p.alpha * ease * fadeOut;
        if (alpha < 0.02) continue;

        const glow = p.size * 4 * scale;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, glow);
        grad.addColorStop(0, `rgba(255, 236, 190, ${alpha * 0.95})`);
        grad.addColorStop(0.35, `rgba(201, 168, 76, ${alpha * 0.75})`);
        grad.addColorStop(1, "rgba(201, 168, 76, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, p.size * scale * (0.6 + ease * 0.4), 0, Math.PI * 2);
        ctx.fill();

        if (ease > 0.4 && fadeOut > 0.3) {
          ctx.strokeStyle = `rgba(201, 168, 76, ${alpha * 0.15})`;
          ctx.lineWidth = 0.6 * scale;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - (p.tx - p.x) * sx * 0.08, y - (p.ty - p.y) * sy * 0.08);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => {
      ({ cssW, cssH } = resize());
    };
    window.addEventListener("resize", onResize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [active, pathRef]);

  return canvasRef;
}

function LogoMark({
  uid,
  pathLength,
}: {
  uid: string;
  pathLength: number;
}) {
  const strokeId = `${uid}-stroke`;
  const fillId = `${uid}-fill`;
  const glowId = `${uid}-glow`;
  const goldId = `${uid}-gold`;
  const warmId = `${uid}-warm`;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full max-w-[min(300px,78vw)]"
      aria-hidden
    >
      <defs>
        <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GREEN_MID} />
          <stop offset="50%" stopColor={GREEN_DARK} />
          <stop offset="100%" stopColor={GREEN_MID} />
        </linearGradient>
        <linearGradient id={fillId} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#1e4d32" />
          <stop offset="55%" stopColor={GREEN_DARK} />
          <stop offset="100%" stopColor="#0f2819" />
        </linearGradient>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feColorMatrix
            in="b"
            type="matrix"
            values="0 0 0 0 0.17  0 0 0 0 0.43  0 0 0 0 0.29  0 0 0 0.55 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={goldId} cx="28%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#FFF4D6" />
          <stop offset="40%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#7A5A12" />
        </radialGradient>
        <radialGradient id={warmId} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="rgba(201,168,76,0.35)" />
          <stop offset="100%" stopColor="rgba(201,168,76,0)" />
        </radialGradient>
      </defs>

      {/* Outline trace — drawn before fill */}
      <motion.path
        d={BUBBLE_PATH}
        fill="none"
        stroke={GOLD}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        initial={{ strokeDashoffset: pathLength, opacity: 0 }}
        animate={{ strokeDashoffset: 0, opacity: [0, 0.85, 0.35] }}
        transition={{
          strokeDashoffset: { delay: 0.35, duration: 1.65, ease: easeCinematic },
          opacity: { delay: 0.35, duration: 1.65, times: [0, 0.7, 1] },
        }}
      />

      {/* Liquid bubble materialize */}
      <motion.g
        initial={{ scale: 0.42, opacity: 0, filter: "blur(20px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{
          delay: MS.bubbleStart / 1000,
          duration: 1.65,
          ease: easeCinematic,
        }}
        style={{ transformOrigin: "100px 72px", transformBox: "fill-box" }}
      >
        <motion.ellipse
          cx="100"
          cy="72"
          rx="72"
          ry="58"
          fill={`url(#${warmId})`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.9, 0.5], scale: [0.5, 1.15, 1] }}
          transition={{
            delay: MS.bubbleStart / 1000,
            duration: 1.4,
            times: [0, 0.55, 1],
          }}
          style={{ transformOrigin: "100px 72px", transformBox: "fill-box" }}
        />

        <path
          d={BUBBLE_PATH}
          fill={`url(#${fillId})`}
          stroke={`url(#${strokeId})`}
          strokeWidth={2.5}
          filter={`url(#${glowId})`}
        />

        <path
          d="M 52 32 Q 100 22 148 32"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={2}
          strokeLinecap="round"
        />

        <motion.text
          x="100"
          y="81"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={CREAM}
          fontFamily="Georgia, 'Times New Roman', Times, serif"
          fontSize="54"
          fontWeight="700"
          initial={{ scale: 0.72, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            delay: MS.letterStart / 1000,
            type: "spring",
            stiffness: 220,
            damping: 16,
            mass: 0.9,
          }}
          style={{
            transformOrigin: "100px 81px",
            transformBox: "fill-box",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
          }}
        >
          T
        </motion.text>

        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: MS.dotStart / 1000,
            duration: 0.65,
            ease: easeCinematic,
          }}
          style={{ transformOrigin: "152px 36px", transformBox: "fill-box" }}
        >
          <motion.circle
            cx="152"
            cy="36"
            r="16"
            fill={`url(#${warmId})`}
            animate={{ scale: [0, 1.8, 1], opacity: [0, 0.7, 0] }}
            transition={{
              delay: MS.dotStart / 1000,
              duration: 1.1,
              times: [0, 0.35, 1],
            }}
            style={{ transformOrigin: "152px 36px", transformBox: "fill-box" }}
          />
          <motion.circle
            cx="152"
            cy="36"
            r="9"
            fill={`url(#${goldId})`}
            animate={{
              filter: [
                "drop-shadow(0 0 0 rgba(201,168,76,0))",
                "drop-shadow(0 0 24px rgba(255,220,140,0.95))",
                "drop-shadow(0 0 12px rgba(201,168,76,0.55))",
              ],
            }}
            transition={{
              delay: MS.dotStart / 1000,
              duration: 1.2,
              times: [0, 0.4, 1],
            }}
          />
          <circle cx="149.5" cy="33" r="2.2" fill="rgba(255,255,255,0.55)" />
          {[0, 0.25, 0.5].map((offset) => (
            <motion.circle
              key={offset}
              cx="152"
              cy="36"
              r="9"
              fill="none"
              stroke={GOLD}
              strokeWidth={1.2}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{
                delay: MS.dotStart / 1000 + offset,
                duration: 1.05,
                ease: "easeOut",
              }}
              style={{ transformOrigin: "152px 36px", transformBox: "fill-box" }}
            />
          ))}
        </motion.g>
      </motion.g>
    </svg>
  );
}

export function LogoIntro({
  children,
  onComplete,
  skipIntro = false,
}: LogoIntroProps) {
  const uid = useId().replace(/:/g, "");
  const reducedMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const completedRef = useRef(false);
  const [dissolve, setDissolve] = useState(false);
  const [ready, setReady] = useState(false);
  const [pathLength, setPathLength] = useState(520);

  const skip = skipIntro || reducedMotion;
  const canvasRef = useGoldenParticles(!skip && ready, pathRef);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (skip) {
      finish();
      return;
    }
    const dissolveTimer = window.setTimeout(() => setDissolve(true), MS.dissolve);
    const doneTimer = window.setTimeout(finish, MS.total);
    return () => {
      window.clearTimeout(dissolveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [ready, skip, finish]);

  const dashboard = children ?? <Dashboard />;

  if (!ready) {
    return <div className="min-h-screen w-full bg-black" aria-hidden />;
  }

  if (skip) {
    return <div className="min-h-screen w-full">{dashboard}</div>;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <motion.div
        className="relative z-0 min-h-screen w-full"
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{
          opacity: dissolve ? 1 : 0,
          filter: dissolve ? "blur(0px)" : "blur(8px)",
        }}
        transition={{ duration: 1.15, ease: easeSoft }}
        aria-hidden={!dissolve}
      >
        {dashboard}
      </motion.div>

      <motion.div
        className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center bg-black"
        initial={{ opacity: 1 }}
        animate={{
          opacity: dissolve ? 0 : 1,
          scale: dissolve ? 1.02 : 1,
        }}
        transition={{ duration: 1, ease: easeSoft }}
        aria-label="Intro holatia"
        role="img"
      >
        {/* Vignette + ambient glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(43,110,74,0.18) 0%, transparent 65%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <motion.div
          className="relative flex flex-col items-center px-6"
          animate={
            dissolve
              ? { y: 0, rotate: 0 }
              : { y: [0, -7, 0], rotate: [0, 0.6, 0, -0.6, 0] }
          }
          transition={
            dissolve
              ? { duration: 0.3 }
              : {
                  delay: MS.idle / 1000,
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <div className="relative aspect-[200/168] w-[min(300px,78vw)]">
            <div className="absolute inset-0 rounded-full bg-[#2B6E4A]/20 blur-3xl backdrop-blur-sm" />

            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />

            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
              aria-hidden
            >
              <path ref={pathRef} d={BUBBLE_PATH} fill="none" />
            </svg>

            <div className="relative z-10 drop-shadow-[0_8px_48px_rgba(22,61,40,0.55)]">
              <LogoMark uid={uid} pathLength={pathLength} />
            </div>
          </div>

          <motion.p
            className="mt-10 font-sans text-[1.05rem] font-medium tracking-[0.22em] text-white/95 md:text-xl"
            initial={{ opacity: 0, y: 18, letterSpacing: "0.42em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.14em" }}
            transition={{
              delay: MS.wordmark / 1000,
              duration: 1.1,
              ease: easeCinematic,
            }}
          >
            holatia
            <span className="text-[#C9A84C]">.app</span>
          </motion.p>

          <motion.p
            className="mt-2 font-sans text-xs tracking-[0.18em] text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: MS.wordmark / 1000 + 0.35, duration: 0.8 }}
          >
            Tu esfuerzo, directo a casa.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
