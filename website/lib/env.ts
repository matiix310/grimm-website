import { readFileSync, existsSync } from "fs";

/**
 * Retrieves an environment variable from process.env or a file (if _FILE suffix is supported).
 * @param key The environment variable key.
 * @param defaultValue Optional default value if not found.
 * @returns The value of the environment variable or the file content.
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  // 1. Check if the direct environment variable is set and not empty
  if (process.env[key]) {
    return process.env[key];
  }

  // 2. Check if a _FILE environment variable exists pointing to a secret file
  const fileKey = `${key}_FILE`;
  const filePath = process.env[fileKey];

  if (filePath) {
    if (existsSync(filePath)) {
      try {
        // Read file and trim whitespace (newlines often added by editors/k8s secrets)
        return readFileSync(filePath, "utf-8").trim();
      } catch (error) {
        console.error(`Error reading secret file for ${key} at ${filePath}:`, error);
        // Fallthrough to return undefined or defaultValue
      }
    } else {
      console.warn(`Secret file for ${key} specified at ${filePath} but does not exist.`);
    }
  }

  // 3. Return default value or undefined
  return defaultValue;
}

/**
 * Strict version of getEnv that throws if the value is missing.
 */
export function getEnvOrThrow(key: string): string {
  const value = getEnv(key);
  if (value === undefined) {
    throw new Error(`Missing required environment variable or secret file for: ${key}`);
  }
  return value;
}
