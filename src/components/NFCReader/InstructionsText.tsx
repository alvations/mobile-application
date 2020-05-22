import React, { FunctionComponent } from "react";
import { AppText } from "../Layout/AppText";
import { fontSize } from "../../common/styles";

export const InstructionsText: FunctionComponent = () => (
  <AppText
    style={{
      fontFamily: "brand-bold",
      fontSize: fontSize(2),
      textAlign: "center"
    }}
  >
    Hold card to{"\n"} back of phone
  </AppText>
);
