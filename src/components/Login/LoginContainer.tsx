import React, {
  FunctionComponent,
  useEffect,
  useState,
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
import { LoginOTPCard } from "./LoginOTPCard";
import { LoginMobileNumberCard } from "./LoginMobileNumberCard";
import { LoginStage } from "./types";
import { LoadingView } from "../Loading";

const styles = StyleSheet.create({
  content: {
    padding: size(2),
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

  const { isLoading, sessionToken, setAuthInfo } = useAuthenticationContext();
  const showHelpModal = useContext(HelpModalContext);
  const messageContent = useContext(ImportantMessageContentContext);

  const [loginStage, setLoginStage] = useState<LoginStage>("MOBILE_NUMBER");
  const [loginToken, setLoginToken] = useState<string>("");

  useLayoutEffect(() => {
    if (sessionToken) {
      navigation.navigate("CollectCustomerDetailsScreen");
    }
  }, [navigation, sessionToken]);

  return isLoading ? (
    <LoadingView />
  ) : (
    <>
      <TopBackground style={{ height: "50%" }} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
        scrollIndicatorInsets={{ right: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.content}>
            <View style={styles.headerText}>
              <AppName />
            </View>
            {messageContent && (
              <View style={styles.bannerWrapper}>
                <Banner {...messageContent} />
              </View>
            )}
            {loginStage === "MOBILE_NUMBER" && (
              <LoginMobileNumberCard
                onSuccess={loginToken => {
                  setLoginToken(loginToken);
                  setLoginStage("OTP");
                }}
              />
            )}
            {loginStage === "OTP" && (
              <LoginOTPCard
                loginToken={loginToken}
                onSuccess={(sessionToken, expiry) => {
                  setAuthInfo({
                    sessionToken,
                    expiry
                  });
                  navigation.navigate("CollectCustomerDetailsScreen");
                }}
                onFailure={() => {
                  setLoginStage("MOBILE_NUMBER");
                }}
              />
            )}
            <FeatureToggler feature="HELP_MODAL">
              <HelpButton onPress={showHelpModal} />
            </FeatureToggler>
            <Credits style={{ marginTop: size(5) }} />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  );
};
