import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_STAGING_FUNDING_STATUS } from "@/constants/query-keys";
import { StagingFundingService } from "@/services/staging-funding-service";
import { StagingCustomer, StagingFundingResult } from "@/types/staging-funding-type";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

/**
 * Whether the staging test-funding page exists for this admin. The server answers "enabled: true" only on staging and only to a super
 * admin; anyone else (or production) gets enabled false or an error, and the page and its menu entry stay hidden.
 */
export const useStagingFundingStatus = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new StagingFundingService(token), [token]);
  const { data, isLoading } = useQuery({
    queryKey: [GET_STAGING_FUNDING_STATUS],
    queryFn: async () => (await service.getStatus())?.data,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
  return { enabled: data?.enabled === true, maxAmount: data?.maxAmount ?? null, isLoading };
};

const useStagingFunding = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new StagingFundingService(token), [token]);

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [customer, setCustomer] = useState<StagingCustomer | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [fundError, setFundError] = useState<string | null>(null);
  const [result, setResult] = useState<StagingFundingResult | null>(null);

  const lookup = useMutation({
    mutationFn: async (address: string) => (await service.getCustomer(address))?.data,
    onSuccess: (found) => {
      setCustomer(found ?? null);
      setLookupError(null);
    },
    onError: (error) => {
      setCustomer(null);
      setLookupError(messageOf(error, "Could not look that customer up"));
    },
  });

  const fund = useMutation({
    mutationFn: async () =>
      (
        await service.fund({
          email: (customer as StagingCustomer).email,
          amount: Number(amount),
          senderName: senderName.trim() || undefined,
        })
      )?.data,
    onSuccess: (done) => {
      setResult(done ?? null);
      setFundError(null);
      // show the new balance and whether the plan transfer request is gone
      if (customer) lookup.mutate(customer.email);
    },
    onError: (error) => {
      setResult(null);
      setFundError(messageOf(error, "The funding failed"));
    },
  });

  const findCustomer = () => {
    setResult(null);
    setFundError(null);
    if (email.trim()) lookup.mutate(email.trim());
  };

  const changeEmail = (value: string) => {
    setEmail(value);
    // a different address is a different customer: forget the one found
    setCustomer(null);
    setResult(null);
  };

  const parsed = Number(amount);
  const canFund = !!customer && amount.trim() !== "" && Number.isFinite(parsed) && parsed > 0 && !fund.isPending;

  return {
    email,
    changeEmail,
    amount,
    setAmount,
    senderName,
    setSenderName,
    customer,
    findCustomer,
    finding: lookup.isPending,
    lookupError,
    fund: () => fund.mutate(),
    funding: fund.isPending,
    fundError,
    result,
    canFund,
  };
};

export default useStagingFunding;
