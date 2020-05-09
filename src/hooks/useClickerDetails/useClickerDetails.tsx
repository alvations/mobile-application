import { useState, useCallback } from "react";
import { getClickerDetails as getClickerDetailsService } from "../../services/counts";

export type ClickerDetailsHook = {
  getClickerDetails: () => void;
  isLoading: boolean;
  count: number;
  name: string;
};

export const useClickerDetails = (
  sessionToken: string,
  clickerUuid: string
): ClickerDetailsHook => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getClickerDetails: ClickerDetailsHook["getClickerDetails"] = useCallback(() => {
    const get = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await getClickerDetailsService(
          clickerUuid,
          sessionToken
        );
        setCount(result.count);
        setName(result.name);
      } catch (e) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    };
    get();
  }, [clickerUuid, sessionToken]);

  return {
    getClickerDetails,
    isLoading,
    count,
    name
  };
};
