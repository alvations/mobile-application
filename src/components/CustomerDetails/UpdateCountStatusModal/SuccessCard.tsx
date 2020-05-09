import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Card } from "../../Layout/Card";
import { sharedStyles } from "./sharedStyles";
import { GantryMode } from "../../../context/config";
import { AppText } from "../../Layout/AppText";
import { maskId } from "../../../utils/maskId";

interface SuccessCard {
  id?: string;
  gantryMode: GantryMode;
  msLeft?: number;
}

export const SuccessCard: FunctionComponent<SuccessCard> = ({
  id,
  gantryMode,
  msLeft
}) => {
  let headerText: string;

  switch (gantryMode) {
    case GantryMode.checkIn:
      headerText = "Welcome";
      break;
    case GantryMode.checkOut:
      headerText = "Goodbye";
      break;
  }

  return (
    <Card style={[sharedStyles.card, sharedStyles.successCard]}>
      <AppText style={sharedStyles.emoji}>✅</AppText>
      <AppText style={sharedStyles.headerText}>{headerText}</AppText>
      {(id ?? "").length > 0 && (
        <AppText style={sharedStyles.headerText}>{maskId(id!)}</AppText>
      )}
      <View style={sharedStyles.additionalInfoSection}>
        {msLeft !== undefined && (
          <AppText style={sharedStyles.additionalInfoText}>
            {`Automatically closes in ${(msLeft ?? 0) / 1000}s`}
          </AppText>
        )}
        <AppText style={sharedStyles.additionalInfoText}>
          Tap anywhere outside to close popup
        </AppText>
      </View>
    </Card>
  );
};
