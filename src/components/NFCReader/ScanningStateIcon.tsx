import React, { FunctionComponent, useRef, useEffect } from "react";
import { Animated } from "react-native";
import { size, borderRadius, color } from "../../common/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScannerState } from "../../hooks/useCepasScanner/useCepasScanner";
import { usePrevious } from "../../hooks/usePrevious";

const springProps = {
  tension: 1,
  friction: 10
};

export const ScanningStateIcon: FunctionComponent<{
  scannerState: ScannerState;
}> = ({ scannerState }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevScannerState = usePrevious(scannerState);

  useEffect(() => {
    if (prevScannerState === scannerState) {
      return;
    }

    if (scannerState === "PAUSED/CAN_ID_DETECTED") {
      fadeAnim.setValue(1);
      Animated.spring(fadeAnim, {
        delay: 500,
        toValue: 0,
        ...springProps
      }).start();
    } else if (
      scannerState === "STARTED" &&
      prevScannerState !== "PAUSED/CARD_DETECTED"
    ) {
      fadeAnim.setValue(0);
      Animated.spring(fadeAnim, {
        toValue: 1,
        ...springProps
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [fadeAnim, prevScannerState, scannerState]);

  return (
    <Animated.View
      style={{
        // overflow: "hidden",
        marginBottom: size(2),
        height: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, size(10)],
          extrapolate: "clamp"
        })
      }}
    >
      <Animated.View
        style={{
          height: size(10),
          width: size(10),
          alignItems: "center",
          justifyContent: "center",
          borderRadius: borderRadius(10),
          borderWidth: 1,
          borderColor: color("grey", 30),
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-size(2), 0]
              })
            }
          ]
        }}
      >
        <MaterialCommunityIcons
          name={
            scannerState === "PAUSED/CAN_ID_DETECTED"
              ? "check"
              : "credit-card-scan-outline"
          }
          size={size(5)}
          color={color("grey", 70)}
        />
      </Animated.View>
    </Animated.View>
  );
};
