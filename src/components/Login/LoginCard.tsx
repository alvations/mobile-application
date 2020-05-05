import React, { FunctionComponent, useState } from "react";
import { View, StyleSheet } from "react-native";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { size } from "../../common/styles";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { InputWithLabel } from "../Layout/InputWithLabel";
import { NavigationProps } from "../../types";
import { useAuthenticationContext } from "../../context/auth";
import { validateLogin } from "../../services/auth";

const styles = StyleSheet.create({
  inputAndButtonWrapper: {
    marginTop: size(2)
  },
  inputWrapper: {
    marginTop: size(1)
  },
  buttonWrapper: {
    marginTop: size(3)
  }
});

export const LoginCard: FunctionComponent<NavigationProps> = ({
  navigation
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [branchCode, setBranchCode] = useState("");
  const [username, setUsername] = useState("");
  const { setAuthInfo } = useAuthenticationContext();

  const onSubmit = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await validateLogin(branchCode, username);
      setIsLoading(false);
      setAuthInfo({
        sessionToken: response.sessionToken,
        expiry: response.ttl.getTime(),
        branchCode,
        username
      });
      navigation.navigate("CollectCustomerDetailsScreen");
    } catch (e) {
      setIsLoading(false);
      alert(e);
    }
  };

  return (
    <Card>
      <AppText>
        Please log in with the branch code provided by your supervisor.
      </AppText>
      <View style={styles.inputAndButtonWrapper}>
        <View style={styles.inputWrapper}>
          <InputWithLabel
            label="Branch code"
            value={branchCode}
            onChange={({ nativeEvent: { text } }) => setBranchCode(text)}
            onSubmitEditing={onSubmit}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputWrapper}>
          <InputWithLabel
            label="Staff name"
            value={username}
            onChange={({ nativeEvent: { text } }) => setUsername(text)}
            onSubmitEditing={onSubmit}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <DarkButton
            text="Login"
            onPress={onSubmit}
            fullWidth={true}
            isLoading={isLoading}
          />
        </View>
      </View>
    </Card>
  );
};
