"use client";

import { useEffect, useRef, useState } from "react";

type CanvasColors = {
  brand: string;
  text: string;
  muted: string;
  border: string;
  surface: string;
  success: string;
  warning: string;
  danger: string;
};

const FALLBACK_COLORS: CanvasColors = {
  brand: "#ee4d2d",
  text: "#1b2027",
  muted: "#525d69",
  border: "#d9dde3",
  surface: "#ffffff",
  success: "#157a52",
  warning: "#9a5b00",
  danger: "#b42318",
};

function readColors(): CanvasColors {
  const styles = getComputedStyle(document.documentElement);
  const value = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    brand: value("--brand", FALLBACK_COLORS.brand),
    text: value("--text", FALLBACK_COLORS.text),
    muted: value("--muted", FALLBACK_COLORS.muted),
    border: value("--border", FALLBACK_COLORS.border),
    surface: value("--surface", FALLBACK_COLORS.surface),
    success: value("--success", FALLBACK_COLORS.success),
    warning: value("--warning", FALLBACK_COLORS.warning),
    danger: value("--danger", FALLBACK_COLORS.danger),
  };
}

export function OperationsCanvas({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<CanvasColors>(FALLBACK_COLORS);
  const sizeRef = useRef({ width: 1280, height: 720 });
  const visibleRef = useRef(true);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frameId = 0;
    let timerId = 0;
    let disposed = false;
    const shouldReduceMotion =
      reducedMotion ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    colorsRef.current = readColors();

    const draw = (time = 0) => {
      const { width, height } = sizeRef.current;
      const colors = colorsRef.current;
      context.clearRect(0, 0, width, height);
      context.fillStyle = colors.surface;
      context.fillRect(0, 0, width, height);

      const padding = Math.max(28, width * 0.045);
      const fieldWidth = width - padding * 2;
      const laneGap = fieldWidth / 6;
      const top = height * 0.18;
      const bottom = height * 0.82;

      context.lineWidth = 1;
      context.strokeStyle = colors.border;
      for (let lane = 0; lane < 6; lane += 1) {
        const x = padding + laneGap * (lane + 0.5);
        context.beginPath();
        context.moveTo(x, top);
        context.lineTo(x, bottom);
        context.stroke();

        for (let node = 0; node < 4; node += 1) {
          const y = top + ((bottom - top) / 3) * node;
          context.beginPath();
          context.fillStyle = node === 1 ? colors.brand : colors.surface;
          context.strokeStyle = node === 1 ? colors.brand : colors.muted;
          context.arc(x, y, node === 1 ? 5 : 3, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        }
      }

      const packetProgress = shouldReduceMotion ? 0.62 : (time * 0.00008) % 1;
      for (let packet = 0; packet < 5; packet += 1) {
        const lane = (packet + 1) % 6;
        const x = padding + laneGap * (lane + 0.5);
        const phase = (packetProgress + packet * 0.17) % 1;
        const y = top + (bottom - top) * phase;
        context.fillStyle = colors.brand;
        context.fillRect(x - 8, y - 3, 16, 6);
      }

      const readoutY = height * 0.9;
      [colors.success, colors.warning, colors.danger].forEach(
        (color, index) => {
          const x = padding + index * 74;
          context.strokeStyle = color;
          context.strokeRect(x, readoutY, 56, 18);
        },
      );

      context.fillStyle = colors.text;
      context.font = "600 12px system-ui, sans-serif";
      context.fillText("MARKET SIGNAL", padding, height * 0.1);
      context.fillStyle = colors.muted;
      context.fillText("TASK / PRICE / STORE / RISK", padding, height * 0.14);

      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    };

    const resize = (width: number, height: number) => {
      const safeWidth = Math.max(320, width || 1280);
      const safeHeight = Math.max(360, height || 720);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(safeWidth * dpr);
      canvas.height = Math.round(safeHeight * dpr);
      canvas.style.width = `${safeWidth}px`;
      canvas.style.height = `${safeHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: safeWidth, height: safeHeight };
      draw();
    };

    const tick = (time: number) => {
      if (disposed) return;
      if (visibleRef.current) draw(time);
      timerId = window.setTimeout(() => {
        frameId = requestAnimationFrame(tick);
      }, 40);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) resize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(canvas.parentElement ?? canvas);

    const themeObserver = new MutationObserver(() => {
      colorsRef.current = readColors();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const intersectionObserver = new IntersectionObserver((entries) => {
      visibleRef.current = entries[0]?.isIntersecting ?? true;
    });
    intersectionObserver.observe(canvas);

    if (!shouldReduceMotion) frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [reducedMotion]);

  return (
    <canvas
      aria-hidden="true"
      className="operations-canvas"
      data-canvas-ready={ready ? "true" : "false"}
      ref={canvasRef}
    />
  );
}
