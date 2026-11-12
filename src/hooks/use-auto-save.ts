import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_AUTO_SAVE, GET_AUTO_SAVE_DEBITS } from "@/constants/query-keys";
import { AutoSaveService } from "@/services/auto-save-service";
import { AutoSaveFilter, AutoSaveRow, AutoSaveType } from "@/types/auto-save-type";

const useAutoSave = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new AutoSaveService(token), [token]);

  const [filter, setFilter] = useState<AutoSaveFilter>("ALL");
  const [type, setType] = useState<AutoSaveType>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<AutoSaveRow | null>(null);

  // The server searches, so wait for a pause in typing before asking it.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const changeFilter = (value: string) => {
    setFilter(value as AutoSaveFilter);
    setCurrentPage(1);
  };
  const changeType = (value: string) => {
    setType(value as AutoSaveType);
    setCurrentPage(1);
  };

  const {
    data: list,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: [GET_AUTO_SAVE, filter, type, search, currentPage, pageSize],
    queryFn: async () => (await service.getList(filter, type, search, currentPage - 1, pageSize))?.data,
    refetchOnWindowFocus: false,
  });

  const { data: debits, isLoading: debitsLoading } = useQuery({
    queryKey: [GET_AUTO_SAVE_DEBITS, selected?.planId],
    queryFn: async () => (await service.getDebits(selected?.planId as string))?.data,
    enabled: !!selected,
    refetchOnWindowFocus: false,
  });

  return {
    filter,
    changeFilter,
    type,
    changeType,
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
    selected,
    setSelected,
    debits,
    debitsLoading,
  };
};

export default useAutoSave;
