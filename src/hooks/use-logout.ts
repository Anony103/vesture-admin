// import {
//   SESSION_IDENTIFIER,
//   SESSION_STORAGE_KEY,
//   TAB_IDENTIFIER,
// } from "@/constants";
import {
  SESSION_STORAGE_KEY,
  TAB_IDENTIFIER,
  SESSION_IDENTIFIER,
} from "../constants";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = new QueryClient();

  const handleLogout = useCallback(async () => {
    try {
      const token = sessionStorage.getItem(SESSION_STORAGE_KEY) as string;
      if (!token) {
        return;
      }
      // The backend has no logout route (tokens simply expire after 24h), so signing out only
      // clears this browser's session.
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (err) {
        console.log({ err });
      } finally {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_IDENTIFIER);
        localStorage.removeItem(TAB_IDENTIFIER);
        sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_TEMP_AUTH_DATA`);
        navigate("/login", { replace: true });
        queryClient.clear();
      }
    } catch (err) {
      console.log({ err });
    }
  }, [navigate]);
  return { handleLogout };
};
