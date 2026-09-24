import type { AuthentikGroup, AuthentikUser, AuthentikApiError } from "./types";

export interface AuthentikClientConfig {
  baseUrl: string;
  token: string;
}

interface ListResponse<T> {
  pagination: {
    next: number;
    previous: number;
    count: number;
    current: number;
    total_pages: number;
  };
  results: T[];
}

export class AuthentikClient {
  private baseUrl: string;
  private token: string;

  constructor(config: AuthentikClientConfig) {
    // strip trailing slash
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const errBody = (await res.json()) as AuthentikApiError;
        detail =
          typeof errBody === "string"
            ? errBody
            : errBody.detail
              ? errBody.detail
              : JSON.stringify(errBody);
      } catch {
        detail = await res.text().catch(() => "");
      }
      throw new Error(
        `authentik API ${method} ${path} failed (${res.status}): ${detail || res.statusText}`,
      );
    }

    // 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  }

  async findUserByUsername(username: string): Promise<AuthentikUser | null> {
    const data = await this.request<ListResponse<AuthentikUser>>(
      "GET",
      `/api/v3/core/users/?username=${encodeURIComponent(username)}`,
    );
    const match = data.results.find((u) => u.username === username);
    return match ?? null;
  }

  async createUser(payload: {
    username: string;
    name: string;
    is_active: boolean;
    path: string;
    groups: string[];
    attributes: Record<string, unknown>;
  }): Promise<AuthentikUser> {
    return this.request<AuthentikUser>("POST", "/api/v3/core/users/", payload);
  }

  async updateUser(
    pk: number,
    payload: {
      name?: string;
      groups?: string[];
      attributes?: Record<string, unknown>;
      path?: string;
      is_active?: boolean;
    },
  ): Promise<AuthentikUser> {
    return this.request<AuthentikUser>(
      "PATCH",
      `/api/v3/core/users/${pk}/`,
      payload,
    );
  }

  async findGroupByName(name: string): Promise<AuthentikGroup | null> {
    const data = await this.request<ListResponse<AuthentikGroup>>(
      "GET",
      `/api/v3/core/groups/?name=${encodeURIComponent(name)}`,
    );
    const match = data.results.find(
      (g) => g.name.toLowerCase() === name.toLowerCase(),
    );
    return match ?? null;
  }
}