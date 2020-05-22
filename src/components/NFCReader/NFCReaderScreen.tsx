import React, {
  FunctionComponent,
  useEffect,
  useState,
  useCallback
} from "react";
import { size, borderRadius, color, fontSize } from "../../common/styles";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  BackHandler,
  Keyboard
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { NavigationProps } from "../../types";
import {
  useCepasScanner,
  InvalidCardError,
  DuplicateCardError,
  CardMovedError
} from "../../hooks/useCepasScanner/useCepasScanner";
import { BackButton } from "./BackButton";
import { ScanningStateIcon } from "./ScanningStateIcon";
import { GantryModeCard } from "./GantryModeCard";
import { InstructionsText } from "./InstructionsText";
import { ErrorFeedback } from "./ErrorFeedback";
import { useClickerCount } from "../../hooks/useClickerCount/useClickerCount";
import { useAuthenticationContext } from "../../context/auth";
import { useConfigContext } from "../../context/config";
import { CanIdError, OddEvenError } from "../../services/counts";
import { Scanner } from "../CustomerDetails/Scanner";
import { BarCodeScannedCallback } from "expo-barcode-scanner";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCepasRegistration } from "../../hooks/useCepasRegistration/useCepasRegistration";
import { InvalidIdError } from "../../utils/validateNric";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { formatCanId } from "./utils";
import { maskId } from "../../utils/maskId";
import { NotRegisteredContent } from "./NotRegisteredContent";
import { RegisteringContent } from "./RegisteringContent";
import { UpdatingCountContent } from "./UpdatingCountContent";
import { SecondaryButton } from "../Layout/Buttons/SecondaryButton";

const showAlert = (message: string, onDismiss: () => void): void =>
  Alert.alert("Error", message, [{ text: "Dimiss", onPress: onDismiss }], {
    onDismiss // for android outside alert clicks
  });

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: 0
  },
  content: {
    flex: 1
  },
  topBar: {
    paddingHorizontal: size(2),
    paddingVertical: size(1)
  },
  feedbackWrapper: {
    paddingTop: size(2),
    paddingBottom: size(10),
    alignItems: "center",
    flex: 1
  },
  cardWrapper: {
    marginHorizontal: size(2),
    alignSelf: "stretch"
  },
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
  childrenWrapper: {
    overflow: "hidden",
    paddingHorizontal: size(2),
    paddingVertical: size(2),
    paddingBottom: size(3),
    borderBottomLeftRadius: borderRadius(4),
    borderBottomRightRadius: borderRadius(4)
  }
});

