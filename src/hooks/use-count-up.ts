import { useEffect, useState } from "react";

/** Counts from 0 up to `target` once it is known. Jumps straight to it for people who asked their system for less motion. */
export const useCountUp = (target: number | null, duration = 900): number => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null || !Number.isFinite(target)) return;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || target === 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return target === null ? 0 : value;
};
