import { useState, useEffect, useCallback } from "react";

export const useCountdown = (
  stepMs = 1000
): {
  msLeft: number | undefined;
  startCountdown: (ms: number) => void;
  resetCountdown: () => void;
} => {
  const [msLeft, setMsLeft] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (msLeft === undefined || msLeft <= 0) {
      return;
    }
    const timeout = setTimeout(() => {
      setMsLeft(msLeft - stepMs);
    }, stepMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [msLeft, stepMs]);

  const startCountdown = useCallback((ms: number) => {
    setMsLeft(Math.max(0, ms));
  }, []);

  const resetCountdown = useCallback(() => {
    setMsLeft(undefined);
  }, []);

  return {
    msLeft,
    startCountdown,
    resetCountdown
  };
};