export const NFCReaderScreen: FunctionComponent<NavigationProps> = ({
  navigation
}) => {
  const { sessionToken, username, clickerUuid } = useAuthenticationContext();
  const { config } = useConfigContext();

  const {
    detectedCanId,
    resume,
    scannerState,
    error: nfcError
  } = useCepasScanner();

  const {
    updateCountState,
    updateCount,
    updateCountResult,
    error: countError,
    resetState: resetCountState
  } = useClickerCount(sessionToken, clickerUuid, username);

  const {
    registrationState,
    registerCanId,
    registrationResult,
    error: registrationError,
    resetState: resetRegistrationState
  } = useCepasRegistration(sessionToken);

  const [errorMessage, setErrorMessage] = useState("");
  const [shouldShowCamera, setShouldShowCamera] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  const resetAllState = useCallback(() => {
    resetCountState();
    resetRegistrationState();
    setShowRegistration(false);
    setShouldShowCamera(false);
    setErrorMessage("");
    resume();
  }, [resetCountState, resetRegistrationState, resume]);

  // TODO: Extract this to a hook
  // Close camera when back action is triggered
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (shouldShowCamera) {
          setShouldShowCamera(false);
          return true;
        }
        return false;
      }
    );
    return () => {
      backHandler.remove();
    };
  }, [shouldShowCamera]);

  // Dismiss keyboard whenever camera is shown
  useEffect(() => {
    if (shouldShowCamera) {
      Keyboard.dismiss();
    }
  }, [shouldShowCamera]);

  // Handle NFC errors
  useEffect(() => {
    if (!nfcError) {
      return;
    }

    if (
      nfcError instanceof CardMovedError ||
      nfcError instanceof InvalidCardError ||
      nfcError instanceof DuplicateCardError
    ) {
      setErrorMessage(nfcError.message);
      resume();
    } else {
      // Should not reach here
      console.warn(nfcError);
    }
  }, [nfcError, resume]);

  // Handle update count errors
  useEffect(() => {
    if (!countError || countError instanceof OddEvenError) {
      // OddEvenErrors are not handled by showing an alert.
      return;
    }
    if (countError instanceof CanIdError) {
      // Indicates that the registration flow should take place
      setShowRegistration(true);
      resetCountState(); // Handles the error by resetting the update count state
    } else {
      showAlert(countError?.message ?? "Error updating counts", () =>
        resetAllState()
      );
    }
  }, [countError, resetCountState, resetAllState]);

  // Handle CAN ID registration errors
  useEffect(() => {
    if (!registrationError || registrationError instanceof InvalidIdError) {
      // InvalidIdErrors are handled by NotRegisteredContent
      return;
    }
    showAlert(registrationError?.message ?? "Error registering card", () =>
      resetAllState()
    );
  }, [registrationError, resetAllState, resetRegistrationState]);

  // Called when there's a new detected card with a CAN ID
  useEffect(() => {
    if (detectedCanId.length > 0) {
      setErrorMessage("");
      updateCount({ canId: detectedCanId, gantryMode: config.gantryMode });
    }
  }, [config.gantryMode, detectedCanId, updateCount]);

  // Transition to registering view when a valid ID was provided for registration
  useEffect(() => {
    if (registrationState === "REGISTERING_CAN_ID") {
      setShouldShowCamera(false);
      setShowRegistration(false);
    }
  }, [registrationState]);

  // Attempt to update count once registration if CAN ID -> ID succeeds
  useEffect(() => {
    if (registrationState === "REGISTRATION_COMPLETE") {
      updateCount({ canId: detectedCanId, gantryMode: config.gantryMode });
    }
  }, [config.gantryMode, detectedCanId, registrationState, updateCount]);

  // Scanning is enabled when registration is not in progress and
  // when there are no registration errors (e.g. invalid id error)
  const isScanningEnabled =
    registrationState === "DEFAULT" && !registrationError;

  const onBarCodeScanned: BarCodeScannedCallback = event => {
    if (isScanningEnabled && event.data) {
      registerCanId({
        canId: detectedCanId,
        id: event.data
      });
    }
  };

  const forceUpdateCount = (canId: string): void => {
    updateCount({
      canId,
      gantryMode: config.gantryMode,
      bypassRestriction: true
    });
  };

  const openCamera = useCallback(() => setShouldShowCamera(true), []);
  const closeCamera = useCallback(() => setShouldShowCamera(false), []);

  console.log({
    states: {
      scannerState,
      registrationState,
      updateCountState
    },
    errors: {
      nfcError: nfcError || "none",
      countError: countError || "none",
      registrationError: registrationError || "none"
    }
  });

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.content}>
        <View style={styles.topBar}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <ScrollView
          scrollIndicatorInsets={{ right: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.feedbackWrapper}>
            <ScanningStateIcon scannerState={scannerState} />
            {scannerState !== "PAUSED/CAN_ID_DETECTED" && <InstructionsText />}
            {errorMessage.length > 0 && (
              <ErrorFeedback message={errorMessage} />
            )}
            <View style={styles.cardWrapper}>
              {scannerState === "PAUSED/CAN_ID_DETECTED" && (
                <>
                  <Card
                    style={{
                      paddingTop: 0,
                      paddingBottom: 0,
                      paddingHorizontal: 0,
                      marginHorizontal: size(2)
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
                        <AppText style={styles.idText}>
                          {formatCanId(maskId(detectedCanId))}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.childrenWrapper}>
                      {showRegistration && (
                        <NotRegisteredContent
                          detectedCanId={detectedCanId}
                          openCamera={openCamera}
                          registerCanId={registerCanId}
                          registrationError={registrationError}
                          resetRegistrationState={resetRegistrationState}
                          showAlert={showAlert}
                        />
                      )}
                      {!showRegistration &&
                        (registrationState === "REGISTERING_CAN_ID" ||
                          registrationState === "REGISTRATION_COMPLETE") && (
                          <RegisteringContent
                            registrationState={registrationState}
                            registrationResult={registrationResult}
                          />
                        )}
                      {!showRegistration && updateCountState !== "DEFAULT" && (
                        <UpdatingCountContent
                          updateCountState={updateCountState}
                          gantryMode={config.gantryMode}
                          rejectMessage={
                            countError instanceof OddEvenError
                              ? countError?.message
                              : undefined
                          }
                          forceUpdateCount={() =>
                            forceUpdateCount(detectedCanId)
                          }
                        />
                      )}
                    </View>
                  </Card>
                  {showRegistration ? (
                    <View style={{ marginTop: size(5), alignSelf: "center" }}>
                      <SecondaryButton
                        text="Cancel registration"
                        onPress={resetAllState}
                      />
                    </View>
                  ) : (
                    (updateCountState === "RESULT_RETURNED" || countError) && (
                      <View style={{ marginTop: size(5), alignSelf: "center" }}>
                        <SecondaryButton
                          text="Next customer"
                          onPress={resetAllState}
                        />
                      </View>
                    )
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
        <GantryModeCard
          visible={
            scannerState === "STARTED" ||
            scannerState === "PAUSED/CARD_DETECTED"
          }
        />
      </SafeAreaView>
      {shouldShowCamera && (
        <Scanner
          isScanningEnabled={isScanningEnabled}
          onBarCodeScanned={onBarCodeScanned}
          onCancel={closeCamera}
          cancelButtonText="Enter NRIC manually"
        />
      )}
    </View>
  );
};
