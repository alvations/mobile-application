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
  locationName: string;
  count: number;
  isLoading: boolean;
  refreshCallback: () => void;
  onChangeClicker: () => void;
}
export const MetaDataCard: FunctionComponent<MetaDataCard> = ({
  clickerName,
  locationName,
  count,
  isLoading,
  refreshCallback,
  onChangeClicker
}) => (
  <Card>
    <View style={styles.content}>
      <LocationDetails
        clickerName={clickerName}
        locationName={locationName}
        count={count}
        isLoading={isLoading}
        refreshCallback={refreshCallback}
        onChangeClicker={onChangeClicker}
      />
      <View style={styles.horizontalRule} />
      <GantryModeToggler />
    </View>
  </Card>
);
