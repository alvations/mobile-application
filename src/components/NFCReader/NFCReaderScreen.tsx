import React, {
  FunctionComponent,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import {
  color,
  size,
  fontSize,
  borderRadius,
  shadow
} from "../../common/styles";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { NavigationProps } from "../../types";
import { AppText } from "../Layout/AppText";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "../Layout/Card";
import { GantryModeToggler } from "../CustomerDetails/GantryModeToggler";
import { InputWithLabel } from "../Layout/InputWithLabel";
import { SecondaryButton } from "../Layout/Buttons/SecondaryButton";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import {
  useCepasScanner,
  InvalidCardError,
  DuplicateCardError
} from "../../hooks/useCepasScanner/useCepasScanner";
import { useConfigContext } from "../../context/config";
import { BackButton } from "./BackButton";
import { formatCanId } from "./utils";

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
    borderBottomLeftRadius: borderRadius(4),
    borderBottomRightRadius: borderRadius(4)
  },
  inputAndButtonWrapper: {
    marginTop: size(2),
    flexDirection: "row",
    alignItems: "flex-end"
  },
  inputWrapper: {
    marginRight: size(1)
  }
});

export const NFCReaderScreen: FunctionComponent<NavigationProps> = ({
  navigation
}) => {
  const { config } = useConfigContext();

  const {
    detectedCanId,
    resume,
    scannerState,
    error: nfcError
  } = useCepasScanner();

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (
      nfcError instanceof InvalidCardError ||
      nfcError instanceof DuplicateCardError
    ) {
      setErrorMessage(nfcError.message);
      resume();
    }
  }, [nfcError, resume]);

  useEffect(() => {
    if (detectedCanId.length > 0) {
      setErrorMessage("");
    }
  }, [detectedCanId.length]);

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.content}>
        <View style={styles.topBar}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <ScrollView>
          <View style={styles.feedbackWrapper}>
            <View
              style={{
                padding: size(2.5),
                borderRadius: borderRadius(10),
                borderWidth: 1,
                borderColor: color("grey", 30)
              }}
            >
              <MaterialCommunityIcons
                name={
                  scannerState === "PAUSED/CARD_DETECTED"
                    ? "dots-horizontal"
                    : scannerState === "PAUSED/CAN_ID_DETECTED"
                    ? "check"
                    : "credit-card-scan-outline"
                }
                size={size(5)}
                color={color("grey", 70)}
              />
            </View>
            {scannerState !== "PAUSED/CAN_ID_DETECTED" && (
              <AppText
                style={{
                  fontFamily: "brand-bold",
                  fontSize: fontSize(2),
                  textAlign: "center",
                  marginTop: size(1)
                }}
              >
                Hold card to{"\n"} back of phone
              </AppText>
            )}
            {errorMessage.length > 0 && (
              <AppText
                style={{
                  marginTop: size(2),
                  maxWidth: 224,
                  flexShrink: 1,
                  color: color("red", 60),
                  textAlign: "center"
                }}
              >
                <Feather
                  name="alert-triangle"
                  size={fontSize(1)}
                  color={color("red", 60)}
                />
                {` ${errorMessage}`}
              </AppText>
            )}

            <View style={{ marginTop: size(4), marginHorizontal: size(3) }}>
              {detectedCanId.length > 0 && (
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
                      <AppText style={styles.idText}>
                        {formatCanId(detectedCanId)}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.childrenWrapper}>
                    <AppText style={{ fontSize: fontSize(-1) }}>
                      Please enter the customer&apos;s NRIC/FIN/Passport number
                      to link it with this card. This is a one-time step.
                    </AppText>
                    <View style={styles.inputAndButtonWrapper}>
                      <View style={styles.inputWrapper}>
                        <InputWithLabel
                          label="NRIC/FIN/Passport number"
                          value={""}
                          onChange={({ nativeEvent: { text } }) =>
                            // setNricInput(text)
                            null
                          }
                          onSubmitEditing={() => null}
                          blurOnSubmit={false}
                          enablesReturnKeyAutomatically={true}
                        />
                      </View>
                      <SecondaryButton
                        text="Scan"
                        onPress={() => "toggle"}
                        icon={
                          <Feather
                            name="maximize"
                            size={size(2)}
                            color={color("red", 50)}
                          />
                        }
                        fullWidth={true}
                      />
                    </View>
                    <View style={{ marginTop: size(2) }}>
                      <DarkButton
                        text={`Register and ${config.gantryMode}`}
                        fullWidth={true}
                      />
                    </View>
                    <View style={{ marginTop: size(1) }}>
                      <SecondaryButton
                        text="Cancel"
                        fullWidth={true}
                        onPress={resume}
                      />
                    </View>
                  </View>
                </Card>
              )}
            </View>
          </View>
        </ScrollView>
        {scannerState === "STARTED" && (
          <View
            style={{
              paddingTop: size(3),
              paddingBottom: size(4),
              paddingHorizontal: size(3),
              marginHorizontal: size(2),
              backgroundColor: color("grey", 0),
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: color("grey", 20),
              borderRadius: borderRadius(3),
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              ...shadow(1)
            }}
          >
            <GantryModeToggler />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};
