import React, { FunctionComponent } from "react";
import { Card } from "../../Layout/Card";
import { sharedStyles } from "./sharedStyles";
import { AppText } from "../../Layout/AppText";
import { ActivityIndicator, View } from "react-native";

export const LoadingCard: FunctionComponent = () => {
  return (
    <Card style={[sharedStyles.card, sharedStyles.loadingCard]}>
      <View style={{ alignSelf: "flex-start" }}>
        <ActivityIndicator style={sharedStyles.emoji} />
      </View>
      <AppText style={sharedStyles.headerText}>Checking...</AppText>
    </Card>
  );
};
