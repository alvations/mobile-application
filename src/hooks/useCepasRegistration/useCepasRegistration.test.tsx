import { renderHook } from "@testing-library/react-hooks";
import { useCepasRegistration } from "./useCepasRegistration";
import { registerCanId } from "../../services/cepasRegistration";
import { wait } from "@testing-library/react-native";

jest.mock("../../services/cepasRegistration");
const mockRegisterCanId = registerCanId as jest.Mock;

const canId = "1001000200030004";
const id = "S0000001I";
const sessionToken = "session-token";

describe("useCepasRegistration", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("registerCanId", () => {
    it("should complete the flow without errors when id and CAN id are valid", async () => {
      expect.assertions(4);
      mockRegisterCanId.mockResolvedValue(true);

      const { result } = renderHook(() => useCepasRegistration(sessionToken));
      expect(result.current.registrationState).toEqual("DEFAULT");

      await wait(() => {
        result.current.registerCanId({ canId, id });
        expect(result.current.registrationState).toEqual("VALIDATING_ID");
      });

      expect(result.current.registrationState).toEqual("REGISTRATION_COMPLETE");
      expect(result.current.error).toBeUndefined();
    });

    it("should complete the flow without errors when bypassRestriction is set", async () => {
      expect.assertions(4);
      mockRegisterCanId.mockResolvedValue(true);

      const { result } = renderHook(() => useCepasRegistration(sessionToken));
      expect(result.current.registrationState).toEqual("DEFAULT");

      await wait(() => {
        result.current.registerCanId({
          canId,
          id: "ANY-ID",
          bypassRestriction: true
        });
        expect(result.current.registrationState).toEqual("REGISTERING_CAN_ID");
      });

      expect(result.current.registrationState).toEqual("REGISTRATION_COMPLETE");
      expect(result.current.error).toBeUndefined();
    });

    it("should set error when given id is invalid", async () => {
      expect.assertions(4);
      mockRegisterCanId.mockResolvedValue(true);

      const { result } = renderHook(() => useCepasRegistration(sessionToken));
      expect(result.current.registrationState).toEqual("DEFAULT");

      await wait(() => {
        result.current.registerCanId({ canId, id: "asd" });
        expect(result.current.registrationState).toEqual("VALIDATING_ID");
      });

      expect(result.current.registrationState).toEqual("VALIDATING_ID");
      expect(result.current.error).not.toBeUndefined();
    });

    it("should set error when given id is blank", async () => {
      expect.assertions(4);
      mockRegisterCanId.mockResolvedValue(true);

      const { result } = renderHook(() => useCepasRegistration(sessionToken));
      expect(result.current.registrationState).toEqual("DEFAULT");

      await wait(() => {
        result.current.registerCanId({ canId, id: "" });
        expect(result.current.registrationState).toEqual("VALIDATING_ID");
      });

      expect(result.current.registrationState).toEqual("VALIDATING_ID");
      expect(result.current.error).not.toBeUndefined();
    });

    it("should set error when given CAN id is blank", async () => {
      expect.assertions(4);
      mockRegisterCanId.mockResolvedValue(true);

      const { result } = renderHook(() => useCepasRegistration(sessionToken));
      expect(result.current.registrationState).toEqual("DEFAULT");

      await wait(() => {
        result.current.registerCanId({ canId: "", id });
        expect(result.current.registrationState).toEqual("VALIDATING_ID");
      });

      expect(result.current.registrationState).toEqual("VALIDATING_ID");
      expect(result.current.error).not.toBeUndefined();
    });

    it("should set error when registration fails", async () => {
      expect.assertions(4);
      mockRegisterCanId.mockRejectedValue(new Error("Already registered"));

      const { result } = renderHook(() => useCepasRegistration(sessionToken));
      expect(result.current.registrationState).toEqual("DEFAULT");

      await wait(() => {
        result.current.registerCanId({ canId, id });
        expect(result.current.registrationState).toEqual("VALIDATING_ID");
      });

      expect(result.current.registrationState).toEqual("REGISTERING_CAN_ID");
      expect(result.current.error).not.toBeUndefined();
    });
  });
});
