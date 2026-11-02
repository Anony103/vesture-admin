import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_KYC_DETAIL, GET_KYC_LIST } from "@/constants/query-keys";
import { CustomerStatusChange } from "@/types/general-type";
import { KycService } from "@/services/kyc-service";
import { KycFilter, KycStepName } from "@/types/kyc-type";

const useKyc = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new KycService(token), [token]);

  const [filter, setFilter] = useState<KycFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // The server searches, so wait for a pause in typing before asking it.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const changeFilter = (value: string) => {
    setFilter(value as KycFilter);
    setCurrentPage(1);
  };

  const {
    data: list,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: [GET_KYC_LIST, filter, search, currentPage, pageSize],
    queryFn: async () => (await service.getList(filter, search, currentPage - 1, pageSize))?.data,
    refetchOnWindowFocus: false,
  });

  const {
    data: detail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: [GET_KYC_DETAIL, selectedId],
    queryFn: async () => (await service.getDetail(selectedId as string))?.data,
    enabled: !!selectedId,
    refetchOnWindowFocus: false,
  });

  const [statusHistory, setStatusHistory] = useState<CustomerStatusChange[]>([]);
  // deactivation and reactivation history of the customer being looked at
  const loadStatusHistory = async (userId: string) => {
    try {
      const response = await service.getCustomerStatusHistory(userId);
      setStatusHistory(response?.data ?? []);
    } catch {
      setStatusHistory([]);
    }
  };
  useEffect(() => {
    setStatusHistory([]);
    if (selectedId) void loadStatusHistory(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "An error occurred");
    } else {
      toast.error("An unexpected error occurred");
    }
  };

  const refreshAll = () => {
    refetchList();
    if (selectedId) refetchDetail();
  };

  /** Returns true when the server accepted it, so the form can close. */
  const resetAttempts = async (step: KycStepName, reason: string) => {
    if (!selectedId) return false;
    setActionLoading(`reset-${step}`);
    try {
      const response = await service.resetAttempts(selectedId, step, reason);
      toast.success(response?.message || "Attempts cleared");
      refreshAll();
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const review = async (step: KycStepName, decision: "APPROVE" | "REJECT", reason: string, addressOnBill?: string) => {
    if (!selectedId) return false;
    setActionLoading(`review-${step}`);
    try {
      const response = await service.review(selectedId, step, decision, reason, addressOnBill);
      toast.success(response?.message || (decision === "APPROVE" ? "Approved" : "Rejected"));
      refreshAll();
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  /** Deactivate or reactivate the customer being looked at. Returns true when the server accepted it, so the form can close. */
  const changeCustomerStatus = async (activate: boolean, reason: string) => {
    if (!selectedId) return false;
    setActionLoading("customer-status");
    try {
      const response = activate
        ? await service.reactivateCustomer(selectedId, reason)
        : await service.deactivateCustomer(selectedId, reason);
      toast.success(response?.message || (activate ? "Customer reactivated" : "Customer deactivated"));
      refreshAll();
      void loadStatusHistory(selectedId);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  /** The full BVN, or null when it could not be fetched. The server records who asked. */
  const revealBvn = async () => {
    if (!selectedId) return null;
    try {
      const response = await service.revealBvn(selectedId);
      return response?.data?.bvn ?? null;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const retryBankOne = async (tier: 2 | 3) => {
    if (!selectedId) return;
    setActionLoading(`bankone-${tier}`);
    try {
      const response = await service.retryBankOne(selectedId, tier);
      const passed = (response?.data as { passed?: boolean } | undefined)?.passed;
      if (passed) toast.success(response?.message || `Tier ${tier} confirmed`);
      else toast.warn(response?.message || `Tier ${tier} upgrade did not complete`);
      refreshAll();
    } catch (error) {
      handleError(error);
    } finally {
      setActionLoading(null);
    }
  };

  return {
    service,
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
    listError: (listError as Error | null) ?? null,
    refetchList,
    selectedId,
    setSelectedId,
    detail,
    detailLoading,
    actionLoading,
    resetAttempts,
    review,
    revealBvn,
    changeCustomerStatus,
    statusHistory,
    retryBankOne,
  };
};

export default useKyc;
