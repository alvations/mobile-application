import React, { FunctionComponent, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "../Layout/AppText";
import { fontSize, size, color } from "../../common/styles";
import { useAuthenticationContext } from "../../context/auth";
import { useClickerDetails } from "../../hooks/useClickerDetails/useClickerDetails";

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  label: {
    fontSize: fontSize(-2),
    lineHeight: fontSize(-2),
    marginBottom: 2
  },
  itemText: {
    fontSize: fontSize(1),
    fontFamily: "brand-bold"
  },
  loadingWrapper: {
    alignSelf: "flex-start",
    marginTop: 4
  }
});

export const LocationDetails: FunctionComponent = () => {
  const { sessionToken, username, clickerUuid } = useAuthenticationContext();
  const { getClickerDetails, count, name, isLoading } = useClickerDetails(
    sessionToken,
    clickerUuid
  );

  useEffect(() => {
    if (clickerUuid && sessionToken) {
      getClickerDetails();
    }
  }, [clickerUuid, getClickerDetails, sessionToken]);
  useEffect(() => {
    console.log("count updated");
  }, [count]);
  return (
    <View style={styles.wrapper}>
      <View style={{ flex: 3 }}>
        <AppText style={styles.label}>Location</AppText>
        {name.length === 0 && isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator />
          </View>
        ) : (
          <AppText style={styles.itemText}>
            {name} ({username})
          </AppText>
        )}
      </View>
      <View style={{ flex: 1, marginLeft: size(3) }}>
        <AppText style={styles.label}>Visitors</AppText>
        <TouchableOpacity
          onPress={getClickerDetails}
          style={{
            alignItems: "center",
            flexDirection: "row"
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <AppText style={styles.itemText}>{count}</AppText>
              <Feather
                name="refresh-cw"
                size={size(1.5)}
                color={color("grey", 70)}
                style={{ marginLeft: 6 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
