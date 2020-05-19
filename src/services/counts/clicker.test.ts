import { updateCount, UpdateCountError } from "./index";
import * as Sentry from "sentry-expo";
import { GantryMode } from "../../context/config";

jest.mock("sentry-expo");
const mockCaptureException = jest.fn();
(Sentry.captureException as jest.Mock).mockImplementation(mockCaptureException);

const anyGlobal: any = global;
const mockFetch = jest.fn();
anyGlobal.fetch = mockFetch;

const updateCountParams = {
  clickerUuid: "clicker-uuid",
  username: "username",
  sessionToken: "session-token"
};

const mockUpdateEntryCountSuccess = {
  status: "success",
  message: "Successfully recorded entry",
  count: 10
};

const mockUpdateExitCountSuccess = {
  status: "success",
  message: "Successfully recorded exit",
  count: 10
};

describe("clicker", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCaptureException.mockReset();
  });

  describe("updateCount", () => {
    it("should return success result when entering premise", async () => {
      expect.assertions(3);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdateEntryCountSuccess)
      });
      const result = await updateCount({
        ...updateCountParams,
        id: "S0000001I",
        gantryMode: GantryMode.checkIn
      });
      expect(result).toStrictEqual(mockUpdateEntryCountSuccess);

      const payload = {
        clickerUuid: updateCountParams.clickerUuid,
        name: updateCountParams.username,
        bypassRestriction: false,
        id: "S0000001I"
      };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toMatch(/entries\/update_entry/);
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
    });

    it("should return success result when exiting premise", async () => {
      expect.assertions(3);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdateExitCountSuccess)
      });
      const result = await updateCount({
        ...updateCountParams,
        id: "S0000001I",
        gantryMode: GantryMode.checkOut
      });
      expect(result).toStrictEqual(mockUpdateExitCountSuccess);

      const payload = {
        clickerUuid: updateCountParams.clickerUuid,
        name: updateCountParams.username,
        bypassRestriction: false,
        id: "S0000001I"
      };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toMatch(/entries\/update_exit/);
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
    });

    it("should return success result when bypass restriction is set", async () => {
      expect.assertions(3);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdateEntryCountSuccess)
      });
      const result = await updateCount({
        ...updateCountParams,
        id: "S0000001I",
        bypassRestriction: true,
        gantryMode: GantryMode.checkIn
      });
      expect(result).toStrictEqual(mockUpdateEntryCountSuccess);

      const payload = {
        clickerUuid: updateCountParams.clickerUuid,
        name: updateCountParams.username,
        bypassRestriction: true,
        id: "S0000001I"
      };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toMatch(/entries\/update_entry/);
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
    });

    it("should return success result when CAN ID is used instead", async () => {
      expect.assertions(3);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdateEntryCountSuccess)
      });
      const result = await updateCount({
        ...updateCountParams,
        canId: "1001000200030004",
        gantryMode: GantryMode.checkIn
      });
      expect(result).toStrictEqual(mockUpdateEntryCountSuccess);

      const payload = {
        clickerUuid: updateCountParams.clickerUuid,
        name: updateCountParams.username,
        bypassRestriction: false,
        canId: "1001000200030004"
      };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toMatch(/entries\/update_entry/);
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
    });

    it("should return success result when CAN ID is used and bypass restriction is set", async () => {
      expect.assertions(3);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdateEntryCountSuccess)
      });
      const result = await updateCount({
        ...updateCountParams,
        canId: "1001000200030004",
        gantryMode: GantryMode.checkIn,
        bypassRestriction: true
      });
      expect(result).toStrictEqual(mockUpdateEntryCountSuccess);

      const payload = {
        clickerUuid: updateCountParams.clickerUuid,
        name: updateCountParams.username,
        bypassRestriction: true,
        canId: "1001000200030004"
      };
      const [calledEndpoint, properties] = mockFetch.mock.calls[0];
      expect(calledEndpoint).toMatch(/entries\/update_entry/);
      expect(properties).toHaveProperty("body", JSON.stringify(payload));
    });

    it("should throw error if ID is rejected", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "Visitor does not meet odd/even requirement"
          })
      });
      // TODO: Use a different error type so the caller can choose how to handle it
      await expect(
        updateCount({
          ...updateCountParams,
          id: "S0000001I",
          gantryMode: GantryMode.checkIn
        })
      ).rejects.toThrow(UpdateCountError);
    });

    it("should throw error if CAN ID is rejected", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "Visitor does not meet odd/even requirement"
          })
      });
      // TODO: Use a different error type so the caller can choose how to handle it
      await expect(
        updateCount({
          ...updateCountParams,
          canId: "1001000200030004",
          gantryMode: GantryMode.checkIn
        })
      ).rejects.toThrow(UpdateCountError);
    });

    it("should throw error if CAN ID is not registered", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "CAN ID is not registered"
          })
      });
      // TODO: Use a different error type so the caller can choose how to handle it
      await expect(
        updateCount({
          ...updateCountParams,
          canId: "1001000200030004",
          gantryMode: GantryMode.checkIn
        })
      ).rejects.toThrow(UpdateCountError);
    });

    it("should throw error if update count failed", async () => {
      expect.assertions(1);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "Failed to record entry. Please try again!"
          })
      });
      // TODO: Use a different error type so the caller can choose how to handle it
      await expect(
        updateCount({
          ...updateCountParams,
          canId: "1001000200030004",
          gantryMode: GantryMode.checkIn
        })
      ).rejects.toThrow(UpdateCountError);
    });

    it("should throw error and capture it through sentry if result is malformed", async () => {
      expect.assertions(2);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "unknown-status"
          })
      });
      await expect(
        updateCount({
          ...updateCountParams,
          canId: "1001000200030004",
          gantryMode: GantryMode.checkIn
        })
      ).rejects.toThrow(UpdateCountError);
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });
  });
});
