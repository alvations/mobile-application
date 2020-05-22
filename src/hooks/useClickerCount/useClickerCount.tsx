import { GantryMode } from "../../context/config";
import { UpdateCountResult } from "../../types";
import { useState, useCallback } from "react";
import { validateAndCleanNric } from "../../utils/validateNric";
import {
  updateCount as updateCountService,
  UpdateCount
} from "../../services/counts";

export type UpdateCountState =
  | "DEFAULT"
  | "VALIDATING_ID"
  | "UPDATING_COUNT"
  | "RESULT_RETURNED";

export interface UpdateCountResultExpanded extends UpdateCountResult {
  id?: string;
  canId?: string;
  gantryMode: GantryMode;
}

type BaseUpdateCount = {
  gantryMode: GantryMode;
  bypassRestriction?: boolean;
  id?: string;
  canId?: string;
};
type UpdateCountWithId = {
  id: string;
  canId?: undefined;
};
type UpdateCountWithCanId = {
  id?: undefined;
  canId: string;
};
type UpdateCountCallbackParams = BaseUpdateCount &
  (UpdateCountWithCanId | UpdateCountWithId);

export type ClickerCountHook = {
  updateCountState: UpdateCountState;
  updateCount: (params: UpdateCountCallbackParams) => void;
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
    ({ id, canId, gantryMode, bypassRestriction = false }) => {
      const update = async (): Promise<void> => {
        setUpdateCountState("VALIDATING_ID");

        let cleanedId;
        if (id) {
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
        }

        setUpdateCountState("UPDATING_COUNT");
        try {
          const baseParams = {
            clickerUuid,
            username,
            sessionToken,
            gantryMode,
            bypassRestriction
          };
          let params: UpdateCount;
          if (cleanedId) {
            params = { ...baseParams, id: cleanedId };
          } else {
            params = { ...baseParams, canId: canId! };
          }

          const result = await updateCountService(params);
          setUpdateCountResult({
            ...result,
            id: cleanedId,
            canId,
            gantryMode
          });
          setUpdateCountState("RESULT_RETURNED");
        } catch (e) {
          setError(e);
          // TODO: don't discard error type
          // setError(
          //   new Error(
          //     `Couldn't ${gantryMode.toLowerCase()}, please try again later`
          //   )
          // );
          return;
        }
      };

      if (id || canId) {
        resetState();
        update();
      } else {
        setError(new Error("Please specify either an ID or a CAN ID"));
      }
    },
    [clickerUuid, resetState, sessionToken, username]
  );

  return {
    updateCountState,
    updateCount,
    updateCountResult,
    error,
    resetState
  };
};
