import { ClientCredentials } from "simple-oauth2";
import { getEnvOrThrow } from "./env";

// Get an access token
async function getAccessToken() {
  try {
    // Create the client credentials instance
    const client = new ClientCredentials({
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

    const token = await client.getToken({});
    return token.token;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error getting access token:", error.message);
  }
}

// Get a list of participants
export async function getParticipants(eventSlug: string) {
  const token = await getAccessToken();

  if (token === undefined) {
    return [];
  }

  const participants = [];

  try {
    let pageIndex = 1;
    while (pageIndex > 0) {
      const url = `https://api.helloasso.com/v5/organizations/bde-epita/forms/Event/${eventSlug}/items?pageIndex=${pageIndex}&pageSize=100&withDetails=true&withCount=false`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: "Bearer " + token.access_token,
        },
      };

      const res = await fetch(url, options);

      const data = await res.json();
      if (data.data?.length === 0) pageIndex = -1;
      else {
        participants.push(...data.data);
        pageIndex++;
      }
    }
    return participants;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    console.error("Error getting participants:", error.message);
  }
}
