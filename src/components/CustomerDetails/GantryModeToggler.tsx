import React, { FunctionComponent } from "react";
import { AppText } from "../Layout/AppText";
import { SecondaryButton } from "../Layout/Buttons/SecondaryButton";
import { StyleSheet, View } from "react-native";
import { fontSize, size, color } from "../../common/styles";
import { useConfigContext, GantryMode } from "../../context/config";
import { Feather } from "@expo/vector-icons";

const styles = StyleSheet.create({
  headerText: {
    fontSize: fontSize(-2),
    lineHeight: fontSize(-2),
    marginBottom: 2
  },
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
      config.gantryMode === GantryMode.checkIn
        ? GantryMode.checkOut
        : GantryMode.checkIn
    );
  };

  return (
    <>
      <View>
        <AppText style={styles.headerText}>Current mode:</AppText>
        <AppText style={styles.gantryModeText}>{config.gantryMode}</AppText>
      </View>
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
