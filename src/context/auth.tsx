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

interface AuthenticationContext {
  isLoading: boolean;
  sessionToken: string;
  expiry: string;
  setAuthInfo: (params: { sessionToken: string; expiry: number }) => void;
  clearAuthInfo: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContext>({
  isLoading: true,
  sessionToken: "",
  expiry: "",
  setAuthInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  clearAuthInfo: () => {} // eslint-disable-line @typescript-eslint/no-empty-function
});

export const useAuthenticationContext = (): AuthenticationContext =>
  useContext<AuthenticationContext>(AuthenticationContext);

export const AuthenticationContextProvider: FunctionComponent = ({
  children
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState("");
  const [expiry, setExpiry] = useState("");

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

  const loadAuthFromStore = async (): Promise<void> => {
    const values = await AsyncStorage.multiGet([SESSION_TOKEN_KEY, EXPIRY_KEY]);
    const [sessionToken, expiry] = values.map(value => value[1]);
    if (sessionToken && expiry) {
      setSessionToken(sessionToken);
      setExpiry(expiry);
    }
  };

  useEffect(() => {
    const load = async (): Promise<void> => {
      await loadAuthFromStore();
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
        setAuthInfo,
        clearAuthInfo
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
