import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Card } from "../../Layout/Card";
import { sharedStyles } from "./sharedStyles";
import { AppText } from "../../Layout/AppText";
import { maskId } from "../../../utils/maskId";

interface FailureCard {
  id?: string;
  reason: string;
  msLeft?: number;
}

export const FailureCard: FunctionComponent<FailureCard> = ({
  id,
  reason,
  msLeft
}) => {
  return (
    <Card style={[sharedStyles.card, sharedStyles.failureCard]}>
      <AppText style={sharedStyles.emoji}>⛔️</AppText>
      <AppText style={sharedStyles.headerText}>{reason}</AppText>
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
