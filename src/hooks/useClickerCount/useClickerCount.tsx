import { GantryMode } from "../../context/config";
import { UpdateCountResult } from "../../types";
import { useState, useCallback } from "react";
import { validateAndCleanNric } from "../../utils/validateNric";
import { updateCount as updateCountService } from "../../services/counts";
type UpdateCountState =
  | "DEFAULT"
  | "VALIDATING_ID"
  | "UPDATING_COUNT"
  | "RESULT_RETURNED";

export interface UpdateCountResultExpanded extends UpdateCountResult {
  id: string;
  gantryMode: GantryMode;
}

export type ClickerCountHook = {
  updateCountState: UpdateCountState;
  updateCount: (
    id: string,
    gantryMode: GantryMode,
    bypassRestriction?: boolean
  ) => void;
  updateCountResult?: UpdateCountResultExpanded;
  error?: Error;
  resetState: () => void;
};

export const useClickerCount = (
  sessionToken: string,
  clickerUuid: string,
  username: string
): ClickerCountHook => {
  const [updateCountState, setUpdateCountState] = useState<UpdateCountState>(
    "DEFAULT"
  );
  const [updateCountResult, setUpdateCountResult] = useState<
    ClickerCountHook["updateCountResult"]
  >();
  const [error, setError] = useState<Error>();
  const resetState = useCallback((): void => {
    setUpdateCountState("DEFAULT");
    setUpdateCountResult(undefined);
    setError(undefined);
  }, []);

  const updateCount: ClickerCountHook["updateCount"] = useCallback(
    (id, gantryMode, bypassRestriction = false) => {
      const update = async (): Promise<void> => {
        setUpdateCountState("VALIDATING_ID");
        let cleanedId;
        try {
          if (!bypassRestriction) {
            cleanedId = await validateAndCleanNric(id);
          } else {
            cleanedId = id.toUpperCase();
          }
        } catch (e) {
          setError(e);
          return;
        }

        if (!cleanedId) {
          return;
        }

        setUpdateCountState("UPDATING_COUNT");
        try {
          const result = await updateCountService({
            id: cleanedId,
            clickerUuid,
            username,
            sessionToken,
            gantryMode,
            bypassRestriction
          });
          setUpdateCountResult({
            ...result,
            id: cleanedId,
            gantryMode
          });
          setUpdateCountState("RESULT_RETURNED");
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
    [clickerUuid, sessionToken, username]
  );

  return {
    updateCountState,
    updateCount,
    updateCountResult,
    error,
    resetState
  };
};
