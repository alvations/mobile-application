import React, { FunctionComponent, useState, useRef } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { DarkButton } from "../Layout/Buttons/DarkButton";
import { size } from "../../common/styles";
import { Card } from "../Layout/Card";
import { AppText } from "../Layout/AppText";
import { InputWithLabel } from "../Layout/InputWithLabel";
import { useAuthenticationContext } from "../../context/auth";
import { updateUserClicker } from "../../services/auth";

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

interface LoginCard {
  onSuccess: (locationName: string) => void;
  onExpiredSessionToken: () => void;
}
export const LoginCard: FunctionComponent<LoginCard> = ({
  onSuccess,
  onExpiredSessionToken
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [branchCode, setBranchCode] = useState("");
  const [locationName, setLocationName] = useState("");
  const { sessionToken } = useAuthenticationContext();

  const secondInputRef = useRef<TextInput>(null);
  const onSubmit = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (locationName.length <= 0) {
        throw new Error("Please specify your name");
      }
      if (!sessionToken) {
        onExpiredSessionToken();
        alert("Sorry, your login session was lost, please log in again!");
        return;
      }
      await updateUserClicker(branchCode, locationName, sessionToken);
      setIsLoading(false);
      onSuccess(locationName);
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
            onSubmitEditing={() => secondInputRef.current?.focus()}
            keyboardType="numeric"
            blurOnSubmit={false}
          />
        </View>
        <View style={styles.inputWrapper}>
          <InputWithLabel
            ref={secondInputRef}
            label="Location name"
            value={locationName}
            onChange={({ nativeEvent: { text } }) => setLocationName(text)}
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
