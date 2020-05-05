import { GantryMode } from "../../context/config";
import { UpdateCountResult } from "../../types";
import { useState, useCallback } from "react";
import { validateAndCleanNric } from "../../utils/validateNric";
import { updateCount as updateCountService } from "../../services/counts";

type ClickerState =
  | "DEFAULT"
  | "VALIDATING_ID"
  | "UPDATING_COUNT"
  | "RESULT_RETURNED";

export interface UpdateCountResultExpanded extends UpdateCountResult {
  id: string;
  gantryMode: GantryMode;
}

export type ClickerHook = {
  clickerState: ClickerState;
  updateCount: (id: string, gantryMode: GantryMode) => void;
  updateCountResult?: UpdateCountResultExpanded;
  error?: Error;
  resetState: () => void;
};

export const useClicker = (
  sessionToken: string,
  branchCode: string,
  username: string
): ClickerHook => {
  const [clickerState, setClickerState] = useState<ClickerState>("DEFAULT");
  const [updateCountResult, setUpdateCountResult] = useState<
    ClickerHook["updateCountResult"]
  >();
  const [error, setError] = useState<Error>();

  const resetState = useCallback((): void => {
    setClickerState("DEFAULT");
    setUpdateCountResult(undefined);
    setError(undefined);
  }, []);

  const updateCount: ClickerHook["updateCount"] = useCallback(
    (id, gantryMode) => {
      const update = async (): Promise<void> => {
        setClickerState("VALIDATING_ID");
        let cleanedId;
        try {
          cleanedId = validateAndCleanNric(id);
        } catch (e) {
          setError(e);
          return;
        }

        if (!cleanedId) {
          return;
        }

        setClickerState("UPDATING_COUNT");
        try {
          const result = await updateCountService({
            id: cleanedId,
            branchCode,
            username,
            sessionToken,
            gantryMode
          });
          setUpdateCountResult({
            ...result,
            id: cleanedId,
            gantryMode
          });
          setClickerState("RESULT_RETURNED");
        } catch (e) {
          setError(
            new Error(
              `Couldn't ${gantryMode.toLowerCase()}, please try again later`
            )
          );
          return;
        }
      };

      update();
    },
    [branchCode, sessionToken, username]
  );

  return {
    clickerState,
    updateCount,
    updateCountResult,
    error,
    resetState
  };
};
