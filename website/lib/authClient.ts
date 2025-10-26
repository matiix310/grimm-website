import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  apiKeyClient,
  genericOAuthClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), genericOAuthClient(), apiKeyClient()],
});
