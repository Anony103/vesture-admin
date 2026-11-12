import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_DEPOSIT_FEES } from "@/constants/query-keys";
import { DepositFeeService } from "@/services/deposit-fee-service";

const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD in the admin's own time zone (toISOString would shift it to UTC). */
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The longest period the server will report in one go. */
export const MAX_DAYS = 92;

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000);

/** What is wrong with a period, worded for the admin, or null when it is fine. */
export const periodProblem = (from: string, to: string) => {
  if (!from || !to) return "Choose both dates.";
  if (from > to) return "The start date is after the end date.";
  if (daysBetween(from, to) > MAX_DAYS) return `Choose at most ${MAX_DAYS} days at a time.`;
  return null;
};

const useDepositFees = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new DepositFeeService(token), [token]);

  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 29);
  const [from, setFrom] = useState(isoDay(start));
  const [to, setTo] = useState(isoDay(today));
  const problem = periodProblem(from, to);

  const query = useQuery({
    queryKey: [GET_DEPOSIT_FEES, from, to],
    queryFn: async () => (await service.getReport(from, to))?.data,
    enabled: !!token && !problem,
    refetchOnWindowFocus: false,
  });

  const serverMessage = axios.isAxiosError(query.error) ? query.error.response?.data?.message : null;

  return {
    from,
    setFrom,
    to,
    setTo,
    problem,
    report: query.data,
    loading: query.isLoading,
    error: query.error as Error | null,
    serverMessage: serverMessage as string | null,
    refetch: query.refetch,
  };
};

export default useDepositFees;
