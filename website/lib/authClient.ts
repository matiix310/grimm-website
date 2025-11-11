import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  apiKeyClient,
  genericOAuthClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), genericOAuthClient(), apiKeyClient(), usernameClient()],
});
