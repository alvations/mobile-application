import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../Layout/AppText";
import { fontSize, size } from "../../common/styles";

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
  return (
    <View style={styles.wrapper}>
      <View style={{ flex: 2 }}>
        <AppText style={styles.label}>Location</AppText>
        <AppText style={styles.itemText}>SupermarketCo Vivocity</AppText>
      </View>
      <View style={{ flex: 1, marginLeft: size(3) }}>
        <AppText style={styles.label}>Visitors</AppText>
        <AppText style={styles.itemText}>23</AppText>
      </View>
    </View>
  );
};
