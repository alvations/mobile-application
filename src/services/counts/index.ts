import { IS_MOCK, ENDPOINT } from "../../config";
import { UpdateCountResult, ClickerDetails } from "../../types";
import { GantryMode } from "../../context/config";
import { fetchWithValidator, ValidationError, APIError } from "../helpers";
import * as Sentry from "sentry-expo";

export class UpdateCountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpdateCountError";
  }
}

export class GetClickerDetailsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GetClickerDetailsError";
  }
}

interface UpdateCount {
  id: string;
  sessionToken: string;
  gantryMode: GantryMode;
  bypassRestriction: boolean;
}

const isEvenOrOdd = (n: number): "even" | "odd" =>
  n % 2 === 0 ? "even" : "odd";

export const mockUpdateCount = async ({
  id,
  sessionToken,
  gantryMode,
  bypassRestriction = false
}: UpdateCount): Promise<UpdateCountResult> => {
  await new Promise(res => setTimeout(() => res("done"), 1500));
  const dayOfMonth = new Date().getDate();
  if (
    !bypassRestriction &&
    isEvenOrOdd(Number(id.slice(-2)[0])) !== isEvenOrOdd(dayOfMonth)
  ) {
    return {
      status: "rejected",
      message: "Visitor does not meet odd/even requirement"
    };
  }
  switch (gantryMode) {
    case GantryMode.checkOut:
      return {
        status: "success",
        message: "Successfully recorded exit",
        count: 10
      };
    case GantryMode.checkIn:
      return {
        status: "success",
        message: "Successfully recorded entry",
        count: 10
      };
  }
};

export const liveUpdateCount = async ({
  id,
  sessionToken,
  gantryMode,
  bypassRestriction = false
}: UpdateCount): Promise<UpdateCountResult> => {
  try {
    const payload = {
      id: id,
      bypassRestriction: bypassRestriction
    };
    const cgwToken: string = process.env.CLIENT_API_KEY
      ? process.env.CLIENT_API_KEY
      : "";
    const headers: HeadersInit = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("USER_SESSION_ID", sessionToken);
    headers.set("Accept", "application/json");
    headers.set("CROWD_GO_WHERE_TOKEN", cgwToken);

    let fullEndpoint = `${ENDPOINT}/entries/`;
    switch (gantryMode) {
      case GantryMode.checkOut:
        fullEndpoint += "update_exit";
        break;
      case GantryMode.checkIn:
        fullEndpoint += "update_entry";
        break;
    }

    const response = await fetchWithValidator(UpdateCountResult, fullEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      Sentry.captureException(e);
    }
    throw new UpdateCountError(e.message);
  }
};

export const mockGetClickerDetails = async (
  _sessionToken: string
): Promise<ClickerDetails> => {
  await new Promise(res => setTimeout(() => res("done"), 1500));
  return {
    count: 10,
    name: "Clicker name"
  };
};

export const liveGetClickerDetails = async (
  sessionToken: string
): Promise<ClickerDetails> => {
  try {
    const cgwToken: string = process.env.CLIENT_API_KEY
      ? process.env.CLIENT_API_KEY
      : "";
    const headers: HeadersInit = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("USER_SESSION_ID", sessionToken);
    headers.set("Accept", "application/json");
    headers.set("CROWD_GO_WHERE_TOKEN", cgwToken);
    const fullEndpoint = `${ENDPOINT}/entries/retrieve_entries_info`;
    const response = await fetchWithValidator(
      ClickerDetails,
      encodeURI(fullEndpoint),
      {
        method: "GET",
        headers: headers
      }
    );
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      Sentry.captureException(e);
    } else if (e instanceof APIError) {
      Sentry.captureException(e);
      throw e;
    }
    throw new GetClickerDetailsError(e.message);
  }
};

export const updateCount = IS_MOCK ? mockUpdateCount : liveUpdateCount;
export const getClickerDetails = IS_MOCK
  ? mockGetClickerDetails
  : liveGetClickerDetails;
