import React, { FunctionComponent } from "react";
import { AppText } from "../Layout/AppText";
import { SecondaryButton } from "../Layout/Buttons/SecondaryButton";
import { StyleSheet, View } from "react-native";
import { fontSize, size, color } from "../../common/styles";
import { useConfigContext, GantryMode } from "../../context/config";
import { Feather } from "@expo/vector-icons";

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  label: {
    fontSize: fontSize(-2),
    lineHeight: fontSize(-2),
    marginBottom: 2
  },
  gantryModeText: {
    fontSize: fontSize(1),
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
    <View style={styles.wrapper}>
      <View>
        <AppText style={styles.label}>Current mode</AppText>
        <AppText style={styles.gantryModeText}>{config.gantryMode}</AppText>
      </View>
      <SecondaryButton
        text="Switch mode"
        onPress={toggleMode}
        icon={
          <Feather name="shuffle" size={size(1.5)} color={color("red", 50)} />
        }
      />
    </View>
  );
};
