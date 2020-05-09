import { GantryMode } from "../../context/config";
import { UpdateCountResult } from "../../types";
import { useState, useCallback } from "react";
import { validateAndCleanNric } from "../../utils/validateNric";
import {
  updateCount as updateCountService,
  retrieveCountInfo as retrieveCountInfoService
} from "../../services/counts";

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
  getInitialCountInfo: () => void;
  updateCount: (
    id: string,
    gantryMode: GantryMode,
    bypassRestriction?: boolean
  ) => void;
  updateCountResult?: UpdateCountResultExpanded;
  error?: Error;
  countState: number;
  nameState: string;
  resetState: () => void;
};

export const useClicker = (
  sessionToken: string,
  clickerUuid: string,
  username: string
): ClickerHook => {
  const [clickerState, setClickerState] = useState<ClickerState>("DEFAULT");
  const [updateCountResult, setUpdateCountResult] = useState<
    ClickerHook["updateCountResult"]
  >();
  const [error, setError] = useState<Error>();
  const [countState, setCountState] = useState(0);
  const [nameState, setNameState] = useState("");
  const resetState = useCallback((): void => {
    setClickerState("DEFAULT");
    setUpdateCountResult(undefined);
    setError(undefined);
  }, []);

  const getInitialCountInfo: ClickerHook["getInitialCountInfo"] = useCallback(() => {
    const update = async (): Promise<void> => {
      try {
        setClickerState("UPDATING_COUNT");
        const result = await retrieveCountInfoService(
          clickerUuid,
          sessionToken
        );
        setCountState(result.count);
        setNameState(result.name);
        setClickerState("RESULT_RETURNED");
      } catch (e) {
        setError(new Error(`Error retrieving count information`));
        return;
      }
    };
    update();
  }, [clickerUuid, sessionToken]);
  const updateCount: ClickerHook["updateCount"] = useCallback(
    (id, gantryMode, bypassRestriction = false) => {
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
          if (result.count) {
            setCountState(result.count);
          }
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
    [clickerUuid, sessionToken, username]
  );

  return {
    clickerState,
    getInitialCountInfo,
    updateCount,
    updateCountResult,
    error,
    countState,
    nameState,
    resetState
  };
};
