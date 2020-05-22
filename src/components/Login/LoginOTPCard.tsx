import React, {
  useState,
  useEffect,
  FunctionComponent,
  Dispatch,
  SetStateAction
} from "react";
import { View, StyleSheet } from "react-native";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { SecondaryButton } from "../Layout/Buttons/SecondaryButton";
import { size, fontSize } from "../../common/styles";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { InputWithLabel } from "../Layout/InputWithLabel";
import { LoginStage } from "./types";
import { useAuthenticationContext } from "../../context/auth";
import { validateOTP, requestOTP } from "../../services/auth";

const RESEND_OTP_TIME_LIMIT = 60 * 1000;

const styles = StyleSheet.create({
  inputAndButtonWrapper: {
    marginTop: size(3)
  },
  buttonsWrapper: {
    marginTop: size(2),
    flexDirection: "row",
    alignItems: "center"
  },
  resendCountdownText: { marginRight: size(1), fontSize: fontSize(-2) },
  submitWrapper: {
    flex: 1,
    marginLeft: size(1)
  }
});

interface LoginOTPCard {
  setLoginStage: Dispatch<SetStateAction<LoginStage>>;
}

export const LoginOTPCard: FunctionComponent<LoginOTPCard> = ({
  setLoginStage
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpValue, setOTPValue] = useState("");
  const [resendDisabledTime, setResendDisabledTime] = useState(
    RESEND_OTP_TIME_LIMIT
  );
  const {
    setAuthInfo,
    loginToken,
    clearLoginInfo
  } = useAuthenticationContext();

  useEffect(() => {
    const resendTimer = setTimeout(() => {
      if (resendDisabledTime <= 0) {
        clearTimeout(resendTimer);
      } else {
        setResendDisabledTime(resendDisabledTime - 1000);
      }
    }, 1000);

    return () => {
      if (resendTimer) {
        clearTimeout(resendTimer);
      }
    };
  }, [resendDisabledTime]);

  const onValidateOTP = async (otp: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (!loginToken) {
        setLoginStage("MOBILE_NUMBER");
        alert(
          "Sorry, you do not have a login session, please try logging in again"
        );
      }
      const response = await validateOTP(otp, loginToken);
      setIsLoading(false);
      setAuthInfo({
        sessionToken: response.sessionToken,
        expiry: response.ttl.getTime()
      });
      await clearLoginInfo();
      setLoginStage("CLICKER");
    } catch (e) {
      setIsLoading(false);
      alert(e);
    }
  };

  const onSubmitOTP = (): void => {
    onValidateOTP(otpValue);
  };

  const resendOTP = async (): Promise<void> => {
    setIsResending(true);
    try {
      await requestOTP(loginToken);
      setIsResending(false);
      setResendDisabledTime(RESEND_OTP_TIME_LIMIT);
    } catch (e) {
      setIsResending(false);
      alert(e.message || e);
    }
  };

  const handleChange = (text: string): void => {
    /^\d*$/.test(text) && setOTPValue(text);
  };

  return (
    <Card>
      <AppText>We&apos;re sending you the one-time password...</AppText>
      <View style={styles.inputAndButtonWrapper}>
        <InputWithLabel
          label="OTP"
          value={otpValue}
          onChange={({ nativeEvent: { text } }) => handleChange(text)}
          onSubmitEditing={onSubmitOTP}
          keyboardType="numeric"
        />
        <View style={styles.buttonsWrapper}>
          {resendDisabledTime > 0 ? (
            <AppText style={styles.resendCountdownText}>
              Resend in {resendDisabledTime / 1000}s
            </AppText>
          ) : (
            <SecondaryButton
              text="Resend"
              onPress={resendOTP}
              isLoading={isResending}
              disabled={isLoading}
            />
          )}
          <View style={styles.submitWrapper}>
            <DarkButton
              text="Submit"
              fullWidth
              onPress={onSubmitOTP}
              isLoading={isLoading}
              disabled={isResending}
            />
          </View>
        </View>
      </View>
    </Card>
  );
};
