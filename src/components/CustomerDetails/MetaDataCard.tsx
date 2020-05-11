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
// For now we pass down props, will refactor to use context instead to pass props
interface MetaDataCard {
  clickerName: string;
  count: number;
  isLoading: boolean;
  refreshCallback: () => void;
}
export const MetaDataCard: FunctionComponent<MetaDataCard> = ({
  clickerName,
  count,
  isLoading,
  refreshCallback
}) => (
  <Card>
    <View style={styles.content}>
      <LocationDetails
        clickerName={clickerName}
        count={count}
        isLoading={isLoading}
        refreshCallback={refreshCallback}
      />
      <View style={styles.horizontalRule} />
      <GantryModeToggler />
    </View>
  </Card>
);
