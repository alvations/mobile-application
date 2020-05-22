import React, { FunctionComponent, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "../Layout/Card";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { size, color, borderRadius, fontSize } from "../../common/styles";
import { AppText } from "../Layout/AppText";
import { formatCanId } from "./utils";
import { useConfigContext, GantryMode } from "../../context/config";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { useCountdown } from "../../hooks/useCountdown";

const styles = StyleSheet.create({
  header: {
    borderTopLeftRadius: borderRadius(3),
    borderTopRightRadius: borderRadius(3),
    paddingHorizontal: size(2),
    paddingVertical: size(2),
    backgroundColor: color("blue-green", 40),
    flexDirection: "row",
    alignItems: "flex-start"
  },
  headerText: {
    marginLeft: size(1.5)
  },
  label: {
    color: color("grey", 0),
    fontSize: fontSize(-2),
    marginBottom: 2
  },
  idText: {
    color: color("grey", 0),
    fontSize: fontSize(1),
    lineHeight: 1.2 * fontSize(1),
    fontFamily: "brand-bold"
  },
  contentWrapper: {
    overflow: "hidden",
    paddingHorizontal: size(2),
    paddingVertical: size(2),
    borderBottomLeftRadius: borderRadius(4),
    borderBottomRightRadius: borderRadius(4)
  },
  contentHeaderText: {
    fontFamily: "brand-bold",
    fontSize: fontSize(3)
  },
  additionalInfoSection: {
    marginTop: size(2)
  },
  additionalInfoText: {
    fontSize: fontSize(-3)
  }
});

export const AlreadyRegisteredCard: FunctionComponent<{
  detectedCanId: string;
  onCancel: () => void;
}> = ({ detectedCanId, onCancel }) => {
  const { config } = useConfigContext();

  const { msLeft, startCountdown, resetCountdown } = useCountdown(100);

  useLayoutEffect(() => {
    startCountdown(1800);
    return () => {
      resetCountdown();
    };
  }, [resetCountdown, startCountdown]);

  let headerText: string;

  useEffect(() => {
    if (msLeft != undefined && msLeft <= 0) {
      onCancel();
    }
  }, [onCancel, msLeft]);

  switch (config.gantryMode) {
    case GantryMode.checkIn:
      headerText = "Welcome";
      break;
    case GantryMode.checkOut:
      headerText = "Goodbye";
      break;
  }

  return (
    <Card
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        paddingHorizontal: 0
      }}
    >
      <View style={[styles.header]}>
        <MaterialCommunityIcons
          name="credit-card-outline"
          size={size(3)}
          color={color("grey", 0)}
        />

        <View style={styles.headerText}>
          <AppText style={styles.label}>CAN ID</AppText>
          <AppText style={styles.idText}>{formatCanId(detectedCanId)}</AppText>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <AppText style={styles.contentHeaderText}>{headerText}</AppText>
        <AppText style={{ fontFamily: "brand-bold", fontSize: fontSize(3) }}>
          *****001I
        </AppText>
        <View style={styles.additionalInfoSection}>
          {msLeft !== undefined && (
            <AppText style={styles.additionalInfoText}>
              {`Automatically closes in ${(msLeft ?? 0) / 1000}s`}
            </AppText>
          )}
          <View style={{ marginTop: size(2) }}>
            <DarkButton
              text="Next Customer"
              onPress={onCancel}
              fullWidth={true}
            />
          </View>
        </View>
      </View>
    </Card>
  );
};
