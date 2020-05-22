import { renderHook } from "@testing-library/react-hooks";
import { useClickerCount } from "./useClickerCount";
import { updateCount } from "../../services/counts";
import { wait } from "@testing-library/react-native";
import { GantryMode } from "../../context/config";

jest.mock("../../services/counts");
const mockUpdateCount = updateCount as jest.Mock;

const sessionToken = "session-token";
const clickerUuid = "clicker-uuid";
const username = "username";
const canId = "1001000200030004";
const id = "S0000001I";
const gantryMode = GantryMode.checkIn;

const mockUpdateEntryCountSuccess = {
  status: "success",
  message: "Successfully recorded entry",
  count: 10
};

describe("useClickerCount", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("updateCount", () => {
    it("should complete the flow without errors when id is valid", async () => {
      expect.assertions(5);
      mockUpdateCount.mockResolvedValue(mockUpdateEntryCountSuccess);

      const { result } = renderHook(() =>
        useClickerCount(sessionToken, clickerUuid, username)
      );
      expect(result.current.updateCountState).toEqual("DEFAULT");

      await wait(() => {
        result.current.updateCount({ id, gantryMode });
        expect(result.current.updateCountState).toEqual("VALIDATING_ID");
      });

      expect(result.current.updateCountState).toEqual("RESULT_RETURNED");
      expect(result.current.updateCountResult).toStrictEqual({
        ...mockUpdateEntryCountSuccess,
        canId: undefined,
        id,
        gantryMode
      });
      expect(result.current.error).toBeUndefined();
    });

    it("should complete the flow without errors when CAN id is specified", async () => {
      expect.assertions(5);
      mockUpdateCount.mockResolvedValue(mockUpdateEntryCountSuccess);

      const { result } = renderHook(() =>
        useClickerCount(sessionToken, clickerUuid, username)
      );
      expect(result.current.updateCountState).toEqual("DEFAULT");

      await wait(() => {
        result.current.updateCount({ canId, gantryMode });
        expect(result.current.updateCountState).toEqual("UPDATING_COUNT");
      });

      expect(result.current.updateCountState).toEqual("RESULT_RETURNED");
      expect(result.current.updateCountResult).toStrictEqual({
        ...mockUpdateEntryCountSuccess,
        canId,
        id: undefined,
        gantryMode
      });
      expect(result.current.error).toBeUndefined();
    });

    it("should complete the flow without errors when bypassRestriction is set", async () => {
      expect.assertions(5);
      mockUpdateCount.mockResolvedValue(mockUpdateEntryCountSuccess);

      const { result } = renderHook(() =>
        useClickerCount(sessionToken, clickerUuid, username)
      );
      expect(result.current.updateCountState).toEqual("DEFAULT");

      await wait(() => {
        result.current.updateCount({
          id: "ANY-ID",
          gantryMode,
          bypassRestriction: true
        });
        expect(result.current.updateCountState).toEqual("UPDATING_COUNT");
      });

      expect(result.current.updateCountState).toEqual("RESULT_RETURNED");
      expect(result.current.updateCountResult).toStrictEqual({
        ...mockUpdateEntryCountSuccess,
        canId: undefined,
        id: "ANY-ID",
        gantryMode
      });
      expect(result.current.error).toBeUndefined();
    });

    it("should set error when given id is invalid", async () => {
      expect.assertions(5);

      const { result } = renderHook(() =>
        useClickerCount(sessionToken, clickerUuid, username)
      );
      expect(result.current.updateCountState).toEqual("DEFAULT");

      await wait(() => {
        result.current.updateCount({
          id: "ANY-ID",
          gantryMode
        });
        expect(result.current.updateCountState).toEqual("VALIDATING_ID");
      });

      expect(result.current.updateCountState).toEqual("VALIDATING_ID");
      expect(result.current.updateCountResult).toBeUndefined();
      expect(result.current.error).not.toBeUndefined();
    });

    it("should set error when given id is blank", async () => {
      expect.assertions(5);

      const { result } = renderHook(() =>
        useClickerCount(sessionToken, clickerUuid, username)
      );
      expect(result.current.updateCountState).toEqual("DEFAULT");

      await wait(() => {
        result.current.updateCount({
          id: "",
          gantryMode
        });
        expect(result.current.updateCountState).toEqual("DEFAULT");
      });

      expect(result.current.updateCountState).toEqual("DEFAULT");
      expect(result.current.updateCountResult).toBeUndefined();
      expect(result.current.error).not.toBeUndefined();
    });

    it("should set error when given CAN id is blank", async () => {
      expect.assertions(5);

      const { result } = renderHook(() =>
        useClickerCount(sessionToken, clickerUuid, username)
      );
      expect(result.current.updateCountState).toEqual("DEFAULT");

      await wait(() => {
        result.current.updateCount({
          canId: "",
          gantryMode
        });
        expect(result.current.updateCountState).toEqual("DEFAULT");
      });

      expect(result.current.updateCountState).toEqual("DEFAULT");
      expect(result.current.updateCountResult).toBeUndefined();
      expect(result.current.error).not.toBeUndefined();
    });

    it("should set error when updateCount service fails", async () => {
      expect.assertions(5);
      mockUpdateCount.mockRejectedValue(
        new Error("Visitor does not meet odd/even requirement")
      );

      const { result } = renderHook(() =>
        useClickerCount(sessionToken, clickerUuid, username)
      );
      expect(result.current.updateCountState).toEqual("DEFAULT");

      await wait(() => {
        result.current.updateCount({
          canId,
          gantryMode
        });
        expect(result.current.updateCountState).toEqual("UPDATING_COUNT");
      });

      expect(result.current.updateCountState).toEqual("UPDATING_COUNT");
      expect(result.current.updateCountResult).toBeUndefined();
      expect(result.current.error).not.toBeUndefined();
    });
  });
});
