import { StyleSheet, View } from "react-native";
import { size, color } from "../../common/styles";
import { Card } from "../Layout/Card";
import { LocationDetails } from "./LocationDetails";
import React, { FunctionComponent } from "react";
import { GantryModeToggler } from "./GantryModeToggler";

const styles = StyleSheet.create({
  content: {
    marginBottom: -size(1)
  },
  horizontalRule: {
    borderBottomColor: color("grey", 30),
    marginVertical: size(3),
    marginHorizontal: -size(3),
    borderBottomWidth: 1
  }
});

export const MetaDataCard: FunctionComponent = () => (
  <Card>
    <View style={styles.content}>
      <LocationDetails />
      <View style={styles.horizontalRule} />
      <GantryModeToggler />
    </View>
  </Card>
);
