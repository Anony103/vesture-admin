import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_APP_ACCESS, GET_WEB_TESTERS } from "@/constants/query-keys";
import { AppAccessService } from "@/services/app-access-service";
import { AppAccessPayload } from "@/types/app-access-type";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

/** Whether the customer apps are on, and whether this admin may change that (the server answers 403 to anyone but a super admin). */
const useAppAccess = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new AppAccessService(token), [token]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GET_APP_ACCESS],
    queryFn: async () => (await service.get())?.data,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: async (payload: AppAccessPayload) => (await service.save(payload))?.data,
    onSuccess: (updated) => {
      queryClient.setQueryData([GET_APP_ACCESS], updated);
      toast.success("Saved");
    },
    onError: (error) => toast.error(messageOf(error, "Could not save")),
  });

  // who may keep signing in to the web while Waitlist mode is on
  const testersQuery = useQuery({
    queryKey: [GET_WEB_TESTERS],
    queryFn: async () => (await service.getTesters())?.data,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!token && query.isSuccess,
  });

  const saveTesters = useMutation({
    mutationFn: async (testers: string[]) => (await service.saveTesters(testers))?.data,
    onSuccess: (updated) => {
      queryClient.setQueryData([GET_WEB_TESTERS], updated);
      toast.success("Testers saved");
    },
    onError: (error) => toast.error(messageOf(error, "Could not save the testers")),
  });

  return { access: query.data, allowed: query.isSuccess, isLoading: query.isLoading, save, testers: testersQuery.data, saveTesters };
};

export default useAppAccess;
