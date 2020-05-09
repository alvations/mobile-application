import { IS_MOCK } from "../../config";
import { UpdateCountResult, ClickerDetails } from "../../types";
import { GantryMode } from "../../context/config";
import { fetchWithValidator, ValidationError } from "../helpers";

const endpoint = process.env.DEV_ENDPOINT;

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
  clickerUuid: string;
  username: string;
  sessionToken: string;
  gantryMode: GantryMode;
  bypassRestriction: boolean;
}

const isEvenOrOdd = (n: number): "even" | "odd" =>
  n % 2 === 0 ? "even" : "odd";

export const mockUpdateCount = async ({
  id,
  clickerUuid,
  username,
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
  clickerUuid,
  username,
  sessionToken,
  gantryMode,
  bypassRestriction = false
}: UpdateCount): Promise<UpdateCountResult> => {
  try {
    const payload = {
      id: id,
      clickerUuid: clickerUuid,
      name: username,
      bypassRestriction: bypassRestriction
    };
    const headers = {
      CROWD_GO_WHERE_TOKEN: process.env.CLIENT_API_KEY,
      USER_SESSION_ID: sessionToken,
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    let fullEndpoint = `${endpoint}/entries/`;
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
      // Sentry.captureException(e);
    }
    throw new UpdateCountError(e.message);
  }
};

export const mockGetClickerDetails = async (
  _clickerUuid: string,
  _sessionToken: string
): Promise<ClickerDetails> => {
  return {
    count: 10,
    name: "Clicker name"
  };
};

export const liveGetClickerDetails = async (
  clickerUuid: string,
  sessionToken: string
): Promise<ClickerDetails> => {
  try {
    const headers = {
      CROWD_GO_WHERE_TOKEN: process.env.CLIENT_API_KEY,
      USER_SESSION_ID: sessionToken,
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    const fullEndpoint = `${endpoint}/entries/retrieve_entries_info?clickerUuid=${clickerUuid}`;
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
      // Sentry.captureException(e);
    }
    throw new GetClickerDetailsError(e.message);
  }
};

export const updateCount = IS_MOCK ? mockUpdateCount : liveUpdateCount;
export const getClickerDetails = IS_MOCK
  ? mockGetClickerDetails
  : liveGetClickerDetails;
