import { fold } from "fp-ts/lib/Either";
import { Type, TypeOf } from "io-ts";
import { reporter } from "io-ts-reporters";
import { JsonError } from "../types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class APIError extends Error {
  constructor(type: string, title: string) {
    super(title);
    this.name = type;
  }
}

export async function fetchWithValidator<T, O, I>(
  validator: Type<T, O, I>,
  requestInfo: RequestInfo,
  init?: RequestInit,
  errorValidator = JsonError
): Promise<T> {
  const response = await fetch(requestInfo, init);

  const json = await response.json();

  if (!response.ok) {
    const errorDecoded = errorValidator.decode(json);
    fold(
      () => {
        // Error does not have the correct type
        throw new ValidationError(reporter(errorDecoded).join(" "));
      },
      (value: TypeOf<typeof errorValidator>) => {
        // Error type is valid
        // TODO: populate error with the correct properties
        throw new APIError(json.type, json.title);
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
