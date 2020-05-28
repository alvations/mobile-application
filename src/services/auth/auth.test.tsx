import {
  requestOTP,
  LoginError,
  validateOTP,
  loginRequest,
  updateUserClicker
} from "./index";
import * as Sentry from "sentry-expo";
import { ENDPOINT } from "../../config";
import { APIError } from "../helpers";

jest.mock("sentry-expo");
const mockCaptureException = jest.fn();
(Sentry.captureException as jest.Mock).mockImplementation(mockCaptureException);

const anyGlobal: any = global;
const mockFetch = jest.fn();
anyGlobal.fetch = mockFetch;

const mobileNumber = "91234567";
const otp = "123456";
const ttl = new Date(2030, 0, 1);
const sessionToken = "0000-11111-22222-33333-44444";
const loginUuid = "some-valid-login-token";
const code = "87654321";
const name = "location-name";

describe("auth", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCaptureException.mockReset();
  });

  describe("loginRequest", () => {
    it("should return a login uuid", async () => {
      expect.assertions(6);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ loginUuid })
      });
      const credentials = await loginRequest(mobileNumber);
      expect(credentials).toEqual({ loginUuid });

      const payload = { mobileNumber };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toStrictEqual(`${ENDPOINT}/logins/user_login`);
      expect(properties).toHaveProperty("method", "POST");
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
      expect(properties).toHaveProperty("headers");
      const headers = properties.headers as Headers;
      expect(headers.get("CROWD_GO_WHERE_TOKEN")).toEqual(
        process.env.CLIENT_API_KEY
      );
    });

    it("should throw API error if error was returned", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            type: "invalid-mobile-number",
            title:
              "Please key in your 8 digit phone number without country code (Only +65 numbers supported)",
            error: "Bad Request"
          })
      });

      await expect(loginRequest(mobileNumber)).rejects.toThrow(APIError);
    });

    it("should throw error if returned success response is malformed", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            incorrectKey: loginUuid
          })
      });

      await expect(loginRequest(mobileNumber)).rejects.toThrow(LoginError);
    });

    it("should capture exception through sentry if response is malformed", async () => {
      expect.assertions(2);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            incorrectKey: loginUuid
          })
      });

      await expect(loginRequest(mobileNumber)).rejects.toThrow(LoginError);
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it("should throw error if there were issues fetching", async () => {
      expect.assertions(1);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(loginRequest(mobileNumber)).rejects.toThrow("Network error");
    });
  });

  describe("requestOTP", () => {
    it("should send request using the correct params", async () => {
      expect.assertions(5);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve()
      });
      await requestOTP(loginUuid);
      const payload = { loginUuid };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toStrictEqual(`${ENDPOINT}/logins/request_otp`);
      expect(properties).toHaveProperty("method", "POST");
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
      expect(properties).toHaveProperty("headers");
      const headers = properties.headers as Headers;
      expect(headers.get("CROWD_GO_WHERE_TOKEN")).toEqual(
        process.env.CLIENT_API_KEY
      );
    });

    it("should throw API error if error was returned", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            type: "request-otp-timeout",
            title:
              "You have recently requested for a new otp, please wait a few minutes before trying again.",
            error: "Bad Request"
          })
      });

      await expect(requestOTP(loginUuid)).rejects.toThrow(APIError);
    });

    it("should capture exception through sentry if response is malformed", async () => {
      expect.assertions(2);
      // request_otp does not return a body, so we use a malformed error response instead
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            incorrectKey: "incorrect-key"
          })
      });

      await expect(requestOTP(loginUuid)).rejects.toThrow(LoginError);
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it("should throw error if there were issues fetching", async () => {
      expect.assertions(1);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(requestOTP(loginUuid)).rejects.toThrow("Network error");
    });
  });

  describe("validateOTP", () => {
    it("should return the session credentials when OTP is validated", async () => {
      expect.assertions(6);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sessionToken, ttl: ttl.getTime() })
      });
      const credentials = await validateOTP(otp, loginUuid);
      expect(credentials).toEqual({ sessionToken, ttl });

      const payload = { otp, loginUuid };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toStrictEqual(
        `${ENDPOINT}/logins/verify_and_login`
      );
      expect(properties).toHaveProperty("method", "POST");
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
      expect(properties).toHaveProperty("headers");
      const headers = properties.headers as Headers;
      expect(headers.get("CROWD_GO_WHERE_TOKEN")).toEqual(
        process.env.CLIENT_API_KEY
      );
    });

    it("should throw API error if error was returned", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            type: "invalid-otp",
            title:
              "The OTP you have entered is not valid. Please try again or request a new OTP.",
            error: "Bad Request"
          })
      });

      await expect(validateOTP(otp, loginUuid)).rejects.toThrow(APIError);
    });

    it("should throw error if returned success response is malformed", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            incorrectKey: sessionToken,
            ttl: ttl.getTime()
          })
      });

      await expect(validateOTP(otp, loginUuid)).rejects.toThrow(LoginError);
    });

    it("should capture exception through sentry if response is malformed", async () => {
      expect.assertions(2);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            incorrectKey: sessionToken,
            ttl: ttl.getTime()
          })
      });

      await expect(validateOTP(otp, loginUuid)).rejects.toThrow(LoginError);
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it("should throw error if there were issues fetching", async () => {
      expect.assertions(1);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(validateOTP(otp, loginUuid)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("updateUserClicker", () => {
    it("should send request using the correct params", async () => {
      expect.assertions(5);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve()
      });
      await updateUserClicker(code, name, sessionToken);

      const payload = { code, name };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toStrictEqual(
        `${ENDPOINT}/logins/update_user_login_clicker`
      );
      expect(properties).toHaveProperty("method", "POST");
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
      expect(properties).toHaveProperty("headers");
      const headers = properties.headers as Headers;
      expect(headers.get("CROWD_GO_WHERE_TOKEN")).toEqual(
        process.env.CLIENT_API_KEY
      );
    });

    it("should throw API error if error was returned", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            type: "no-user-session",
            title: "Unable to find user session",
            error: "Bad Request"
          })
      });

      await expect(updateUserClicker(code, name, sessionToken)).rejects.toThrow(
        APIError
      );
    });

    it("should capture exception through sentry if response is malformed", async () => {
      expect.assertions(2);
      // updateUserClicker does not return a body, so we use a malformed error response instead
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            incorrectKey: "incorrect-key"
          })
      });

      await expect(updateUserClicker(code, name, sessionToken)).rejects.toThrow(
        LoginError
      );
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it("should throw error if there were issues fetching", async () => {
      expect.assertions(1);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(updateUserClicker(code, name, sessionToken)).rejects.toThrow(
        "Network error"
      );
    });
  });
});
