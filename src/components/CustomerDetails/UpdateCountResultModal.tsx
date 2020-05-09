import React, { FunctionComponent, useLayoutEffect, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ViewStyle
} from "react-native";
import { AppText } from "../Layout/AppText";
import { Card } from "../Layout/Card";
import { useCountdown } from "../../hooks/useCountdown";
import { usePrevious } from "../../hooks/usePrevious";
import { size, color, fontSize } from "../../common/styles";
import { ClickerCountHook } from "../../hooks/useClickerCount/useClickerCount";
import { GantryMode } from "../../context/config";

const styles = StyleSheet.create({
  content: {
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  backgroundButton: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.8)"
  },
  card: {
    minWidth: 256,
    maxWidth: "80%",
    borderTopWidth: size(1)
  },
  successCard: {
    backgroundColor: color("green", 10),
    borderColor: color("green", 50)
  },
  failureCard: {
    backgroundColor: color("red", 10),
    borderColor: color("red", 50)
  },
  emoji: {
    fontSize: fontSize(3),
    marginBottom: size(1.5),
    marginTop: size(1)
  },
  headerText: {
    fontFamily: "brand-bold",
    fontSize: fontSize(3)
  },
  additionalInfoSection: {
    marginTop: size(2.5),
    marginBottom: -size(1)
  },
  additionalInfoText: {
    fontSize: fontSize(-3)
  }
});

interface UpdateCountResultModal {
  updateCountResult?: ClickerCountHook["updateCountResult"];
  isVisible: boolean;
  onExit: () => void;
}

export const UpdateCountResultModal: FunctionComponent<UpdateCountResultModal> = ({
  updateCountResult,
  isVisible,
  onExit
}) => {
  const { msLeft, startCountdown, resetCountdown } = useCountdown(100);
  const prevIsVisible = usePrevious(isVisible);
  let countdownDuration = 0;

  useEffect(() => {
    if (msLeft != undefined && msLeft <= 0) {
      onExit();
      resetCountdown();
    }
  }, [msLeft, onExit, resetCountdown]);

  useLayoutEffect(() => {
    if (!prevIsVisible && isVisible) {
      startCountdown(countdownDuration);
    }
  }, [countdownDuration, isVisible, prevIsVisible, startCountdown]);

  if (!updateCountResult) {
    // If modal is visible, the result prop should be defined.
    return null;
  }

  const id = updateCountResult.id;
  const obscuredId = id ? id.slice(4).padStart(id.length, "*") : undefined;

  let cardStyle: ViewStyle;
  let emoji: string;
  let headerText: string;

  switch (updateCountResult.status) {
    case "success":
      countdownDuration = 1400;
      cardStyle = styles.successCard;
      emoji = "✅";
      switch (updateCountResult.gantryMode) {
        case GantryMode.checkIn:
          headerText = "Welcome";
          break;
        case GantryMode.checkOut:
          headerText = "Goodbye";
          break;
      }
      break;
    case "fail":
      countdownDuration = 3000;
      cardStyle = styles.failureCard;
      emoji = "⛔️";
      headerText = updateCountResult.message;
      break;
  }

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onExit}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.content}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onExit}
          style={styles.backgroundButton}
        />
        <Card style={[styles.card, cardStyle]}>
          <AppText style={styles.emoji}>{emoji}</AppText>
          <AppText style={styles.headerText}>{headerText}</AppText>
          <AppText style={styles.headerText}>{obscuredId}</AppText>
          <View style={styles.additionalInfoSection}>
            <AppText style={styles.additionalInfoText}>
              {`Automatically closes in ${(msLeft ?? 0) / 1000}s`}
            </AppText>
            <AppText style={styles.additionalInfoText}>
              Tap anywhere outside to close popup
            </AppText>
          </View>
        </Card>
      </View>
    </Modal>
  );
};
