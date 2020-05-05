import React, { FunctionComponent } from "react";
import { color, fontSize } from "../../common/styles";
import { AppText } from "./AppText";
import AppLogo from "../../../assets/Logo.svg";

export const AppName: FunctionComponent = () => (
  <>
    {/* <AppLogo /> */}
    <AppText>
      <AppText
        style={{
          fontSize: fontSize(4),
          color: color("grey", 0),
          fontFamily: "brand-regular"
        }}
      >
        Safe
      </AppText>
      <AppText
        style={{
          fontSize: fontSize(4),
          color: color("grey", 0),
          fontFamily: "brand-bold"
        }}
      >
        Entry
      </AppText>
    </AppText>
  </>
);
