import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Vibration
} from "react-native";
import { size } from "../../common/styles";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { TopBackground } from "../Layout/TopBackground";
import { Credits } from "../Credits";
import {
  withNavigationFocus,
  NavigationFocusInjectedProps
} from "react-navigation";
import { BarCodeScannedCallback } from "expo-barcode-scanner";
import { validateAndCleanNric } from "../../utils/validateNric";
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
import { TransactionResultModal } from "./TransactionResultModal";
import { GantryModeToggler } from "./GantryModeToggler";
import { createTransaction } from "../../services/transactions";
import { useAuthenticationContext } from "../../context/auth";
import { useConfigContext } from "../../context/config";
import { CreateTransactionResult } from "../../types";

const styles = StyleSheet.create({
  content: {
    position: "relative",
    padding: size(2),
    paddingVertical: size(8),
    height: "100%",
    width: 512,
    maxWidth: "100%"
  },
  headerText: {
    marginBottom: size(4)
  },
  bannerWrapper: {
    marginBottom: size(1.5)
  },
  modeCardWrapper: {
    marginBottom: size(1.5)
  },
  modeCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: -size(1)
  }
});

// type CheckState =
//   | "AWAITING_ID"
//   | "VALIDATING_ID"
//   | "CREATING_TRANSACTION"
//   | "TRANSACTION_COMPLETE";

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
  const [isScanningEnabled, setIsScanningEnabled] = useState(true);
  const [nricInput, setNricInput] = useState("");
  const showHelpModal = useContext(HelpModalContext);
  const checkUpdates = useCheckUpdates();

  useEffect(() => {
    if (isFocused) {
      setIsScanningEnabled(true);
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      checkUpdates();
    }
  }, [isFocused, checkUpdates]);

  const [showTransactionResultModal, setShowTransactionResultModal] = useState(
    false
  );
  const [transactionResult, setTransactionResult] = useState<
    CreateTransactionResult & { id: string }
  >();
  const { branchCode, username } = useAuthenticationContext();
  const { config } = useConfigContext();

  const onCheck = async (input: string): Promise<void> => {
    try {
      setIsScanningEnabled(false);
      const nric = validateAndCleanNric(input);
      Vibration.vibrate(50);
      setShowTransactionResultModal(true);
      // setTransactionResult({ id: nric });
      const result = await createTransaction({
        id: nric,
        branchCode,
        username,
        gantryMode: config.gantryMode
      });
      setTransactionResult({
        id: nric,
        ...result
      });
      setNricInput("");
    } catch (e) {
      setIsScanningEnabled(false);
      Alert.alert(
        "Error",
        e.message || e,
        [
          {
            text: "Dimiss",
            onPress: () => setIsScanningEnabled(true)
          }
        ],
        {
          onDismiss: () => setIsScanningEnabled(true) // for android outside alert clicks
        }
      );
    }
  };

  const onBarCodeScanned: BarCodeScannedCallback = event => {
    if (isFocused && isScanningEnabled && event.data) {
      onCheck(event.data);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ alignItems: "center" }}
        scrollIndicatorInsets={{ right: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TopBackground />
        <KeyboardAvoidingView behavior="position">
          <View style={styles.content}>
            <View style={styles.headerText}>
              <AppHeader />
            </View>
            {messageContent && (
              <View style={styles.bannerWrapper}>
                <Banner {...messageContent} />
              </View>
            )}
            <View style={styles.modeCardWrapper}>
              <Card>
                <View style={styles.modeCardContent}>
                  <GantryModeToggler />
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
                submitNric={() => onCheck(nricInput)}
              />
            </Card>
            <FeatureToggler feature="HELP_MODAL">
              <HelpButton onPress={showHelpModal} />
            </FeatureToggler>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <Credits style={{ bottom: size(3) }} />
      {shouldShowCamera && (
        <Scanner
          isScanningEnabled={isScanningEnabled}
          onBarCodeScanned={onBarCodeScanned}
          onCancel={() => setShouldShowCamera(false)}
          cancelButtonText="Enter NRIC manually"
        />
      )}
      <TransactionResultModal
        isVisible={showTransactionResultModal}
        onExit={() => {
          setIsScanningEnabled(true);
          setShowTransactionResultModal(false);
        }}
        {...transactionResult}
      />
    </>
  );
};

export const CollectCustomerDetailsScreenContainer = withNavigationFocus(
  CollectCustomerDetailsScreen
);
