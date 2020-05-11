import { LinearGradient } from "expo-linear-gradient";
import React, { FunctionComponent } from "react";
import { color } from "../../common/styles";
import { ViewProps } from "react-native";

export const TopBackground: FunctionComponent<ViewProps> = ({ style }) => {
  const primaryColor = color("red", 40);
  const secondaryColor = color("red", 60);
  return (
    <LinearGradient
      style={[
        {
          backgroundColor: primaryColor,
          width: "100%",
          height: 200,
          position: "absolute"
        },
        style
      ]}
      colors={[primaryColor, secondaryColor]}
      start={[1, -0.5]}
      end={[0, 1]}
    />
  );
};
