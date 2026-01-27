import {
  AccessToken,
  ClientCredentials,
  ClientCredentialTokenConfig,
} from "simple-oauth2";
import { getEnvOrThrow } from "../env";
import { createFetch, createSchema } from "@better-fetch/fetch";

import listItemSold from "./endpoints/listItemsSold";
import { sendDiscordNotification } from "../discord";

class Helloasso {
  // OAuth2 client
  private client = new ClientCredentials({
    client: {
      id: getEnvOrThrow("HELLOASSO_CLIENT_ID"),
      secret: getEnvOrThrow("HELLOASSO_CLIENT_SECRET"),
    },
    auth: {
      tokenHost: "https://api.helloasso.com",
      tokenPath: "/oauth2/token",
    },
    options: {
      authorizationMethod: "body",
      bodyFormat: "form",
    },
  });

  // OAuth2 token configuration
  private tokenConfig: ClientCredentialTokenConfig = {};

  // OAuth2 token
  private token: AccessToken | undefined;

  // Get the current access token if it exists or refresh it if it expired / not defined
  private async getToken(): Promise<string | undefined> {
    if (this.token === undefined) {
      try {
        this.token = await this.client.getToken(this.tokenConfig);
      } catch (err) {
        console.error("Can't generate a new access token:", err);
        await sendDiscordNotification(
          "Can't generate a new access token",
          "See console for more details",
          "error",
        );
        return undefined;
      }
    } else if (this.token.expired()) {
      try {
        this.token = await this.token.refresh(this.tokenConfig);
      } catch (err) {
        console.error("Can't refresh access token:", err);
        await sendDiscordNotification(
          "Can't refresh access token",
          "See console for more details",
          "error",
        );
        return undefined;
      }
    }

    if (!("access_token" in this.token.token)) {
      console.error("Can't generate a new access token");
      return undefined;
    }

    return this.token.token["access_token"] as string | undefined;
  }

  // Fetch instance with baked in authentication and endpoint schemas
  public request = createFetch({
    baseURL: "https://api.helloasso.com/v5",
    auth: {
      type: "Bearer",
      token: async () => await this.getToken(),
    },
    schema: createSchema({
      // exhaustive list of endpoints
      ...listItemSold,
    }),
  });
}

const helloasso = new Helloasso();
export default helloasso;
