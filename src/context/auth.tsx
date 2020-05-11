import React, {
  createContext,
  useContext,
  FunctionComponent,
  useState,
  useEffect,
  useCallback
} from "react";
import { AsyncStorage } from "react-native";

export const SESSION_TOKEN_KEY = "SESSION_TOKEN";
export const CLICKER_UUID_KEY = "CLICKER_UUID";
export const EXPIRY_KEY = "EXPIRY_KEY";
export const USERNAME = "USERNAME";

interface AuthenticationContext {
  sessionToken: string;
  clickerUuid: string;
  expiry: string;
  username: string;
  setAuthInfo: (params: {
    sessionToken: string;
    clickerUuid: string;
    expiry: number;
    username: string;
  }) => void;
  clearAuthInfo: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContext>({
  sessionToken: "",
  clickerUuid: "",
  expiry: "",
  username: "",
  setAuthInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  clearAuthInfo: () => {} // eslint-disable-line @typescript-eslint/no-empty-function
});

export const useAuthenticationContext = (): AuthenticationContext =>
  useContext<AuthenticationContext>(AuthenticationContext);

export const AuthenticationContextProvider: FunctionComponent = ({
  children
}) => {
  const [sessionToken, setSessionToken] = useState("");
  const [clickerUuid, setClickerUuid] = useState("");
  const [expiry, setExpiry] = useState("");
  const [username, setUsername] = useState("");

  const setAuthInfo: AuthenticationContext["setAuthInfo"] = async ({
    sessionToken,
    clickerUuid,
    expiry,
    username
  }): Promise<void> => {
    setSessionToken(sessionToken);
    setClickerUuid(clickerUuid);
    setExpiry(expiry.toString());
    setUsername(username);
    await AsyncStorage.multiSet([
      [SESSION_TOKEN_KEY, sessionToken],
      [CLICKER_UUID_KEY, clickerUuid],
      [EXPIRY_KEY, expiry.toString()],
      [USERNAME, username]
    ]);
  };

  const clearAuthInfo = useCallback(async (): Promise<void> => {
    setSessionToken("");
    setExpiry("");
    setUsername("");
    await AsyncStorage.multiRemove([
      USERNAME,
      SESSION_TOKEN_KEY,
      CLICKER_UUID_KEY,
      EXPIRY_KEY
    ]);
  }, []);

  const loadAuthFromStore = async (): Promise<void> => {
    const values = await AsyncStorage.multiGet([
      SESSION_TOKEN_KEY,
      CLICKER_UUID_KEY,
      EXPIRY_KEY,
      USERNAME
    ]);
    const [sessionToken, clickerUuid, expiry, username] = values.map(
      value => value[1]
    );
    if (sessionToken && expiry && username) {
      setSessionToken(sessionToken);
      setClickerUuid(clickerUuid);
      setExpiry(expiry);
      setUsername(username);
    }
  };

  useEffect(() => {
    loadAuthFromStore();
  }, []);

  return (
    <AuthenticationContext.Provider
      value={{
        sessionToken,
        clickerUuid,
        expiry,
        username,
        setAuthInfo,
        clearAuthInfo
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
