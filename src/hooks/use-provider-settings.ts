import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_PROVIDER_SETTINGS } from "@/constants/query-keys";
import { ProviderSettingsService } from "@/services/provider-settings-service";
import { ProviderKind } from "@/types/provider-settings-type";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

/**
 * The provider settings, and whether this admin may see them. The server answers 403 to anyone who is not a super admin, so for them
 * `allowed` stays false and the page and its menu entry stay hidden.
 */
const useProviderSettings = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new ProviderSettingsService(token), [token]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GET_PROVIDER_SETTINGS],
    queryFn: async () => (await service.get())?.data,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: async ({ kind, order }: { kind: ProviderKind; order: string[] }) => (await service.save(kind, order))?.data,
    onSuccess: (updated) => {
      queryClient.setQueryData([GET_PROVIDER_SETTINGS], updated);
      toast.success("Saved");
    },
    onError: (error) => toast.error(messageOf(error, "Could not save")),
  });

  return { settings: query.data, allowed: query.isSuccess, isLoading: query.isLoading, save };
};

export default useProviderSettings;
