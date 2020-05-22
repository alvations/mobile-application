import { registerCanId } from ".";
import * as Sentry from "sentry-expo";
import { ENDPOINT } from "../../config";

jest.mock("sentry-expo");
const mockCaptureException = jest.fn();
(Sentry.captureException as jest.Mock).mockImplementation(mockCaptureException);

const anyGlobal: any = global;
const mockFetch = jest.fn();
anyGlobal.fetch = mockFetch;

const canId = "1001000200030004";
const id = "S0000001I";
const sessionToken = "session-token";

describe("cepasRegistration", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("registerCanId", () => {
    it("should register the CAN id to id", async () => {
      expect.assertions(7);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve()
      });

      await registerCanId({ canId, id, sessionToken });
      const payload = { canId, id, bypassRestriction: false };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toStrictEqual(`${ENDPOINT}/cepas-registration`);
      expect(properties).toHaveProperty("method", "POST");
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
      expect(properties).toHaveProperty("headers");
      expect(properties.headers).toHaveProperty("Accept", "application/json");
      expect(properties.headers).toHaveProperty(
        "Content-Type",
        "application/json"
      );
      expect(properties.headers).toHaveProperty(
        "USER_SESSION_ID",
        sessionToken
      );
    });

    it("should return success result when bypass restriction is set and ID is valid", async () => {
      expect.assertions(7);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve()
      });

      await registerCanId({ canId, id, sessionToken, bypassRestriction: true });
      const payload = { canId, id, bypassRestriction: true };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toStrictEqual(`${ENDPOINT}/cepas-registration`);
      expect(properties).toHaveProperty("method", "POST");
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
      expect(properties).toHaveProperty("headers");
      expect(properties.headers).toHaveProperty("Accept", "application/json");
      expect(properties.headers).toHaveProperty(
        "Content-Type",
        "application/json"
      );
      expect(properties.headers).toHaveProperty(
        "USER_SESSION_ID",
        sessionToken
      );
    });

    it("should throw error if id validation failed", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "ID could not be validated"
          })
      });

      await expect(registerCanId({ canId, id, sessionToken })).rejects.toThrow(
        "ID could not be validated"
      );
    });

    it("should throw error if CAN id could not be registered", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "Cannot register another ID to this card"
          })
      });

      await expect(registerCanId({ canId, id, sessionToken })).rejects.toThrow(
        "Cannot register another ID to this card"
      );
    });

    it("should throw error if there were issues fetching", async () => {
      expect.assertions(1);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(registerCanId({ canId, id, sessionToken })).rejects.toThrow(
        "Network error"
      );
    });
  });
});
