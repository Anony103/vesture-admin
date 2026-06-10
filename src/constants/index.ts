export const SESSION_STORAGE_KEY = "b4b526c2-8cb0-40c7-a555-6859cb72888c";
export const TAB_IDENTIFIER = "6d94fe7c-aa62-49a2-b89b-2b0b2b497f44"
export const SESSION_IDENTIFIER = "fbc3945c-b9ec-4cb9-9f95-0bfd8f1e403d"

 export const USERS_INFO = "USERINFO" 
export {
  GET_ALL_ACCOUNTS,
  GET_ALL_SALES_PERSONS,
  GET_RECENT_TRANSACTIONS,
  GET_ALL_TRANSACTIONS,
  GET_ALL_OUTWARD,
  GET_ALL_SESSIONS,
} from "./query-keys";
export const ALERT_TYPE_OPTIONS = {
  DEBIT: "DEBIT",
  CREDIT: "CREDIT",
  DEBIT_AND_CREDIT: "CREDIT & DEBIT",
};
const environment = import.meta?.env?.VITE_APP_ENVIRONMENT ?? "TEST";
console.log("[PayRise Admin] Environment:", environment);
const baseUrls: Record<string, string> = {
  TEST: (import.meta.env.VITE_APP_BASE_URL_TEST ?? "http://localhost:8082").replace(/\/$/, "") + "/",
  STAGING: (import.meta.env.VITE_APP_BASE_URL_STAGE ?? "https://stage-api.myvesture.co").replace(/\/$/, "") + "/",
  LIVE: (import.meta.env.VITE_APP_BASE_URL_LIVE ?? "https://stage-api.myvesture.co").replace(/\/$/, "") + "/",
  development: (import.meta.env.VITE_APP_BASE_URL_STAGE ?? "https://stage-api.myvesture.co").replace(/\/$/, "") + "/",
};

export const baseUrl = baseUrls[environment] || (import.meta.env.VITE_APP_BASE_URL_TEST || "http://localhost:8082").replace(/\/$/, "") + "/";
