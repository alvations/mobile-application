import React, { FunctionComponent, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { InputWithLabel } from "../Layout/InputWithLabel";
import { AppText } from "../Layout/AppText";
import { SecondaryButton } from "../Layout/Buttons/SecondaryButton";
import { size, color, fontSize } from "../../common/styles";
import { useConfigContext } from "../../context/config";
import { ToggleSwitch } from "../Layout/ToggleSwitch";
const styles = StyleSheet.create({
  scanButtonWrapper: {
    marginTop: size(3),
    marginBottom: size(5)
  },
  horizontalRule: {
    borderBottomColor: color("grey", 30),
    marginHorizontal: -size(3),
    borderBottomWidth: 1
  },
  orWrapper: {
    position: "absolute",
    top: -fontSize(0),
    alignSelf: "center",
    backgroundColor: color("grey", 0),
    padding: size(1)
  },
  orText: {
    fontSize: fontSize(-1),
    fontFamily: "brand-bold"
  },
  manualInputWrapper: {
    marginTop: size(3)
  },
  inputAndButtonWrapper: {
    marginTop: size(1),
    flexDirection: "row",
    alignItems: "flex-end"
  },
  inputWrapper: {
    flex: 1,
    marginRight: size(1)
  }
});

interface InputNricSection {
  openCamera: () => void;
  nricInput: string;
  setNricInput: (nric: string) => void;
  submitNric: (bypassRestriction?: boolean) => void;
}

export const InputNricSection: FunctionComponent<InputNricSection> = ({
  openCamera,
  nricInput,
  setNricInput,
  submitNric
}) => {
  const { config } = useConfigContext();
  const [bypassRestriction, setBypassRestriction] = useState(false);
  return (
    <>
      <View style={styles.scanButtonWrapper}>
        <DarkButton
          fullWidth={true}
          text="Scan customer's NRIC"
          icon={
            <Feather name="maximize" size={size(2)} color={color("grey", 0)} />
          }
          onPress={openCamera}
        />
      </View>
      <View style={{ position: "relative" }}>
        <View style={styles.horizontalRule} />
        <View style={styles.orWrapper}>
          <AppText style={styles.orText}>OR</AppText>
        </View>
      </View>
      <View style={styles.manualInputWrapper}>
        <ToggleSwitch
          state={!bypassRestriction}
          onPressCallback={state => setBypassRestriction(!state)}
          trueText={"NRIC/FIN"}
          falseText={"Passport/Foreign ID"}
        />
        <View style={styles.inputAndButtonWrapper}>
          <View style={styles.inputWrapper}>
            <InputWithLabel
              label={
                bypassRestriction
                  ? "Enter Passport/Foreign ID"
                  : "Enter NRIC number"
              }
              value={nricInput}
              onChange={({ nativeEvent: { text } }) => setNricInput(text)}
              onSubmitEditing={() => submitNric(bypassRestriction)}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
          </View>
          <SecondaryButton
            text={config.gantryMode}
            onPress={() => submitNric(bypassRestriction)}
          />
        </View>
      </View>
    </>
  );
};
