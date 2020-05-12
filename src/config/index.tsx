import Constants from "expo-constants";

export const IS_STORYBOOK_VIEW =
  Constants.manifest?.env?.EXPO_START_STORYBOOK === "true" ||
  (Constants.manifest?.releaseChannel || "").indexOf("storybook") > -1;
export const IS_MOCK = !!Constants.manifest?.env?.EXPO_MOCK;
export const ENDPOINT = __DEV__
  ? process.env.DEV_ENDPOINT
  : process.env.PRD_ENDPOINT;
