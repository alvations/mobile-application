import { IS_MOCK, ENDPOINT } from "../../config";
import { fetchWithValidator, ValidationError } from "../helpers";
import * as Sentry from "sentry-expo";
import * as t from "io-ts";

export class CepasRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CepasRegistrationError";
  }
}

export const mockRegisterCanId = async (
  canId: string,
  id: string,
  sessionToken: string
): Promise<unknown> => {
  await new Promise(res => setTimeout(() => res("done"), 1500));
  return Promise.resolve();
};

export const liveRegisterCanId = async (
  canId: string,
  id: string,
  sessionToken: string
): Promise<unknown> => {
  try {
    const payload = {
      canId,
      id
    };
    const headers = {
      CROWD_GO_WHERE_TOKEN: process.env.CLIENT_API_KEY ?? "",
      USER_SESSION_ID: sessionToken,
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    const response = await fetchWithValidator(
      t.unknown,
      `${ENDPOINT}/cepas-registration`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      }
    );
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      Sentry.captureException(e);
    }
    throw new CepasRegistrationError(e.message);
  }
};

export const registerCanId = IS_MOCK ? mockRegisterCanId : liveRegisterCanId;
