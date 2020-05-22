import React, { FunctionComponent } from "react";
import { AppText } from "../Layout/AppText";
import { size, color, fontSize } from "../../common/styles";
import { Feather } from "@expo/vector-icons";

export const ErrorFeedback: FunctionComponent<{ message: string }> = ({
  message
}) => (
  <AppText
    style={{
      marginTop: size(2),
      maxWidth: 224,
      flexShrink: 1,
      color: color("red", 60),
      textAlign: "center"
    }}
  >
    <Feather
      name="alert-triangle"
      size={fontSize(1)}
      color={color("red", 60)}
    />
    {` ${message}`}
  </AppText>
);
