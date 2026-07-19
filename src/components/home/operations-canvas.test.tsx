import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { OperationsCanvas } from "./operations-canvas";

let context: Record<string, ReturnType<typeof vi.fn>>;

class ResizeObserverStub {
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(callback: ResizeObserverCallback) {
    callback(
      [
        {
          contentRect: { width: 960, height: 560 },
          target: document.body,
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }
}

class IntersectionObserverStub {
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(callback: IntersectionObserverCallback) {
    callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

beforeEach(() => {
  context = {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
  };
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(
    HTMLCanvasElement.prototype,
    "getBoundingClientRect",
  ).mockReturnValue({ width: 960, height: 560 } as DOMRect);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      callback(16);
      return 7;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("draws a deterministic operations field and marks the canvas ready", () => {
  const { container } = render(<OperationsCanvas reducedMotion />);
  const canvas = container.querySelector("canvas");

  expect(canvas).toHaveAttribute("data-canvas-ready", "true");
  expect(context.fillRect).toHaveBeenCalled();
  expect(context.arc).toHaveBeenCalled();
  expect(context.stroke).toHaveBeenCalled();
});

it("honors the system reduced-motion preference without starting an animation loop", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true })),
  );

  const { container } = render(<OperationsCanvas />);

  expect(container.querySelector("canvas")).toHaveAttribute(
    "data-canvas-ready",
    "true",
  );
  expect(requestAnimationFrame).not.toHaveBeenCalled();
});

it("redraws after a theme mutation and cleans up animation", async () => {
  const { unmount } = render(<OperationsCanvas />);
  const callsBeforeThemeChange = context.fillRect.mock.calls.length;

  await act(async () => {
    document.documentElement.dataset.theme = "dark";
  });

  expect(context.fillRect.mock.calls.length).toBeGreaterThan(
    callsBeforeThemeChange,
  );
  unmount();
  expect(cancelAnimationFrame).toHaveBeenCalled();
});
