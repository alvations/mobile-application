import React, { FunctionComponent } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "../Layout/AppText";
import { fontSize, size, color } from "../../common/styles";

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
  },
  inlineButtonWrapper: {
    marginTop: size(0.5),
    marginBottom: -size(0.5)
  },
  inlineButtonText: {
    textAlign: "center",
    fontFamily: "brand-italic",
    fontSize: fontSize(-1),
    color: color("blue", 40)
  }
});

const InlineButton: FunctionComponent<{
  text: string;
  featherIconName: string;
  onPress: () => void;
  disabled?: boolean;
}> = ({ text, featherIconName, onPress, disabled = false }) => (
  <TouchableOpacity
    style={{ alignSelf: "flex-start" }}
    onPress={onPress}
    disabled={disabled}
  >
    <AppText style={styles.inlineButtonText}>
      <Feather
        name={featherIconName}
        size={size(1.5)}
        color={color("blue", 40)}
      />
      {` ${text}`}
    </AppText>
  </TouchableOpacity>
);

const ChangeLocationButton: FunctionComponent<{
  onPress: () => void;
}> = ({ onPress }) => (
  <InlineButton
    text="Change location"
    featherIconName="map-pin"
    onPress={onPress}
  />
);

const RefreshButton: FunctionComponent<{
  onPress: () => void;
  disabled: boolean;
}> = ({ onPress, disabled = false }) => (
  <InlineButton
    text="Refresh"
    featherIconName="refresh-cw"
    onPress={onPress}
    disabled={disabled}
  />
);

interface LocationDetails {
  clickerName: string;
  locationName: string;
  count: number;
  isLoading: boolean;
  refreshCallback: () => void;
  onChangeClicker: () => void;
}

export const LocationDetails: FunctionComponent<LocationDetails> = ({
  clickerName,
  locationName,
  count,
  isLoading,
  refreshCallback,
  onChangeClicker
}) => {
  return (
    <>
      <View style={styles.wrapper}>
        <View style={{ flex: 3 }}>
          <AppText style={styles.label}>Location</AppText>
          {clickerName.length === 0 && isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator />
            </View>
          ) : (
            <AppText style={styles.itemText}>
              {clickerName} ({locationName})
            </AppText>
          )}
          <View style={styles.inlineButtonWrapper}>
            <ChangeLocationButton onPress={onChangeClicker} />
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: size(3) }}>
          <AppText style={styles.label}>Visitors</AppText>
          {isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <AppText style={styles.itemText}>{count}</AppText>
              <View style={styles.inlineButtonWrapper}>
                <RefreshButton onPress={refreshCallback} disabled={isLoading} />
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
};
