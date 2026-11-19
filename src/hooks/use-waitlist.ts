import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_WAITLIST, GET_WEB_TESTERS } from "@/constants/query-keys";
import { WaitlistService } from "@/services/waitlist-service";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

const useWaitlist = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new WaitlistService(token), [token]);

  const queryClient = useQueryClient();
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

  // which row an invite or withdrawal is in progress for
  const [busyId, setBusyId] = useState<string | null>(null);
  const refreshAfterInvite = () => {
    void queryClient.invalidateQueries({ queryKey: [GET_WAITLIST] });
    void queryClient.invalidateQueries({ queryKey: [GET_WEB_TESTERS] });
  };

  const invite = useMutation({
    mutationFn: async (id: string) => {
      setBusyId(id);
      return await service.invite(id);
    },
    onSuccess: (response) => {
      // invited either way; the message says whether the email went
      if (response?.data?.emailSent) toast.success(response.message);
      else toast.warning(response?.message ?? "Invited, but the email could not be sent.");
      refreshAfterInvite();
    },
    onError: (error) => toast.error(messageOf(error, "Could not invite this person")),
    onSettled: () => setBusyId(null),
  });

  const withdrawInvite = useMutation({
    mutationFn: async (id: string) => {
      setBusyId(id);
      return await service.withdrawInvite(id);
    },
    onSuccess: () => {
      toast.success("Invite withdrawn");
      refreshAfterInvite();
    },
    onError: (error) => toast.error(messageOf(error, "Could not withdraw the invite")),
    onSettled: () => setBusyId(null),
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
    invite: (id: string) => invite.mutate(id),
    withdrawInvite: (id: string) => withdrawInvite.mutate(id),
    busyId,
  };
};

export default useWaitlist;
