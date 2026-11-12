import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_PAYOUTS } from "@/constants/query-keys";
import { PayoutService } from "@/services/payout-service";
import { PayoutFilter, PayoutRow } from "@/types/payout-type";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

const usePayouts = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new PayoutService(token), [token]);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<PayoutFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<PayoutRow | null>(null);

  // The server searches, so wait for a pause in typing before asking it.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const changeFilter = (value: string) => {
    setFilter(value as PayoutFilter);
    setCurrentPage(1);
  };

  const {
    data: list,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: [GET_PAYOUTS, filter, search, currentPage, pageSize],
    queryFn: async () => (await service.getList(filter, search, currentPage - 1, pageSize))?.data,
    refetchOnWindowFocus: false,
    // payouts move on their own, so keep the list fresh while the page is open
    refetchInterval: 30_000,
  });

  const retry = useMutation({
    mutationFn: async (id: string) => (await service.retry(id))?.data,
    onSuccess: () => {
      toast.success("Sent back through. It carries on from the step it stopped at.");
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: [GET_PAYOUTS] });
    },
    onError: (error) => toast.error(messageOf(error, "Could not send it back through")),
  });

  return {
    filter,
    changeFilter,
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
    retry,
  };
};

export default usePayouts;
