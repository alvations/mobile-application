import { useState, useCallback } from "react";
import { validateAndCleanNric } from "../../utils/validateNric";
import { registerCanId as registerCanIdService } from "../../services/cepasRegistration";

export type RegistrationState =
  | "DEFAULT"
  | "VALIDATING_ID"
  | "REGISTERING_CAN_ID"
  | "REGISTRATION_COMPLETE";

export type CepasRegistrationHook = {
  registrationState: RegistrationState;
  registerCanId: (params: {
    canId: string;
    id: string;
    bypassRestriction?: boolean;
  }) => void;
  registrationResult?: { id: string };
  error?: Error;
  resetState: () => void;
};

export const useCepasRegistration = (
  sessionToken: string
): CepasRegistrationHook => {
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    "DEFAULT"
  );
  const [registrationResult, setRegistrationResult] = useState<
    CepasRegistrationHook["registrationResult"]
  >();
  const [error, setError] = useState<Error>();

  const resetState = useCallback((): void => {
    setRegistrationState("DEFAULT");
    setRegistrationResult(undefined);
    setError(undefined);
  }, []);

  const registerCanId: CepasRegistrationHook["registerCanId"] = useCallback(
    ({ canId, id, bypassRestriction = false }) => {
      const register = async (): Promise<void> => {
        setRegistrationState("VALIDATING_ID");

        let cleanedId;
        try {
          if (!bypassRestriction) {
            cleanedId = await validateAndCleanNric(id);
          } else {
            cleanedId = id.toUpperCase();
          }
          if (cleanedId.length === 0) {
            throw new Error("ID should not be blank.");
          }
          if (canId.length === 0) {
            throw new Error("CAN ID should not be blank.");
          }
        } catch (e) {
          setError(e);
          return;
        }

        setRegistrationState("REGISTERING_CAN_ID");
        try {
          await registerCanIdService({
            canId,
            id: cleanedId,
            sessionToken,
            bypassRestriction
          });
          setRegistrationResult({
            id: cleanedId
          });
          setRegistrationState("REGISTRATION_COMPLETE");
        } catch (e) {
          // TODO: don't discard error type
          setError(new Error(`Registration error. Please try again later`));
          return;
        }
      };
      register();
    },
    [sessionToken]
  );

  return {
    registrationState,
    registerCanId,
    registrationResult,
    error,
    resetState
  };
};
