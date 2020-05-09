import { StyleSheet } from "react-native";
import { size, color, fontSize } from "../../../common/styles";

export const sharedStyles = StyleSheet.create({
  card: {
    minWidth: 256,
    maxWidth: "80%",
    borderTopWidth: size(1)
  },
  loadingCard: {
    backgroundColor: color("grey", 10),
    borderColor: color("grey", 30)
  },
  successCard: {
    backgroundColor: color("green", 10),
    borderColor: color("green", 50)
  },
  rejectedCard: {
    backgroundColor: color("yellow", 10),
    borderColor: color("yellow", 30)
  },
  failureCard: {
    backgroundColor: color("red", 10),
    borderColor: color("red", 50)
  },
  emoji: {
    fontSize: fontSize(3),
    marginBottom: size(1.5),
    marginTop: size(1)
  },
  headerText: {
    fontFamily: "brand-bold",
    fontSize: fontSize(3)
  },
  additionalInfoSection: {
    marginTop: size(2.5),
    marginBottom: -size(1)
  },
  additionalInfoText: {
    fontSize: fontSize(-3)
  }
});
