import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { SESSION_STORAGE_KEY } from "@/constants";
import {
  GET_LMS_TRANSFERS,
  GET_LMS_TRANSFER_CONFIG,
  GET_LMS_TRANSFER_REPORT,
  GET_LMS_CONFIG_HISTORY,
  GET_PROVIDUS_BANKS,
  GET_BANKONE_BANKS,
} from "@/constants/query-keys";
import { LmsTransferService } from "@/services/lms-transfer-service";
import { LmsPaymentProvider, LmsTransferInstruction } from "@/types/table-type";

// Providers return bank list items in different shapes (NIP vs BankOne), so
// probe the likely key names when building a code -> name lookup.
const toBankNameMap = (
  banks: Record<string, unknown>[] | null | undefined
): Record<string, string> => {
  const map: Record<string, string> = {};
  (banks ?? []).forEach((bank) => {
    const code =
      bank?.bankCode ?? bank?.institutionCode ?? bank?.Code ?? bank?.code;
    const name =
      bank?.bankName ?? bank?.institutionName ?? bank?.Name ?? bank?.name;
    if (code && name) {
      map[String(code)] = String(name);
    }
  });
  return map;
};

const useLmsTransfers = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const lmsTransferService = new LmsTransferService(token);

  const [view, setView] = useState<"transfers" | "report">("transfers");
  const [transferStatusFilter, setTransferStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<LmsTransferInstruction | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);

  // config form state — one source account per provider row
  const [providusSourceAccount, setProvidusSourceAccount] = useState("");
  const [bankoneSourceAccount, setBankoneSourceAccount] = useState("");
  const [savingProvider, setSavingProvider] =
    useState<LmsPaymentProvider | null>(null);
  const [activatingProvider, setActivatingProvider] =
    useState<LmsPaymentProvider | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // report filters
  const [reportProvider, setReportProvider] = useState("");
  const [reportPeriod, setReportPeriod] = useState(""); // "" | DAILY | WEEKLY | CUSTOM
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportPageSize, setReportPageSize] = useState(10);

  const {
    data: allTransfers,
    isLoading: allTransfersLoading,
    error: allTransfersError,
    refetch: refetchTransfers,
  } = useQuery({
    queryKey: [GET_LMS_TRANSFERS, statusFilter, transferStatusFilter],
    queryFn: async () => {
      const response = await lmsTransferService.getAllTransfers(
        statusFilter || undefined,
        transferStatusFilter || undefined
      );
      return response?.data ?? [];
    },
  });

  const {
    data: configs,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: [GET_LMS_TRANSFER_CONFIG],
    queryFn: async () => {
      const response = await lmsTransferService.getConfig();
      return response?.data ?? [];
    },
  });

  const activeProvider =
    configs?.find((config) => config.active)?.provider ?? null;

  // keep the per-provider form inputs in sync with the backend rows
  useEffect(() => {
    if (!configs) return;
    const providus = configs.find((c) => c.provider === "PROVIDUS");
    const bankone = configs.find((c) => c.provider === "BANKONE");
    setProvidusSourceAccount(providus?.sourceAccount ?? "");
    setBankoneSourceAccount(bankone?.sourceAccount ?? "");
  }, [configs]);

  const {
    data: configHistory,
    isLoading: configHistoryLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: [GET_LMS_CONFIG_HISTORY],
    queryFn: async () => {
      const response = await lmsTransferService.getConfigHistory();
      return response?.data ?? [];
    },
    enabled: showHistory,
  });

  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useQuery({
    queryKey: [
      GET_LMS_TRANSFER_REPORT,
      reportProvider,
      reportPeriod,
      reportFrom,
      reportTo,
    ],
    queryFn: async () => {
      const custom = reportPeriod === "CUSTOM";
      const response = await lmsTransferService.getReport({
        provider: reportProvider || undefined,
        period: !custom && reportPeriod ? reportPeriod : undefined,
        from: custom && reportFrom ? `${reportFrom}T00:00:00` : undefined,
        to: custom && reportTo ? `${reportTo}T23:59:59` : undefined,
      });
      return response?.data ?? null;
    },
    enabled: view === "report",
  });

  // Bank lists change rarely; cache them for the session to avoid hammering
  // the NIP/BankOne gateways on every page visit.
  const { data: providusBankNames } = useQuery({
    queryKey: [GET_PROVIDUS_BANKS],
    queryFn: async () => {
      const response = await lmsTransferService.getProvidusBanks();
      return toBankNameMap(response?.data);
    },
    staleTime: Infinity,
    retry: 1,
  });

  const { data: bankoneBankNames } = useQuery({
    queryKey: [GET_BANKONE_BANKS],
    queryFn: async () => {
      const response = await lmsTransferService.getBankOneBanks();
      return toBankNameMap(response?.data);
    },
    staleTime: Infinity,
    retry: 1,
  });

  const handleError = (error: unknown) => {
    console.log(error);
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "An error occurred");
    } else {
      toast.error("An unexpected error occurred");
    }
  };

  const refetchConfigAndHistory = () => {
    refetchConfig();
    if (showHistory) refetchHistory();
  };

  const handleRetry = async (id: string) => {
    setActionLoadingId(id);
    try {
      const response = await lmsTransferService.retryTransfer(id);
      if (response?.code === 200) {
        toast.success(response.message || "Transfer retried");
        refetchTransfers();
      } else {
        toast.error(response?.message || "Retry failed");
      }
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResendWebhook = async (id: string) => {
    setActionLoadingId(id);
    try {
      const response = await lmsTransferService.resendWebhook(id);
      if (response?.code === 200) {
        toast.success(response.message || "Webhook resent");
        refetchTransfers();
      } else {
        toast.error(response?.message || "Resend failed");
      }
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTriggerReprocess = async () => {
    setTriggerLoading(true);
    try {
      const response = await lmsTransferService.triggerReprocess();
      if (response?.code === 200) {
        const result = response.data;
        toast.success(
          result
            ? `Reprocessed ${result.processed}: ${result.successful} successful, ${result.failed} failed`
            : response.message || "Reprocessing triggered"
        );
        refetchTransfers();
      } else {
        toast.error(response?.message || "Trigger failed");
      }
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleSaveSourceAccount = async (provider: LmsPaymentProvider) => {
    const sourceAccount =
      provider === "PROVIDUS" ? providusSourceAccount : bankoneSourceAccount;
    if (!sourceAccount.trim()) {
      toast.error("Enter a source account first");
      return;
    }
    setSavingProvider(provider);
    try {
      const response = await lmsTransferService.updateConfig({
        provider,
        sourceAccount: sourceAccount.trim(),
      });
      if (response?.code === 200) {
        toast.success(response.message || "Source account saved");
        refetchConfigAndHistory();
      } else {
        toast.error(response?.message || "Update failed");
      }
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setSavingProvider(null);
    }
  };

  const handleActivateProvider = async (provider: LmsPaymentProvider) => {
    setActivatingProvider(provider);
    try {
      const response = await lmsTransferService.activateProvider(provider);
      if (response?.code === 200) {
        toast.success(response.message || `${provider} activated`);
        refetchConfigAndHistory();
      } else {
        toast.error(response?.message || "Activation failed");
      }
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setActivatingProvider(null);
    }
  };

  return {
    view,
    setView,
    allTransfers,
    allTransfersLoading,
    allTransfersError,
    transferStatusFilter,
    setTransferStatusFilter,
    statusFilter,
    setStatusFilter,
    selectedRecord,
    setSelectedRecord,
    providusBankNames: providusBankNames ?? {},
    bankoneBankNames: bankoneBankNames ?? {},
    pageSize,
    setPageSize,
    handleRetry,
    handleResendWebhook,
    actionLoadingId,
    handleTriggerReprocess,
    triggerLoading,
    configs: configs ?? [],
    activeProvider,
    providusSourceAccount,
    setProvidusSourceAccount,
    bankoneSourceAccount,
    setBankoneSourceAccount,
    handleSaveSourceAccount,
    savingProvider,
    handleActivateProvider,
    activatingProvider,
    showHistory,
    setShowHistory,
    configHistory: configHistory ?? [],
    configHistoryLoading,
    report,
    reportLoading,
    reportError,
    reportProvider,
    setReportProvider,
    reportPeriod,
    setReportPeriod,
    reportFrom,
    setReportFrom,
    reportTo,
    setReportTo,
    reportPageSize,
    setReportPageSize,
  };
};

export default useLmsTransfers;
