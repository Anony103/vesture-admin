"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, SetStateAction } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
// import { ManageAssetService } from "@/services/manage-assets-service"; // You can rename this service later
import { GeneralAdminService } from "@/services/general-admin-service";

// 1️⃣ Define Zod schema for validation
const updatePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "Old password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

// 2️⃣ Custom hook
const useUpdatePassword = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [settingOptions, setSettingOptions] = useState("Security");
  const [hour, setHour] = useState(1);

  // Example service instance (you can replace ManageAssetService with a dedicated UserService)
  //   const manageAssets = new ManageAssetService(token);
  const generalAdmin = new GeneralAdminService(token);

  // 3️⃣ React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSettingOptionsChange = (option: SetStateAction<string>) => {

    setSettingOptions(option);
    
  };

  // 4️⃣ Mutation using React Query (optional)
  const mutation = useMutation({
    mutationFn: async (values: UpdatePasswordValues) => {
      setIsLoading(true);
      const response = await generalAdmin.updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
      setIsLoading(false);
      toast.success(data?.message || "Password updated successfully");
      setOpen(false);
      reset();
    },
    onError: (error: unknown) => {
      setIsLoading(false);
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to update password",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  // 5️⃣ Submit handler
  const onSubmit: SubmitHandler<UpdatePasswordValues> = (values) => {
    mutation.mutate(values);
  };
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        hourOfDay: hour,
      };

      // POST request

      const response = await generalAdmin.autoSave(payload);
      console.log(response);
      if (response.status === 200) {
        toast.success(response.data.message || "sucess"); // or response.data.data
        setOpen(false);
      }

      setIsLoading(false);
    } catch (error: unknown) {
      console.log(error);
      setIsLoading(false);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };
  // 6️⃣ Expose necessary values
  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    open,
    setOpen,
    handleSettingOptionsChange,
    settingOptions,
    handleSave,
    setHour,
    hour,
  };
};

export default useUpdatePassword;
