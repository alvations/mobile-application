import React, { FunctionComponent } from "react";
import { TouchableOpacity } from "react-native";
import { size, fontSize, color } from "../../common/styles";
import { AppText } from "../Layout/AppText";
import { Feather } from "@expo/vector-icons";

export const BackButton: FunctionComponent<{ onPress: () => void }> = ({
  onPress
}) => (
  <TouchableOpacity
    style={{
      flexDirection: "row",
      paddingVertical: size(2),
      alignSelf: "flex-start"
    }}
    onPress={onPress}
  >
    <AppText
      style={{
        textAlign: "center",
        fontFamily: "brand-bold",
        fontSize: fontSize(1)
      }}
    >
      <Feather name="arrow-left" size={size(2)} color={color("blue", 40)} />
      {" Exit NFC Scanning"}
    </AppText>
  </TouchableOpacity>
);
