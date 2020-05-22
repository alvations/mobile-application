import React, { FunctionComponent } from "react";
import { AppText } from "../Layout/AppText";
import { StyleSheet, View } from "react-native";
import { fontSize, size } from "../../common/styles";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { UpdateCountState } from "../../hooks/useClickerCount/useClickerCount";
import { GantryMode } from "../../context/config";

const styles = StyleSheet.create({
  contentHeaderText: {
    fontFamily: "brand-bold",
    fontSize: fontSize(2)
  },
  additionalInfoSection: {
    marginTop: size(2)
  },
  additionalInfoText: {
    fontSize: fontSize(-3)
  }
});

export const UpdatingCountContent: FunctionComponent<{
  updateCountState: UpdateCountState;
  gantryMode: GantryMode;
  rejectMessage: string | undefined;
  forceUpdateCount: () => void;
}> = ({ updateCountState, gantryMode, rejectMessage, forceUpdateCount }) => {
  let headerText: string;
  switch (updateCountState) {
    case "DEFAULT":
    case "VALIDATING_ID":
    case "UPDATING_COUNT":
      headerText = "Checking...";
      break;
    case "RESULT_RETURNED": {
      switch (gantryMode) {
        case GantryMode.checkOut:
          headerText = "✅ Goodbye";
          break;
        case GantryMode.checkIn:
        default:
          headerText = "✅ Welcome!";
          break;
      }
      break;
    }
  }

  if (rejectMessage) {
    headerText = `😐 ${rejectMessage}`;
  }

  return (
    <>
      <AppText style={styles.contentHeaderText}>{headerText}</AppText>
      {rejectMessage && (
        <View style={styles.additionalInfoSection}>
          <DarkButton
            text={`${gantryMode} anyway`}
            fullWidth={true}
            onPress={forceUpdateCount}
          />
        </View>
      )}
    </>
  );
};
