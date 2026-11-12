import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_WEBHOOK_LOG, GET_WEBHOOK_LOGS } from "@/constants/query-keys";
import { WebhookLogService } from "@/services/webhook-log-service";
import { WebhookAppFilter, WebhookFilter } from "@/types/webhook-type";

const useWebhookLogs = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new WebhookLogService(token), [token]);

  const [filter, setFilter] = useState<WebhookFilter>("ALL");
  const [app, setApp] = useState<WebhookAppFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The server searches, so wait for a pause in typing before asking it.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const changeFilter = (value: string) => {
    setFilter(value as WebhookFilter);
    setCurrentPage(1);
  };

  const changeApp = (value: string) => {
    setApp(value as WebhookAppFilter);
    setCurrentPage(1);
  };

  const {
    data: list,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: [GET_WEBHOOK_LOGS, filter, app, search, currentPage, pageSize],
    queryFn: async () => (await service.getList(filter, app, search, currentPage - 1, pageSize))?.data,
    refetchOnWindowFocus: false,
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: [GET_WEBHOOK_LOG, selectedId],
    queryFn: async () => (await service.getOne(selectedId as string))?.data,
    enabled: !!selectedId,
    refetchOnWindowFocus: false,
  });

  return {
    filter,
    changeFilter,
    app,
    changeApp,
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
    selectedId,
    setSelectedId,
    detail,
    detailLoading,
  };
};

export default useWebhookLogs;
