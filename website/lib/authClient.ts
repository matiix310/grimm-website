import { createAuthClient } from "better-auth/react";
import { adminClient, genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), genericOAuthClient()],
});
