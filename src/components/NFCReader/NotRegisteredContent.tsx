import React, { FunctionComponent, useState, useEffect } from "react";
import { AppText } from "../Layout/AppText";
import { useConfigContext } from "../../context/config";
import { InputNricSection } from "../CustomerDetails/InputNricSection";
import { CepasRegistrationHook } from "../../hooks/useCepasRegistration/useCepasRegistration";
import { fontSize } from "../../common/styles";
import { InvalidIdError } from "../../utils/validateNric";

export const NotRegisteredContent: FunctionComponent<{
  detectedCanId: string;
  openCamera: () => void;
  registerCanId: CepasRegistrationHook["registerCanId"];
  registrationError: CepasRegistrationHook["error"];
  resetRegistrationState: CepasRegistrationHook["resetState"];
  showAlert: (message: string, onDismiss: () => void) => void;
}> = ({
  detectedCanId,
  openCamera,
  registerCanId,
  registrationError,
  resetRegistrationState,
  showAlert
}) => {
  const { config } = useConfigContext();
  const [idInput, setIdInput] = useState("");

  useEffect(() => {
    if (!registrationError) {
      return;
    }

    if (registrationError instanceof InvalidIdError) {
      setIdInput("");
      showAlert(registrationError?.message ?? "Error registering card", () =>
        resetRegistrationState()
      );
    }
  }, [registrationError, resetRegistrationState, showAlert]);

  const submitId: InputNricSection["submitNric"] = bypassRestriction => {
    if (!idInput) {
      showAlert("Please enter an ID", () => null);
    } else {
      registerCanId({
        canId: detectedCanId,
        id: idInput,
        bypassRestriction
      });
    }
  };

  return (
    <>
      <AppText style={{ fontSize: fontSize(-1) }}>
        Please enter the customer&apos;s NRIC/FIN/Passport number to link it
        with this card. This is a one-time step.
      </AppText>
      <InputNricSection
        openCamera={openCamera}
        nricInput={idInput}
        setNricInput={setIdInput}
        submitNric={submitId}
        manualInputCTAText={`Register and ${config.gantryMode}`}
      />
    </>
  );
};
