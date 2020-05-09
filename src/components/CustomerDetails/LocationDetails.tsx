import React, { FunctionComponent, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../Layout/AppText";
import { fontSize, size } from "../../common/styles";
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
  }
});

export const LocationDetails: FunctionComponent = () => {
  const { sessionToken, username, clickerUuid } = useAuthenticationContext();
  const { getClickerDetails, count, name } = useClickerDetails(
    sessionToken,
    clickerUuid
  );

  useEffect(() => {
    getClickerDetails();
  }, [getClickerDetails]);

  return (
    <View style={styles.wrapper}>
      <View style={{ flex: 3 }}>
        <AppText style={styles.label}>Location</AppText>
        <AppText style={styles.itemText}>
          {name} ({username})
        </AppText>
      </View>
      <View style={{ flex: 1, marginLeft: size(3) }}>
        <AppText style={styles.label}>Visitors</AppText>
        <AppText style={styles.itemText}>{count}</AppText>
      </View>
    </View>
  );
};
