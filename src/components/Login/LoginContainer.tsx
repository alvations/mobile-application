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
import { LoginCard } from "./LoginCard";
import { LoginOTPCard } from "./LoginOTPCard";
import { LoginMobileNumberCard } from "./LoginMobileNumberCard";
import { LoginStage } from "./types";

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

  const { sessionToken, clickerUuid } = useAuthenticationContext();
  const showHelpModal = useContext(HelpModalContext);
  const messageContent = useContext(ImportantMessageContentContext);
  const [loginStage, setLoginStage] = useState<LoginStage>("MOBILE_NUMBER");

  useLayoutEffect(() => {
    if (sessionToken && clickerUuid) {
      navigation.navigate("CollectCustomerDetailsScreen");
    }
  }, [navigation, sessionToken, clickerUuid]);

  const renderLoginCard: () => void = () => {
    if (loginStage === "CLICKER") {
      return (
        <LoginCard setLoginStage={setLoginStage} navigation={navigation} />
      );
    } else if (loginStage === "OTP") {
      return <LoginOTPCard setLoginStage={setLoginStage} />;
    } else {
      return <LoginMobileNumberCard setLoginStage={setLoginStage} />;
    }
  };

  return (
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
            {renderLoginCard()}
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
