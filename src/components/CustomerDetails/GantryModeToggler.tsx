import React, { FunctionComponent } from "react";
import { AppText } from "../Layout/AppText";
import { SecondaryButton } from "../Layout/Buttons/SecondaryButton";
import { StyleSheet } from "react-native";
import { fontSize, size, color } from "../../common/styles";
import { useConfigContext } from "../../context/config";
import { Feather } from "@expo/vector-icons";

const styles = StyleSheet.create({
  gantryModeText: {
    fontSize: fontSize(2),
    fontFamily: "brand-bold"
  }
});

export const GantryModeToggler: FunctionComponent = () => {
  const { config, setConfigValue } = useConfigContext();

  const toggleMode = (): void => {
    setConfigValue(
      "gantryMode",
      config.gantryMode === "CHECK_IN" ? "CHECK_OUT" : "CHECK_IN"
    );
  };

  let gantryModeText;

  switch (config.gantryMode) {
    case "CHECK_OUT":
      gantryModeText = "Check out";
      break;
    default:
    case "CHECK_IN":
      gantryModeText = "Check in";
      break;
  }

  return (
    <>
      <AppText style={styles.gantryModeText}>{gantryModeText}</AppText>
      <SecondaryButton
        text="Switch mode"
        onPress={toggleMode}
        icon={
          <Feather name="shuffle" size={size(2)} color={color("blue", 50)} />
        }
      />
    </>
  );
};
