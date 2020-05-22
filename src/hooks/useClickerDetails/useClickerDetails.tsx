import { useState, useCallback } from "react";
import { getClickerDetails as getClickerDetailsService } from "../../services/counts";
import * as Sentry from "sentry-expo";

export type ClickerDetailsHook = {
  getClickerDetails: () => void;
  isLoading: boolean;
  setCount: (newCount: number) => void;
  count: number;
  error?: Error;
  name: string;
};

export const useClickerDetails = (sessionToken: string): ClickerDetailsHook => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const getClickerDetails: ClickerDetailsHook["getClickerDetails"] = useCallback(() => {
    const get = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await getClickerDetailsService(sessionToken);
        setCount(result.count);
        setName(result.name);
      } catch (e) {
        setError(
          new Error(`Couldn't get clicker info, please try again later`)
        );
        return;
      } finally {
        setIsLoading(false);
      }
    };
    get();
  }, [sessionToken]);

  return {
    getClickerDetails,
    isLoading,
    setCount,
    count,
    error,
    name
  };
};
