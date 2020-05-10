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
import { useAuthenticationContext } from "../../context/auth";

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

interface LocationDetails {
  clickerName: string;
  count: number;
  isLoading: boolean;
  refreshCallback: () => void;
}

export const LocationDetails: FunctionComponent<LocationDetails> = ({
  clickerName,
  count,
  isLoading,
  refreshCallback
}) => {
  const { username } = useAuthenticationContext();

  return (
    <View style={styles.wrapper}>
      <View style={{ flex: 3 }}>
        <AppText style={styles.label}>Location</AppText>
        {clickerName.length === 0 && isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator />
          </View>
        ) : (
          <AppText style={styles.itemText}>
            {clickerName} ({username})
          </AppText>
        )}
      </View>
      <View style={{ flex: 1, marginLeft: size(3) }}>
        <AppText style={styles.label}>Visitors</AppText>
        <TouchableOpacity
          onPress={refreshCallback}
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
