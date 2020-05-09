import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Card } from "../../Layout/Card";
import { sharedStyles } from "./sharedStyles";
import { AppText } from "../../Layout/AppText";
import { DarkButton } from "../../Layout/Buttons/DarkButton";
import { GantryMode } from "../../../context/config";
import { size } from "../../../common/styles";
import { SecondaryButton } from "../../Layout/Buttons/SecondaryButton";
import { maskId } from "../../../utils/maskId";

interface RejectedCard {
  id?: string;
  reason: string;
  gantryMode: GantryMode;
  closeModal: () => void;
  forceUpdateCount: (id: string) => void;
}

export const RejectedCard: FunctionComponent<RejectedCard> = ({
  id,
  reason,
  gantryMode,
  closeModal,
  forceUpdateCount
}) => {
  return (
    <Card style={[sharedStyles.card, sharedStyles.rejectedCard]}>
      <AppText style={sharedStyles.emoji}>😐</AppText>
      <AppText style={sharedStyles.headerText}>{reason}</AppText>
      {(id ?? "").length > 0 && (
        <AppText style={sharedStyles.headerText}>{maskId(id!)}</AppText>
      )}
      <View style={sharedStyles.additionalInfoSection}>
        <DarkButton
          text={`${gantryMode} anyway`}
          fullWidth={true}
          onPress={() => {
            closeModal();
            if (id) {
              forceUpdateCount(id);
            }
          }}
        />
        <View style={{ marginTop: size(1.5) }}>
          <SecondaryButton
            text="Next customer"
            onPress={closeModal}
            fullWidth={true}
          />
        </View>
      </View>
    </Card>
  );
};
