import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_WAITLIST } from "@/constants/query-keys";
import { WaitlistService } from "@/services/waitlist-service";

const useWaitlist = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new WaitlistService(token), [token]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // The server searches, so wait for a pause in typing before asking it.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const {
    data: list,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: [GET_WAITLIST, search, currentPage, pageSize],
    queryFn: async () => (await service.getList(search, currentPage - 1, pageSize))?.data,
    refetchOnWindowFocus: false,
  });

  /** Everyone on the list, for the CSV; null when it could not be fetched. */
  const fetchAll = async () => {
    setExporting(true);
    setExportError(null);
    try {
      return (await service.exportAll())?.data ?? [];
    } catch {
      setExportError("Could not download the list. Please try again.");
      return null;
    } finally {
      setExporting(false);
    }
  };

  return {
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
    exporting,
    exportError,
    fetchAll,
  };
};

export default useWaitlist;
