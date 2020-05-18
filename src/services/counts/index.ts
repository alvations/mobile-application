import { IS_MOCK, ENDPOINT } from "../../config";
import { UpdateCountResult, ClickerDetails } from "../../types";
import { GantryMode } from "../../context/config";
import { fetchWithValidator, ValidationError } from "../helpers";
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
  id?: string;
  canId?: string;
  clickerUuid: string;
  username: string;
  sessionToken: string;
  gantryMode: GantryMode;
  bypassRestriction?: boolean;
}

const isEvenOrOdd = (n: number): "even" | "odd" =>
  n % 2 === 0 ? "even" : "odd";

const mockUpdateCount = async ({
  id,
  canId,
  clickerUuid,
  username,
  sessionToken,
  gantryMode,
  bypassRestriction = false
}: UpdateCount): Promise<UpdateCountResult> => {
  if (!id && !canId) {
    throw new UpdateCountError("Please specify either an ID or a CAN ID");
  }
  await new Promise(res => setTimeout(() => res("done"), 1500));
  const dayOfMonth = new Date().getDate();
  if (
    id &&
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

const liveUpdateCount = async ({
  id,
  canId,
  clickerUuid,
  username,
  sessionToken,
  gantryMode,
  bypassRestriction = false
}: UpdateCount): Promise<UpdateCountResult> => {
  if ((!id && !canId) || (id && canId)) {
    throw new UpdateCountError("Please specify either an ID or a CAN ID");
  }
  try {
    const payload: any = {
      clickerUuid: clickerUuid,
      name: username,
      bypassRestriction: bypassRestriction
    };

    if (id) {
      payload.id = id;
    } else {
      payload.canId = canId;
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("USER_SESSION_ID", sessionToken);
    headers.set("Accept", "application/json");
    headers.set("CROWD_GO_WHERE_TOKEN", process.env.CLIENT_API_KEY ?? "");

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
      headers,
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

const mockGetClickerDetails = async (
  _clickerUuid: string,
  _sessionToken: string
): Promise<ClickerDetails> => {
  await new Promise(res => setTimeout(() => res("done"), 1500));
  return {
    count: 10,
    name: "Clicker name"
  };
};

const liveGetClickerDetails = async (
  clickerUuid: string,
  sessionToken: string
): Promise<ClickerDetails> => {
  try {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("USER_SESSION_ID", sessionToken);
    headers.set("Accept", "application/json");
    headers.set("CROWD_GO_WHERE_TOKEN", process.env.CLIENT_API_KEY ?? "");

    const fullEndpoint = `${ENDPOINT}/entries/retrieve_entries_info?clickerUuid=${clickerUuid}`;
    const response = await fetchWithValidator(
      ClickerDetails,
      encodeURI(fullEndpoint),
      {
        method: "GET",
        headers
      }
    );
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      Sentry.captureException(e);
    }
    throw new GetClickerDetailsError(e.message);
  }
};

export const updateCount = IS_MOCK ? mockUpdateCount : liveUpdateCount;
export const getClickerDetails = IS_MOCK
  ? mockGetClickerDetails
  : liveGetClickerDetails;
