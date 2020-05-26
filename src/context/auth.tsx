import React, {
  createContext,
  useContext,
  FunctionComponent,
  useState,
  useEffect,
  useCallback
} from "react";
import { AsyncStorage } from "react-native";
export const LOGIN_TOKEN_KEY = "LOGIN_TOKEN";
export const SESSION_TOKEN_KEY = "SESSION_TOKEN";
export const EXPIRY_KEY = "EXPIRY_KEY";
export const LOCATION_NAME_KEY = "LOCATION_NAME_KEY";

interface AuthenticationContext {
  isLoading: boolean;
  sessionToken: string;
  expiry: string;
  locationName: string;
  setAuthInfo: (params: { sessionToken: string; expiry: number }) => void;
  clearAuthInfo: () => void;
  setLocationName: (locationName: string) => void;
  clearLocationName: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContext>({
  isLoading: true,
  sessionToken: "",
  expiry: "",
  locationName: "",
  setAuthInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  clearAuthInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setLocationName: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  clearLocationName: () => {} // eslint-disable-line @typescript-eslint/no-empty-function
});

export const useAuthenticationContext = (): AuthenticationContext =>
  useContext<AuthenticationContext>(AuthenticationContext);

export const AuthenticationContextProvider: FunctionComponent = ({
  children
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState("");
  const [expiry, setExpiry] = useState("");
  const [location, setLocation] = useState("");

  const setAuthInfo: AuthenticationContext["setAuthInfo"] = async ({
    sessionToken,
    expiry
  }): Promise<void> => {
    setSessionToken(sessionToken);
    setExpiry(expiry.toString());
    await AsyncStorage.multiSet([
      [SESSION_TOKEN_KEY, sessionToken],
      [EXPIRY_KEY, expiry.toString()]
    ]);
  };

  const clearAuthInfo = useCallback(async (): Promise<void> => {
    setSessionToken("");
    setExpiry("");
    await AsyncStorage.multiRemove([SESSION_TOKEN_KEY, EXPIRY_KEY]);
  }, []);

  const setLocationName: AuthenticationContext["setLocationName"] = async (
    locationName
  ): Promise<void> => {
    setLocation(locationName);
    await AsyncStorage.setItem(LOCATION_NAME_KEY, locationName);
  };

  const clearLocationName = useCallback(async (): Promise<void> => {
    setLocation("");
    await AsyncStorage.removeItem(LOCATION_NAME_KEY);
  }, []);

  const loadAuthFromStore = async (): Promise<void> => {
    const values = await AsyncStorage.multiGet([SESSION_TOKEN_KEY, EXPIRY_KEY]);
    const [sessionToken, expiry] = values.map(value => value[1]);
    if (sessionToken && expiry) {
      setSessionToken(sessionToken);
      setExpiry(expiry);
    }
  };

  const loadLocationNameFromStore = async (): Promise<void> => {
    const locationName = await AsyncStorage.getItem(LOCATION_NAME_KEY);
    if (locationName) {
      setLocation(locationName);
    }
  };

  useEffect(() => {
    const load = async (): Promise<void> => {
      await loadAuthFromStore();
      await loadLocationNameFromStore();
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <AuthenticationContext.Provider
      value={{
        isLoading,
        sessionToken,
        expiry,
        locationName: location,
        setAuthInfo,
        clearAuthInfo,
        setLocationName,
        clearLocationName
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
