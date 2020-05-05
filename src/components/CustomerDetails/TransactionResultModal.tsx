import React, { FunctionComponent, useLayoutEffect, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { AppText } from "../Layout/AppText";
import { Card } from "../Layout/Card";
import { useCountdown } from "../../hooks/useCountdown";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { usePrevious } from "../../hooks/usePrevious";
import { size, color, fontSize } from "../../common/styles";
import { CreateTransactionResult } from "../../types";

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
  cardContent: {}
});

interface TransactionResultModal {
  id?: string;
  isVisible: boolean;
  onExit: () => void;
}

export const TransactionResultModal: FunctionComponent<TransactionResultModal &
  Partial<CreateTransactionResult>> = ({
  status,
  message,
  count,
  id,
  isVisible,
  onExit
}) => {
  const { msLeft, startCountdown, resetCountdown } = useCountdown(100);
  const prevIsVisible = usePrevious(isVisible);

  useLayoutEffect(() => {
    if (!prevIsVisible && isVisible) {
      startCountdown(1400);
    }
  }, [isVisible, prevIsVisible, startCountdown]);

  useEffect(() => {
    if (msLeft != undefined && msLeft <= 0) {
      onExit();
      resetCountdown();
    }
  }, [msLeft, onExit, resetCountdown]);

  const obscuredId = id ? id.slice(4).padStart(id.length, "*") : undefined;

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
        <Card
          style={{
            minWidth: 256,
            maxWidth: "80%",
            backgroundColor: color("green", 10),
            borderTopWidth: size(1),
            borderColor: color("green", 50)
          }}
        >
          <View style={styles.cardContent}>
            <View style={{}}>
              <AppText
                style={{
                  fontSize: fontSize(3),
                  marginBottom: size(2),
                  marginTop: size(1)
                }}
              >
                ✅
              </AppText>
              <AppText
                style={{ fontFamily: "brand-bold", fontSize: fontSize(3) }}
              >
                Welcome
              </AppText>
              <AppText
                style={{ fontFamily: "brand-bold", fontSize: fontSize(3) }}
              >
                {obscuredId}
              </AppText>
            </View>
            <View style={{ marginTop: size(2.5) }}>
              <DarkButton
                text="Next customer"
                onPress={onExit}
                fullWidth={true}
              />
            </View>
            <AppText
              style={{
                marginTop: size(1),
                marginBottom: -size(1),
                textAlign: "center",
                fontSize: fontSize(-3)
              }}
            >
              {`Automatically closes in ${(msLeft ?? 0) / 1000}s`}
            </AppText>
          </View>
        </Card>
      </View>
    </Modal>
  );
};
