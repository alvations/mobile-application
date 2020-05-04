import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useContext
} from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { NavigationProps } from "../../types";
import { useAuthenticationContext } from "../../context/auth";
import { size } from "../../common/styles";
import { TopBackground } from "../Layout/TopBackground";
import { Credits } from "../Credits";
import { AppName } from "../Layout/AppName";
import * as Sentry from "sentry-expo";
import { HelpModalContext } from "../../context/help";
import { HelpButton } from "../Layout/Buttons/HelpButton";
import { FeatureToggler } from "../FeatureToggler/FeatureToggler";
import { ImportantMessageContentContext } from "../../context/importantMessage";
import { Banner } from "../Layout/Banner";
import { LoginCard } from "./LoginCard";

const styles = StyleSheet.create({
  content: {
    padding: size(2),
    marginTop: -size(3),
    width: 512,
    maxWidth: "100%",
    height: "100%",
    justifyContent: "center"
  },
  headerText: {
    marginBottom: size(4),
    textAlign: "center",
    alignSelf: "center"
  },
  scanButtonWrapper: {
    marginTop: size(3)
  },
  bannerWrapper: {
    marginBottom: size(1.5)
  }
});

export const InitialisationContainer: FunctionComponent<NavigationProps> = ({
  navigation
}) => {
  useEffect(() => {
    Sentry.addBreadcrumb({ category: "navigation", message: "LoginContainer" });
  }, []);

  const { branchCode, username } = useAuthenticationContext();
  const showHelpModal = useContext(HelpModalContext);
  const messageContent = useContext(ImportantMessageContentContext);

  useLayoutEffect(() => {
    if (branchCode && username) {
      navigation.navigate("CollectCustomerDetailsScreen");
    }
  }, [branchCode, navigation, username]);

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          style={{ alignItems: "center" }}
          behavior="padding"
        >
          <TopBackground style={{ height: "50%", maxHeight: "auto" }} />
          <View style={styles.content}>
            <View style={styles.headerText}>
              <AppName />
            </View>

            {messageContent && (
              <View style={styles.bannerWrapper}>
                <Banner {...messageContent} />
              </View>
            )}

            <LoginCard navigation={navigation} />

            <FeatureToggler feature="HELP_MODAL">
              <HelpButton onPress={showHelpModal} />
            </FeatureToggler>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <Credits style={{ bottom: size(3) }} />
    </>
  );
};
