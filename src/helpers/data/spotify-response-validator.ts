import { DefaultResponseValidator } from "@spotify/web-api-ts-sdk";
import type { IValidateResponses } from "@spotify/web-api-ts-sdk";

export class SpotifyResponseError extends Error {
  readonly status: number;

  constructor(status: number, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "SpotifyResponseError";
    this.status = status;
  }
}

const defaultResponseValidator = new DefaultResponseValidator();

export const spotifyResponseValidator: IValidateResponses = {
  async validateResponse(response) {
    try {
      await defaultResponseValidator.validateResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Spotify request failed with status ${response.status}`;

      throw new SpotifyResponseError(response.status, message, error);
    }
  },
};
