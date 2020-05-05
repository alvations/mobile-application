import { IS_MOCK } from "../../config";
import { CreateTransactionResult } from "../../types";
import { GantryMode } from "../../context/config";
import { fetchWithValidator, ValidationError } from "../helpers";

export class CreateTransactionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreateTransactionError";
  }
}

interface CreateTransaction {
  id: string;
  branchCode: string;
  username: string;
  gantryMode: GantryMode;
}

export const mockCreateTransaction = async ({
  id,
  branchCode,
  username,
  gantryMode
}: CreateTransaction): Promise<CreateTransactionResult> => {
  switch (gantryMode) {
    case GantryMode.checkOut:
      return {
        status: "success",
        message: "Successfully recorded exit",
        count: 10
      };
    case GantryMode.checkIn:
    default:
      return {
        status: "success",
        message: "Successfully recorded entry",
        count: 10
      };
  }
};

export const liveCreateTransaction = async ({
  id,
  branchCode,
  username,
  gantryMode
}: CreateTransaction): Promise<CreateTransactionResult> => {
  try {
    const response = await fetchWithValidator(
      CreateTransactionResult,
      `ENDPOINT`,
      {
        method: "POST",
        // headers: {
        //   Authorization: key
        // },
        body: JSON.stringify({
          id,
          branchCode,
          username,
          gantryMode
        })
      }
    );
    return response;
  } catch (e) {
    if (e instanceof ValidationError) {
      // Sentry.captureException(e);
    }
    throw new CreateTransactionError(e.message);
  }
};

export const createTransaction = IS_MOCK
  ? mockCreateTransaction
  : liveCreateTransaction;
