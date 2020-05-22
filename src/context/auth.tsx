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
export const USERNAME = "USERNAME";

interface AuthenticationContext {
  isLoading: boolean;
  loginToken: string;
  sessionToken: string;
  expiry: string;
  username: string;
  setLoginInfo: (params: { loginToken: string }) => void;
  setAuthInfo: (params: { sessionToken: string; expiry: number }) => void;
  setClickerInfo: (params: { username: string }) => void;
  clearAuthInfo: () => void;
  clearLoginInfo: () => void;
  clearClickerInfo: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContext>({
  isLoading: true,
  loginToken: "",
  sessionToken: "",
  expiry: "",
  username: "",
  setLoginInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setClickerInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  setAuthInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  clearAuthInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  clearLoginInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  clearClickerInfo: () => {} // eslint-disable-line @typescript-eslint/no-empty-function
});

export const useAuthenticationContext = (): AuthenticationContext =>
  useContext<AuthenticationContext>(AuthenticationContext);

export const AuthenticationContextProvider: FunctionComponent = ({
  children
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loginToken, setLoginToken] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [expiry, setExpiry] = useState("");
  const [username, setUsername] = useState("");

  const setLoginInfo: AuthenticationContext["setLoginInfo"] = async ({
    loginToken
  }): Promise<void> => {
    setLoginToken(loginToken);
    await AsyncStorage.multiSet([[LOGIN_TOKEN_KEY, loginToken]]);
  };

  const setClickerInfo: AuthenticationContext["setClickerInfo"] = async ({
    username
  }): Promise<void> => {
    setUsername(username);
    await AsyncStorage.setItem(USERNAME, username);
  };

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

  const clearLoginInfo = useCallback(async (): Promise<void> => {
    setLoginToken("");
    await AsyncStorage.multiRemove([LOGIN_TOKEN_KEY]);
  }, []);

  const clearClickerInfo = useCallback(async (): Promise<void> => {
    setUsername("");
    await AsyncStorage.removeItem(USERNAME);
  }, []);

  const clearAuthInfo = useCallback(async (): Promise<void> => {
    setSessionToken("");
    setExpiry("");
    setUsername("");
    await AsyncStorage.multiRemove([USERNAME, SESSION_TOKEN_KEY, EXPIRY_KEY]);
  }, []);

  const loadAuthFromStore = async (): Promise<void> => {
    const values = await AsyncStorage.multiGet([
      SESSION_TOKEN_KEY,
      EXPIRY_KEY,
      USERNAME
    ]);
    const [sessionToken, expiry, username] = values.map(value => value[1]);
    if (sessionToken && expiry && username) {
      setSessionToken(sessionToken);
      setExpiry(expiry);
      setUsername(username);
    }
  };

  const loadClickerFromStore = async (): Promise<void> => {
    const username = await AsyncStorage.getItem(USERNAME);
    if (username) {
      setUsername(username);
    }
  };

  const loadLoginFromStore = async (): Promise<void> => {
    const loginToken = await AsyncStorage.getItem(LOGIN_TOKEN_KEY);
    if (loginToken) {
      setLoginToken(loginToken);
    }
  };

  useEffect(() => {
    const load = async (): Promise<void> => {
      await Promise.all([
        loadAuthFromStore(),
        loadLoginFromStore(),
        loadClickerFromStore()
      ]);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <AuthenticationContext.Provider
      value={{
        isLoading,
        loginToken,
        sessionToken,
        expiry,
        username,
        setLoginInfo,
        setClickerInfo,
        setAuthInfo,
        clearAuthInfo,
        clearClickerInfo,
        clearLoginInfo
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
