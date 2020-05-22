import React, { FunctionComponent } from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../Layout/AppText";
import { color, letterSpacing, fontSize, size } from "../../common/styles";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "../Layout/Card";

const styles = StyleSheet.create({
  betaTag: {
    borderRadius: 999,
    backgroundColor: color("blue", 10),
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 3
  },
  betaTagText: {
    textTransform: "uppercase",
    letterSpacing: letterSpacing(2),
    color: color("blue", 60),
    fontSize: fontSize(-3),
    fontFamily: "brand-bold"
  }
});

export const NFCReaderCard: FunctionComponent<{
  navigateToNFCScreen: () => void;
}> = ({ navigateToNFCScreen }) => (
  <Card>
    <View style={styles.betaTag}>
      <AppText style={styles.betaTagText}>Beta</AppText>
    </View>
    <AppText style={{ marginTop: size(1) }}>
      Scan EZLink/NETS FlashPay/CEPAS cards
    </AppText>
    <View
      style={{
        marginTop: size(3)
      }}
    >
      <DarkButton
        fullWidth={true}
        text="Scan using NFC"
        icon={
          <MaterialCommunityIcons
            name="cellphone-nfc"
            size={size(2)}
            color={color("grey", 0)}
          />
        }
        onPress={navigateToNFCScreen}
      />
    </View>
  </Card>
);
