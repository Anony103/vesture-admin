import { baseUrl } from "./index";

/**
 * Which environment this copy of the admin is, so nobody mistakes staging for live. It follows VITE_APP_ENVIRONMENT, the same setting that
 * picks the backend: development, TEST, STAGING or LIVE (TEST when it is not set). One safety rule: if the app is in fact talking to the
 * live API, it says LIVE whatever the setting says.
 */
export type EnvironmentKind = "TEST" | "DEVELOPMENT" | "STAGING" | "LIVE";

const setting = (import.meta.env.VITE_APP_ENVIRONMENT ?? "TEST").toString().trim().toUpperCase();

const host = (() => {
  try {
    return new URL(baseUrl).hostname.toLowerCase();
  } catch {
    return "";
  }
})();

const fromSetting: EnvironmentKind =
  setting === "LIVE" ? "LIVE" : setting === "STAGING" ? "STAGING" : setting === "DEVELOPMENT" ? "DEVELOPMENT" : "TEST";

const kind: EnvironmentKind = host === "api.myvesture.co" ? "LIVE" : fromSetting;

export const ENVIRONMENT = {
  kind,
  label: kind,
  host,
};

export const ENVIRONMENT_STYLES: Record<EnvironmentKind, string> = {
  TEST: "bg-gray-200 text-gray-700",
  DEVELOPMENT: "bg-blue-100 text-blue-800",
  STAGING: "bg-amber-100 text-amber-800 border border-amber-300",
  LIVE: "bg-red-600 text-white",
};
