/**
 * Server-side environment configuration
 * These values are read at runtime from process.env (Cloud Run)
 * and passed to the client via the root loader
 */

export function getEnv() {
  return {
    API_URL: process.env.API_URL || process.env.VITE_API_URL || "http://localhost:3000",
  };
}

export type Env = ReturnType<typeof getEnv>;
