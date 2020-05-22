import React, { FunctionComponent } from "react";
import { AppText } from "../Layout/AppText";
import { CepasRegistrationHook } from "../../hooks/useCepasRegistration/useCepasRegistration";
import { fontSize, size } from "../../common/styles";
import { StyleSheet } from "react-native";
import { maskId } from "../../utils/maskId";

const styles = StyleSheet.create({
  registeringText: {
    fontFamily: "brand-bold",
    fontSize: fontSize(2),
    marginBottom: size(2)
  },
  registeredText: {
    fontSize: fontSize(2),
    marginBottom: size(2)
  }
});

export const RegisteringContent: FunctionComponent<{
  registrationState: CepasRegistrationHook["registrationState"];
  registrationResult: CepasRegistrationHook["registrationResult"];
}> = ({ registrationState, registrationResult }) => {
  return (
    <>
      {registrationState === "REGISTERING_CAN_ID" ? (
        <AppText style={styles.registeringText}>Registering</AppText>
      ) : (
        registrationState === "REGISTRATION_COMPLETE" && (
          <AppText style={styles.registeredText}>
            ✅ Registered to {maskId(registrationResult?.id ?? "")}
          </AppText>
        )
      )}
    </>
  );
};
