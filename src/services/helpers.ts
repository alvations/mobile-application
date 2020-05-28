import { fold } from "fp-ts/lib/Either";
import { Type } from "io-ts";
import { reporter } from "io-ts-reporters";
import { APIErrorProps } from "../types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class APIError extends Error {
  /** Type of API error */
  type: string;

  /** Human readable error message. Same as Error.message */
  title: string;

  /** Returns "APIError" */
  name: string;

  constructor(props: APIErrorProps) {
    super(props.title);
    this.name = "APIError";
    this.type = props.type;
    this.title = props.title;
  }
}

export async function fetchWithValidator<T, O, I>(
  validator: Type<T, O, I>,
  requestInfo: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(requestInfo, init);

  const json = await response.json();

  if (!response.ok) {
    const errorDecoded = APIErrorProps.decode(json);
    fold(
      () => {
        // Error does not have the correct type
        throw new ValidationError(reporter(errorDecoded).join(" "));
      },
      (errorProps: APIErrorProps) => {
        // Error type is valid
        throw new APIError(errorProps);
      }
    )(errorDecoded);
  }

  const decoded = validator.decode(json);
  return fold(
    () => {
      throw new ValidationError(reporter(decoded).join(" "));
    },
    (value: T) => value
  )(decoded);
}
