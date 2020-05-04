import React, {
  createContext,
  useContext,
  FunctionComponent,
  useState,
  useEffect,
  useCallback
} from "react";
import { AsyncStorage } from "react-native";

export const BRANCH_CODE = "BRANCH_CODE";
export const USERNAME = "USERNAME";

interface AuthenticationContext {
  branchCode: string;
  username: string;
  setAuthInfo: (branchCode: string, username: string) => void;
  clearAuthInfo: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContext>({
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
  const [branchCode, setBranchCode] = useState("");
  const [username, setUsername] = useState("");

  const setAuthInfo = async (
    branchCode: string,
    username: string
  ): Promise<void> => {
    setBranchCode(branchCode);
    setUsername(username);
    await AsyncStorage.multiSet([
      [BRANCH_CODE, branchCode],
      [USERNAME, username]
    ]);
  };

  const clearAuthInfo = useCallback(async (): Promise<void> => {
    setBranchCode("");
    setUsername("");
    await AsyncStorage.multiRemove([BRANCH_CODE, USERNAME]);
  }, []);

  const loadAuthFromStore = async (): Promise<void> => {
    const values = await AsyncStorage.multiGet([BRANCH_CODE, USERNAME]);
    const [branchCode, username] = values.map(value => value[1]);
    if (branchCode && username) {
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
