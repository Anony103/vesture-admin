import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_PRODUCT_AVAILABILITY } from "@/constants/query-keys";
import { ProductAvailabilityService } from "@/services/product-availability-service";
import { ProductAvailability } from "@/types/product-availability-type";

const messageOf = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? fallback : fallback;

/** Whether BuyNow PayLater is open, and whether this admin may change that (the server answers 403 to anyone but a super admin). */
const useProductAvailability = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new ProductAvailabilityService(token), [token]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GET_PRODUCT_AVAILABILITY],
    queryFn: async () => (await service.get())?.data,
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: async (payload: ProductAvailability) => (await service.save(payload))?.data,
    onSuccess: (updated) => {
      queryClient.setQueryData([GET_PRODUCT_AVAILABILITY], updated);
      toast.success("Saved");
    },
    onError: (error) => toast.error(messageOf(error, "Could not save")),
  });

  return { availability: query.data, allowed: query.isSuccess, isLoading: query.isLoading, save };
};

export default useProductAvailability;
