import { describe, expect, it } from "vitest";

import { SpotifyResponseError, spotifyResponseValidator } from "./spotify-response-validator";

describe("Spotify response validator", () => {
  it("preserves the HTTP status on validation errors", async () => {
    const validation = spotifyResponseValidator.validateResponse(new Response(null, { status: 429 }));

    await expect(validation).rejects.toEqual(
      expect.objectContaining<Partial<SpotifyResponseError>>({
        status: 429,
      }),
    );
  });
});
