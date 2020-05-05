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
export const EXPIRY_KEY = "EXPIRY_KEY";
export const BRANCH_CODE = "BRANCH_CODE";
export const USERNAME = "USERNAME";

interface AuthenticationContext {
  sessionToken: string;
  expiry: string;
  branchCode: string;
  username: string;
  setAuthInfo: (params: {
    sessionToken: string;
    expiry: number;
    branchCode: string;
    username: string;
  }) => void;
  clearAuthInfo: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContext>({
  sessionToken: "",
  expiry: "",
  branchCode: "",
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
  const [expiry, setExpiry] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [username, setUsername] = useState("");

  const setAuthInfo: AuthenticationContext["setAuthInfo"] = async ({
    sessionToken,
    expiry,
    branchCode,
    username
  }): Promise<void> => {
    setSessionToken(sessionToken);
    setExpiry(expiry.toString());
    setBranchCode(branchCode);
    setUsername(username);
    await AsyncStorage.multiSet([
      [BRANCH_CODE, branchCode],
      [USERNAME, username]
    ]);
  };

  const clearAuthInfo = useCallback(async (): Promise<void> => {
    setSessionToken("");
    setExpiry("");
    setBranchCode("");
    setUsername("");
    await AsyncStorage.multiRemove([BRANCH_CODE, USERNAME]);
  }, []);

  const loadAuthFromStore = async (): Promise<void> => {
    const values = await AsyncStorage.multiGet([
      SESSION_TOKEN_KEY,
      EXPIRY_KEY,
      BRANCH_CODE,
      USERNAME
    ]);
    const [sessionToken, expiry, branchCode, username] = values.map(
      value => value[1]
    );
    if (sessionToken && expiry && branchCode && username) {
      setSessionToken(sessionToken);
      setExpiry(expiry);
      setBranchCode(branchCode);
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
        expiry,
        branchCode,
        username,
        setAuthInfo,
        clearAuthInfo
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
