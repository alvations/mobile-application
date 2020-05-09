import { useState, useEffect, useCallback, useRef } from "react";

export const useCountdown = (
  stepMs = 1000
): {
  msLeft: number | undefined;
  startCountdown: (ms: number) => void;
  resetCountdown: () => void;
} => {
  const [msLeft, setMsLeft] = useState<number | undefined>(undefined);
  const timeout = useRef(0);

  useEffect(() => {
    if (msLeft === undefined || msLeft <= 0) {
      return;
    }
    timeout.current = setTimeout(() => {
      setMsLeft(msLeft - stepMs);
    }, stepMs);
    return () => {
      clearTimeout(timeout.current);
    };
  }, [msLeft, stepMs]);

  const startCountdown = useCallback((ms: number) => {
    setMsLeft(Math.max(0, ms));
  }, []);

  const resetCountdown = useCallback(() => {
    clearTimeout(timeout.current);
    setMsLeft(undefined);
  }, []);

  return {
    msLeft,
    startCountdown,
    resetCountdown
  };
};
