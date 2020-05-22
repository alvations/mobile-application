import React, { FunctionComponent } from "react";
import { size, fontSize, color, borderRadius } from "../../common/styles";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AppText } from "./AppText";

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    minHeight: size(4),
    marginTop: size(2),
    marginBottom: size(1),
    borderColor: color("red", 50),
    borderWidth: 1,
    borderRadius: borderRadius(2)
  },
  switchButton: {
    justifyContent: "center",
    flex: 1
  },
  switchOptionText: {
    textAlign: "center",
    color: color("grey", 0),
    fontFamily: "brand-bold",
    fontSize: fontSize(-1)
  }
});

interface ToggleSwitch {
  state: boolean;
  onPressCallback: (newState: boolean) => void;
  trueText: string;
  falseText: string;
}

export const ToggleSwitch: FunctionComponent<ToggleSwitch> = ({
  state,
  onPressCallback,
  trueText,
  falseText
}) => {
  return (
    <View style={styles.switchContainer}>
      <TouchableOpacity
        style={[
          styles.switchButton,
          { backgroundColor: state ? color("red", 50) : "transparent" }
        ]}
        onPress={() => onPressCallback(true)}
      >
        <AppText
          style={[
            styles.switchOptionText,
            { color: color("grey", state ? 0 : 40) }
          ]}
        >
          {trueText}
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.switchButton,
          { backgroundColor: state ? "transparent" : color("red", 50) }
        ]}
        onPress={() => onPressCallback(false)}
      >
        <AppText
          style={[
            styles.switchOptionText,
            { color: color("grey", state ? 40 : 0) }
          ]}
        >
          {falseText}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};
