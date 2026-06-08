import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ManageSavingsService } from "@/services/manage-savings-service";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_RUNNING_INVESTMENTS, GET_INTEREST_PAYMENTS } from "@/constants/query-keys";

const useFinance = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const financeService = new ManageSavingsService(token);

  const [investmentsPage, setInvestmentsPage] = useState(1);
  const [investmentsPageSize, setInvestmentsPageSize] = useState(20);
  const [interestPage, setInterestPage] = useState(1);
  const [interestPageSize, setInterestPageSize] = useState(20);

  const {
    data: runningInvestmentsData,
    isLoading: runningInvestmentsLoading,
    error: runningInvestmentsError,
  } = useQuery({
    queryKey: [GET_RUNNING_INVESTMENTS, investmentsPage, investmentsPageSize],
    queryFn: () => financeService.getRunningInvestments(investmentsPage, investmentsPageSize),
  });

  const {
    data: interestPaymentsData,
    isLoading: interestPaymentsLoading,
    error: interestPaymentsError,
  } = useQuery({
    queryKey: [GET_INTEREST_PAYMENTS, interestPage, interestPageSize],
    queryFn: () => financeService.getInterestPayments(interestPage, interestPageSize),
  });

  const investments: Record<string, unknown>[] = runningInvestmentsData?.data?.investments ?? [];
  const investmentsSummary = {
    totalCount: runningInvestmentsData?.data?.totalCount ?? 0,
    totalPrincipal: runningInvestmentsData?.data?.totalPrincipal ?? 0,
    totalAccruedInterest: runningInvestmentsData?.data?.totalAccruedInterest ?? 0,
    totalWithholdingTax: runningInvestmentsData?.data?.totalWithholdingTax ?? 0,
    totalLiability: runningInvestmentsData?.data?.totalLiability ?? 0,
  };

  const interestPayments: Record<string, unknown>[] =
    interestPaymentsData?.data?.content ?? interestPaymentsData?.data ?? [];
  const interestTotalPages =
    interestPaymentsData?.data?.totalPages ?? 1;

  return {
    investments,
    investmentsSummary,
    runningInvestmentsLoading,
    runningInvestmentsError,
    investmentsPage,
    setInvestmentsPage,
    investmentsPageSize,
    setInvestmentsPageSize,

    interestPayments,
    interestTotalPages,
    interestPaymentsLoading,
    interestPaymentsError,
    interestPage,
    setInterestPage,
    interestPageSize,
    setInterestPageSize,
  };
};

export default useFinance;
