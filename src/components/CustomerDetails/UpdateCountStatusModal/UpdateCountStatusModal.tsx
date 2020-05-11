import React, {
  FunctionComponent,
  useLayoutEffect,
  useEffect,
  useCallback
} from "react";
import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useCountdown } from "../../../hooks/useCountdown";
import { usePrevious } from "../../../hooks/usePrevious";
import { ClickerCountHook } from "../../../hooks/useClickerCount/useClickerCount";
import { LoadingCard } from "./LoadingCard";
import { SuccessCard } from "./SuccessCard";
import { FailureCard } from "./FailureCard";
import { RejectedCard } from "./RejectedCard";

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
  }
});

interface UpdateCountStatusModal {
  updateCountResult?: ClickerCountHook["updateCountResult"];
  updateCountState: ClickerCountHook["updateCountState"];
  onExit: () => void;
  forceUpdateCount: (id: string) => void;
}

export const UpdateCountStatusModal: FunctionComponent<UpdateCountStatusModal> = ({
  updateCountResult,
  updateCountState,
  onExit,
  forceUpdateCount
}) => {
  const isVisible =
    updateCountState === "VALIDATING_ID" ||
    updateCountState === "UPDATING_COUNT" ||
    updateCountState === "RESULT_RETURNED";

  const { msLeft, startCountdown, resetCountdown } = useCountdown(100);
  const prevUpdateCountState = usePrevious(updateCountState);

  const closeModal = useCallback(() => {
    onExit();
    resetCountdown();
  }, [onExit, resetCountdown]);

  useEffect(() => {
    if (msLeft != undefined && msLeft <= 0) {
      closeModal();
    }
  }, [closeModal, msLeft]);

  let countdownDuration: number | undefined;
  useLayoutEffect(() => {
    if (
      countdownDuration &&
      updateCountState === "RESULT_RETURNED" &&
      prevUpdateCountState !== updateCountState
    ) {
      startCountdown(countdownDuration);
    }
  }, [
    countdownDuration,
    prevUpdateCountState,
    resetCountdown,
    startCountdown,
    updateCountState
  ]);

  let card;
  switch (updateCountResult?.status) {
    case "success":
      countdownDuration = 1400;
      card = (
        <SuccessCard
          id={updateCountResult.id}
          gantryMode={updateCountResult.gantryMode}
          msLeft={msLeft}
        />
      );
      break;
    case "rejected":
      card = (
        <RejectedCard
          id={updateCountResult.id}
          reason={updateCountResult.message}
          gantryMode={updateCountResult.gantryMode}
          closeModal={closeModal}
          forceUpdateCount={forceUpdateCount}
        />
      );
      break;
    case "fail":
      countdownDuration = 3000;
      card = (
        <FailureCard
          id={updateCountResult.id}
          reason={updateCountResult.message}
          msLeft={msLeft}
        />
      );
      break;
    case undefined:
      card = <LoadingCard />;
      break;
  }

  return (
    <Modal
      visible={isVisible}
      onRequestClose={closeModal}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.content}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (countdownDuration !== undefined) {
              closeModal();
            }
          }}
          style={styles.backgroundButton}
        />
        {card}
      </View>
    </Modal>
  );
};
