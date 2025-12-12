"use client";

import { authClient } from "@/lib/authClient";
import React from "react";
import { AdminApiKeyCreateButton } from "@/components/admin/apikey/AdminApiKeyCreateButton";
import { AdminApiKeyTable } from "@/components/admin/apikey/AdminApiKeyTable";

export type ApiKey = {
  permissions: {
    [key: string]: string[];
  } | null;
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  userId: string;
  refillInterval: number | null;
  refillAmount: number | null;
  lastRefillAt: Date | null;
  enabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitTimeWindow: number | null;
  rateLimitMax: number | null;
  requestCount: number;
  remaining: number | null;
  lastRequest: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
};

const ApiKeysPage = () => {
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);

  React.useEffect(() => {
    authClient.apiKey.list().then((res) => {
      if (res.error) {
        throw new Error(res.error.message);
      }

      setApiKeys(res.data);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <AdminApiKeyCreateButton
        onNewApiKey={(apiKey) => setApiKeys((old) => [...old, apiKey])}
      />
      <AdminApiKeyTable
        apiKeys={apiKeys}
        onRemoveApiKey={(keyId) => setApiKeys((old) => old.filter((k) => k.id !== keyId))}
      />
    </div>
  );
};

export default ApiKeysPage;
