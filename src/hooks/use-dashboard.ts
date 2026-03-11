"use client";
import { useState } from "react";
import * as z from "zod";
import { toast } from "react-toastify";
import { createSchema } from "@/schemas";
import { ManageAdminService } from "@/services/manage-admin-service";
import { GeneralAdminService } from "@/services/general-admin-service";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard-services";

import { SubmitHandler } from "react-hook-form";
import { User } from "@/types";
import {
  GET_ALL_USERS,
  GET_STATS,
  GET_MONTHLY_TRANS,
  GET_SAVINGS_PERCENTAGE,
} from "@/constants/query-keys";

const MODAL_TYPE = {
  CREATE_ADMIN: "CREATE_ADMIN",
  UPDATE_ADMIN: "UPDATE_ADMIN",
};
const useDashboard = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");

  const [modalState, setModalState] = useState<string>("");
  const [month, setMonth] = useState<string>("this-year");
  const [displayTime , setDisplayTime] = useState("This year")

  const handleToggleModal = (modalState: string, data: User | null) => {
    if (modalState?.length === 0) {
      setOpen(false);
      return;
    }
    sessionStorage.setItem("selectedAccount", JSON.stringify(data));
    // setSelectedAccounts(data);
    setModalState(modalState);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [visibility, setVisibility] = useState(false);
  const [customerType, setCustomerType] = useState("all");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize , setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const manageAdmin = new ManageAdminService(token);
  const generalAdmin = new GeneralAdminService(token);
  const dashboard = new DashboardService(token);

  type FormFields = z.infer<typeof createSchema>;

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    setIsLoading(true);
    try {
      const data = await manageAdmin.createAdmin({
        // ...values,
        username: values.username,
        password: values.password,
        role : values.role,
        name: values.name,
        phone: values.phone,
        staffNumber : values.staffNumber
      });
      console.log(data);
      if (data.data?.code === 200) {
        toast.success(data.data.message);
        setOpen(false);
      }
      console.log(data);
      setIsLoading(false);
      return data;
    } catch (error) {
      console.log(error);
      setIsLoading(false);

      // toast.error(error?.response?.data?.message);
    }
  };

const {
    data: allUsers,
    isLoading: allUsersLoading,
    error: allUsersError,
  } = useQuery({
    queryKey: [GET_ALL_USERS, currentPage, pageSize, customerType],
    queryFn: async () => {
      const response = await generalAdmin.getAllUsers(
        currentPage,
        pageSize,
        customerType
      );
      console.log(response);

      return response?.data?.content;
    },
  });
 console.log(allUsers)
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: [GET_STATS],
    queryFn: async () => {
      const response = await dashboard.getDashboardStats();
      console.log(response);

      return response?.data;
    },
  });
  const {
    data: monthlyTransaction,
    isLoading: monthlyTransactionLoading,
    error: monthlyTransactionError,
  } = useQuery({
    queryKey: [GET_MONTHLY_TRANS],
    queryFn: async () => {
      const response = await dashboard.getMonthlyTransactions();
      console.log(response);

      return response?.data;
    },
  });

  const {
    data: savingsPercentage,
    isLoading: savingsPercentageLoading,
    error: savingsPercentageError,
  } = useQuery({
    queryKey: [GET_SAVINGS_PERCENTAGE , month],
    queryFn: async () => {
      const response = await dashboard.getPercentageSavings(month);
      console.log(response);
      return response?.data;
    },
  });

  return {
    open,
    setOpen,
    allUsersLoading,
    allUsersError,
    allUsers,
    onSubmit,
    customerType,
    setCustomerType,
    setPageSize,
    isLoading,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    setModalState,
    modalState,
    MODAL_TYPE,
    stats,
    statsLoading,
    statsError,
    monthlyTransaction,
    monthlyTransactionLoading,
    monthlyTransactionError,
    setMonth,
    month,
    savingsPercentage,
    savingsPercentageLoading,
    savingsPercentageError,
    displayTime,
    setDisplayTime,
     setCurrentPage,
    totalPages,
    setTotalPages,
    currentPage,
    pageSize
  };
};

export default useDashboard;
