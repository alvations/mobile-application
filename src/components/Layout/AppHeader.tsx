import React, { FunctionComponent, useCallback } from "react";
import { color, size } from "../../common/styles";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { withNavigation } from "react-navigation";
import { NavigationProps } from "../../types";
import { AppName } from "./AppName";
import { AppText } from "./AppText";
import { useLogout } from "../../hooks/useLogout";

const styles = StyleSheet.create({
  appHeaderWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  }
});

export const AppHeaderComponent: FunctionComponent<NavigationProps> = ({
  navigation
}) => {
  const { logout } = useLogout();

  const handleLogout = useCallback((): void => {
    logout(navigation.dispatch);
  }, [logout, navigation.dispatch]);

  const onPressLogout = (): void => {
    Alert.alert(
      "You are about to logout",
      "Are you sure?",
      [
        {
          text: "Cancel"
        },
        {
          text: "Logout",
          onPress: handleLogout,
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.appHeaderWrapper}>
      <AppName />
      <TouchableOpacity onPress={onPressLogout}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end"
          }}
        >
          <AppText style={{ color: color("grey", 0) }}>
            {"Logout  "}
            <Feather name="log-out" size={size(2)} color={color("grey", 0)} />
          </AppText>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const AppHeader = withNavigation(AppHeaderComponent);
