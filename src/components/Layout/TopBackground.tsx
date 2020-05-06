import { LinearGradient } from "expo-linear-gradient";
import React, { FunctionComponent } from "react";
import { color } from "../../common/styles";
import { ViewProps } from "react-native";

export const TopBackground: FunctionComponent<ViewProps> = ({ style }) => {
  const primaryColor = color("red", 10);
  const secondaryColor = color("red", 10);
  return (
    <LinearGradient
      style={[
        {
          backgroundColor: primaryColor,
          width: "100%",
          height: "25%",
          maxHeight: 360,
          position: "absolute"
        },
        style
      ]}
      colors={[primaryColor, secondaryColor]}
      start={[0.5, 0]}
      end={[-0.5, 1.8]}
    />
  );
};
