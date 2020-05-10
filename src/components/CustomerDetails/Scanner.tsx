import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { color, size } from "../../common/styles";
import { SafeAreaView } from "react-navigation";
import { IdScanner } from "../IdScanner/IdScanner";
import { GantryModeToggler } from "./GantryModeToggler";

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color("grey", 0)
  },
  content: {
    flex: 1
  },
  topBar: {
    marginTop: size(0.5),
    marginBottom: size(2),
    marginHorizontal: size(2)
  },
  cancelButtonWrapper: {
    marginTop: size(3)
  },
  scannerWrapper: {
    position: "relative",
    flex: 1
  }
});

export const Scanner: FunctionComponent<IdScanner> = ({
  onBarCodeScanned,
  barCodeTypes,
  onCancel,
  cancelButtonText,
  isScanningEnabled = true
}) => {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.content}>
        <View style={styles.topBar}>
          <GantryModeToggler />
        </View>
        <View style={styles.scannerWrapper}>
          <IdScanner
            barCodeTypes={barCodeTypes}
            isScanningEnabled={isScanningEnabled}
            onBarCodeScanned={onBarCodeScanned}
            onCancel={onCancel}
            cancelButtonText={cancelButtonText}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
