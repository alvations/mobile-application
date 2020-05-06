import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Vibration,
  Platform,
  BackHandler
} from "react-native";
import { size, color } from "../../common/styles";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { TopBackground } from "../Layout/TopBackground";
import { Credits } from "../Credits";
import {
  withNavigationFocus,
  NavigationFocusInjectedProps
} from "react-navigation";
import { BarCodeScannedCallback } from "expo-barcode-scanner";
import { InputNricSection } from "./InputNricSection";
import { AppHeader } from "../Layout/AppHeader";
import * as Sentry from "sentry-expo";
import { HelpButton } from "../Layout/Buttons/HelpButton";
import { HelpModalContext } from "../../context/help";
import { FeatureToggler } from "../FeatureToggler/FeatureToggler";
import { Banner } from "../Layout/Banner";
import { ImportantMessageContentContext } from "../../context/importantMessage";
import { useCheckUpdates } from "../../hooks/useCheckUpdates";
import { Scanner } from "./Scanner";
import { UpdateCountResultModal } from "./UpdateCountResultModal";
import { GantryModeToggler } from "./GantryModeToggler";
import { useAuthenticationContext } from "../../context/auth";
import { useConfigContext } from "../../context/config";
import { useClicker } from "../../hooks/useClicker/useClicker";
import { LocationDetails } from "./LocationDetails";

const styles = StyleSheet.create({
  content: {
    position: "relative",
    padding: size(2),
    paddingVertical: size(8),
    height: "100%",
    width: 512,
    maxWidth: "100%"
  },
  headerBar: {
    marginBottom: size(4)
  },
  bannerWrapper: {
    marginBottom: size(1.5)
  },
  metaCardWrapper: {
    marginBottom: size(1.5)
  },
  metaCardContent: {
    marginBottom: -size(1)
  },
  modeWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  horizontalRule: {
    borderBottomColor: color("grey", 30),
    marginVertical: size(3),
    marginHorizontal: -size(3),
    borderBottomWidth: 1
  }
});

const showAlert = (message: string, onDismiss: () => void): void =>
  Alert.alert("Error", message, [{ text: "Dimiss", onPress: onDismiss }], {
    onDismiss // for android outside alert clicks
  });

const CollectCustomerDetailsScreen: FunctionComponent<NavigationFocusInjectedProps> = ({
  isFocused
}) => {
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: "navigation",
      message: "CollectCustomerDetailsScreen"
    });
  }, []);

  const messageContent = useContext(ImportantMessageContentContext);
  const [shouldShowCamera, setShouldShowCamera] = useState(false);
  const [nricInput, setNricInput] = useState("");
  const showHelpModal = useContext(HelpModalContext);
  const checkUpdates = useCheckUpdates();
  const { sessionToken, branchCode, username } = useAuthenticationContext();
  const { config } = useConfigContext();

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

  useEffect(() => {
    if (isFocused) {
      checkUpdates();
    }
  }, [isFocused, checkUpdates]);

  const {
    clickerState,
    updateCount,
    updateCountResult,
    error,
    resetState
  } = useClicker(sessionToken, branchCode, username);

  const onCancel = useCallback((): void => {
    resetState();
  }, [resetState]);

  useEffect(() => {
    if (error) {
      showAlert(error.message, onCancel);
    }
  }, [error, onCancel]);

  useEffect(() => {
    if (Platform.OS === "android" && clickerState === "UPDATING_COUNT") {
      Vibration.vibrate(50);
    }
  }, [clickerState]);

  const isScanningEnabled = isFocused && clickerState === "DEFAULT" && !error;
  const onBarCodeScanned: BarCodeScannedCallback = event => {
    if (isScanningEnabled && event.data) {
      updateCount(event.data, config.gantryMode);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ alignItems: "center" }}
        scrollIndicatorInsets={{ right: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView behavior="padding">
          <TopBackground />
          <View style={styles.content}>
            <View style={styles.headerBar}>
              <AppHeader />
            </View>
            {messageContent && (
              <View style={styles.bannerWrapper}>
                <Banner {...messageContent} />
              </View>
            )}
            <View style={styles.metaCardWrapper}>
              <Card>
                <View style={styles.metaCardContent}>
                  <LocationDetails />
                  <View style={styles.horizontalRule} />
                  <View style={styles.modeWrapper}>
                    <GantryModeToggler />
                  </View>
                </View>
              </Card>
            </View>
            <Card>
              <AppText>
                Scan customer&apos;s NRIC/FIN or manually enter it
              </AppText>
              <InputNricSection
                openCamera={() => setShouldShowCamera(true)}
                nricInput={nricInput}
                setNricInput={setNricInput}
                submitNric={() => updateCount(nricInput, config.gantryMode)}
              />
            </Card>
            <FeatureToggler feature="HELP_MODAL">
              <HelpButton onPress={showHelpModal} />
            </FeatureToggler>
            <Credits style={{ marginTop: size(5) }} />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      {shouldShowCamera && (
        <Scanner
          isScanningEnabled={isScanningEnabled}
          onBarCodeScanned={onBarCodeScanned}
          onCancel={() => setShouldShowCamera(false)}
          cancelButtonText="Enter NRIC manually"
        />
      )}
      <UpdateCountResultModal
        updateCountResult={updateCountResult}
        isVisible={clickerState === "RESULT_RETURNED"}
        onExit={resetState}
      />
    </>
  );
};

export const CollectCustomerDetailsScreenContainer = withNavigationFocus(
  CollectCustomerDetailsScreen
);
