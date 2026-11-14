import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_NET_PAY_LIMIT } from "@/constants/query-keys";
import { NetPayLimitService } from "@/services/net-pay-limit-service";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

/** The net-pay share, and whether this admin may change it (the server answers 403 to anyone but a super admin). */
const useNetPayLimit = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new NetPayLimitService(token), [token]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GET_NET_PAY_LIMIT],
    queryFn: async () => (await service.get())?.data,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: async (percent: number) => (await service.save(percent))?.data,
    onSuccess: (updated) => {
      queryClient.setQueryData([GET_NET_PAY_LIMIT], updated);
      toast.success("Saved");
    },
    onError: (error) => toast.error(messageOf(error, "Could not save")),
  });

  return { limit: query.data, allowed: query.isSuccess, isLoading: query.isLoading, save };
};

export default useNetPayLimit;
