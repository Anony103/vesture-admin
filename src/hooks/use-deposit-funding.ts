import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_DEPOSIT_FUNDING } from "@/constants/query-keys";
import { DepositFundingService } from "@/services/deposit-funding-service";
import { DepositFundingMethod } from "@/types/deposit-funding-type";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

/** How plans may be funded by bank transfer, and whether this admin may change it (the server answers 403 to anyone but a super admin). */
const useDepositFunding = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new DepositFundingService(token), [token]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GET_DEPOSIT_FUNDING],
    queryFn: async () => (await service.get())?.data,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: async (method: DepositFundingMethod) => (await service.save(method))?.data,
    onSuccess: (updated) => {
      queryClient.setQueryData([GET_DEPOSIT_FUNDING], updated);
      toast.success("Saved");
    },
    onError: (error) => toast.error(messageOf(error, "Could not save")),
  });

  return { funding: query.data, allowed: query.isSuccess, isLoading: query.isLoading, save };
};

export default useDepositFunding;
