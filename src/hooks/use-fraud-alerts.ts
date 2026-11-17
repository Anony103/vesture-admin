import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_FRAUD_ALERTS, GET_FRAUD_SETTINGS } from "@/constants/query-keys";
import { FraudService } from "@/services/fraud-service";
import { FraudAlert, FraudSeverityFilter, FraudStatusFilter } from "@/types/fraud-type";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

const useFraudAlerts = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new FraudService(token), [token]);
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<FraudStatusFilter>("OPEN");
  const [severity, setSeverity] = useState<FraudSeverityFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<FraudAlert | null>(null);
  const [note, setNote] = useState("");
  const [resolveError, setResolveError] = useState<string | null>(null);

  // The server searches, so wait for a pause in typing before asking it.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const changeStatus = (value: string) => {
    setStatus(value as FraudStatusFilter);
    setCurrentPage(1);
  };
  const changeSeverity = (value: string) => {
    setSeverity(value as FraudSeverityFilter);
    setCurrentPage(1);
  };

  const {
    data: list,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: [GET_FRAUD_ALERTS, status, severity, search, currentPage, pageSize],
    queryFn: async () => (await service.getList(status, severity, search, currentPage - 1, pageSize))?.data,
    refetchOnWindowFocus: false,
  });

  const { data: settings } = useQuery({
    queryKey: [GET_FRAUD_SETTINGS],
    queryFn: async () => (await service.getSettings())?.data,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const open = (alert: FraudAlert) => {
    setSelected(alert);
    setNote(alert.reviewNote ?? "");
    setResolveError(null);
  };
  const close = () => setSelected(null);

  const resolve = useMutation({
    mutationFn: async (decision: "DISMISS" | "CONFIRM") => (await service.resolve((selected as FraudAlert).id, decision, note))?.data,
    onSuccess: () => {
      setSelected(null);
      setResolveError(null);
      void queryClient.invalidateQueries({ queryKey: [GET_FRAUD_ALERTS] });
    },
    onError: (error) => setResolveError(messageOf(error, "Could not save that decision")),
  });

  return {
    status,
    changeStatus,
    severity,
    changeSeverity,
    searchInput,
    setSearchInput,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    list,
    listLoading,
    listError: listError as Error | null,
    refetchList,
    settings,
    selected,
    open,
    close,
    note,
    setNote,
    resolve: (decision: "DISMISS" | "CONFIRM") => resolve.mutate(decision),
    resolving: resolve.isPending,
    resolveError,
  };
};

export default useFraudAlerts;
