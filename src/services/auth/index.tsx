import { IS_MOCK, ENDPOINT } from "../../config";
import * as t from "io-ts";
import {
  SessionCredentials,
  ClickerCredentials,
  LoginCredentials
} from "../../types";
import { fetchWithValidator, ValidationError } from "../helpers";
import * as Sentry from "sentry-expo";

export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginError";
  }
}

const generateHeaders = (sessionToken?: string): HeadersInit => {
  const headers: HeadersInit = new Headers();
  headers.set("CROWD_GO_WHERE_TOKEN", process.env.CLIENT_API_KEY ?? "");
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (sessionToken) {
    headers.set("USER_SESSION_ID", sessionToken);
  }
  return headers;
};

export const liveLoginRequest = async (
  mobileNumber: string
): Promise<LoginCredentials> => {
  const payload = { mobileNumber };
  try {
    const response = await fetchWithValidator(
      LoginCredentials,
      `${ENDPOINT}/logins/user_login`,
      {
        method: "POST",
        headers: generateHeaders(),
        body: JSON.stringify(payload)
      }
    );
    return response;
  } catch (e) {
    throw new LoginError(e.message);
  }
};

export const mockLoginRequest = async (
  _mobileNumber: string
): Promise<LoginCredentials> => {
  await new Promise(res => setTimeout(() => res("done"), 500));
  return {
    loginUuid: "some-valid-login-token"
  };
};
export const liveRequestOTP = async (loginUuid: string): Promise<unknown> => {
  const payload = { loginUuid };
  try {
    const response = await fetchWithValidator(
      t.unknown,
      `${ENDPOINT}/logins/request_otp`,
      {
        method: "POST",
        headers: generateHeaders(),
        body: JSON.stringify(payload)
      }
    );
    return response;
  } catch (e) {
    throw new LoginError(e.message);
  }
};

export const mockRequestOTP = async (loginUuid: string): Promise<unknown> => {
  return Promise.resolve();
};

export const liveValidateOTP = async (
  otp: string,
  loginUuid: string
): Promise<SessionCredentials> => {
  const payload = { otp, loginUuid };
  try {
    const response = await fetchWithValidator(
      SessionCredentials,
      `${ENDPOINT}/logins/verify_and_login`,
      {
        method: "POST",
        headers: generateHeaders(),
        body: JSON.stringify(payload)
      }
    );
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      Sentry.captureException(e);
    }
    throw new LoginError(e.message);
  }
};

export const mockValidateOTP = async (
  _otp: string,
  _loginUuid: string
): Promise<SessionCredentials> => {
  return {
    sessionToken: "some-valid-session-token",
    ttl: new Date(2030, 0, 1)
  };
};

export const liveValidateLogin = async (
  branchCode: string,
  username: string
): Promise<SessionCredentials> => {
  const payload = { code: branchCode, name: username };
  try {
    const response = await fetchWithValidator(
      SessionCredentials,
      `${ENDPOINT}/logins/clicker_login`,
      {
        method: "POST",
        headers: generateHeaders(),
        body: JSON.stringify(payload)
      }
    );
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      Sentry.captureException(e);
    }
    throw new LoginError(e.message);
  }
};

export const mockValidateLogin = async (
  _branchCode: string,
  _username: string
): Promise<SessionCredentials> => {
  await new Promise(res => setTimeout(() => res("done"), 500));
  return {
    sessionToken: "some-valid-session-token",
    ttl: new Date(2030, 0, 1)
  };
};

export const mockUpdateUserClicker = async (
  _branchCode: string,
  _username: string,
  _sessionToken: string
): Promise<ClickerCredentials> => {
  await new Promise(res => setTimeout(() => res("done"), 500));
  return {
    clickerUuid: "some-clicker-uuid",
    username: "test-user"
  };
};
export const liveUpdateUserClicker = async (
  branchCode: string,
  username: string,
  sessionToken: string
): Promise<ClickerCredentials> => {
  const payload = { code: branchCode, name: username };
  try {
    const response = await fetchWithValidator(
      ClickerCredentials,
      `${ENDPOINT}/logins/update_user_login_clicker`,
      {
        method: "POST",
        headers: generateHeaders(sessionToken),
        body: JSON.stringify(payload)
      }
    );
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      Sentry.captureException(e);
    }
    throw new LoginError(e.message);
  }
};

export const loginRequest = IS_MOCK ? mockLoginRequest : liveLoginRequest;
export const requestOTP = IS_MOCK ? mockRequestOTP : liveRequestOTP;
export const validateOTP = IS_MOCK ? mockValidateOTP : liveValidateOTP;
export const validateLogin = IS_MOCK ? mockValidateLogin : liveValidateLogin;
export const updateUserClicker = IS_MOCK
  ? mockUpdateUserClicker
  : liveUpdateUserClicker;
