"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-toastify";
import { updateUserSchema } from "@/schemas";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { SubmitHandler } from "react-hook-form";
import { User } from "@/types";
import { GET_ALL_USERS } from "@/constants/query-keys";
import { GeneralAdminService } from "@/services/general-admin-service";
import { useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";

const MODAL_TYPE = {
  ACTIVATE_CUSTOMER: "ACTIVATE_CUSTOMER",
  DEACTIVATE_CUSTOMER: "DEACTIVATE_CUSTOMER",
};
const useMangeCustomer = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");
  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const generalAdmin = new GeneralAdminService(token);
  const queryClient = useQueryClient();
  const handleClose = () => setOpen(false);
  const [visibility, setVisibility] = useState(false);
  const [customerType, setCustomerType] = useState("all");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();

  type FormFields = z.infer<typeof updateUserSchema>;

  const onSubmit: SubmitHandler<FormFields> = async () => {
    setIsLoading(true);
    try {
      // Assuming you have an updateAdmin method and need different parameters
      const data = await generalAdmin.updateCustomer({
        userId: selectedUser?.id, // You might need to add this to your FormFields
        status:
          modalState === MODAL_TYPE.ACTIVATE_CUSTOMER
            ? "ACTIVE"
            : "deactivated",
      });

      console.log(data);
      if (data?.code === 200) {
        toast.success(data?.message);
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: [GET_ALL_USERS] });
      }
      setIsLoading(false);
      return data;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      // toast.error(error?.response?.data?.message);
    }
  };

  const handleToggleModal = (modalState: string, data: User | null) => {
    if (modalState?.length === 0) {
      setOpen(false);
      return;
    }
    sessionStorage.setItem("selectedAccount", JSON.stringify(data));
    setSelectedUser(data);
    setModalState(modalState);
    setOpen(true);
  };

  const {
    register,
    // setError,
    handleSubmit,
    watch,
    setValue,
    // reset,
    // clearErrors,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(updateUserSchema), // Dynamic schema
    defaultValues: {
      status: "",
    },
  });

  const {
    data: allUsers,
    isLoading: allUsersLoading,
    error: allUsersError,
  } = useQuery({
    queryKey: [
      GET_ALL_USERS,
      currentPage,
      pageSize,
      customerType,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await generalAdmin.getAllUsers(
        currentPage,
        pageSize,
        customerType,
        searchTerm,
        startDate,
        endDate
      );
      setTotalPages(response?.data?.totalPages);
      return response?.data?.content;
    },
  });

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: [startDate, endDate],
    queryFn: async () => {
      const response = await generalAdmin.getAllUsers(
        currentPage,
        pageSize,
        customerType,
        searchTerm,
        startDate,
        endDate
      );
      setTotalPages(response?.data?.totalPages);
      return response?.data?.content;
    },
  });

  useEffect(() => {
    setOnSearch((term: string) => {
      setSearchTerm(term);
    });

    return () => setOnSearch(null);
  }, [setOnSearch]);
  console.log(allUsers);

  return {
    open,
    setOpen,
    handleSubmit,

    register,
    onSubmit,
    errors,
    customerType,
    setCustomerType,
    isLoading,
    allUsersError,
    allUsersLoading,
    allUsers,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    setModalState,
    modalState,
    MODAL_TYPE,
    setValue,
    watch,
    setCurrentPage,
    totalPages,
    setTotalPages,
    currentPage,
    endDate,
    setEndDate,
    setStartDate,
    startDate,
    selectedUser,
    setPageSize,
    pageSize,
    users,
    usersLoading,
    usersError,
  };
};

export default useMangeCustomer;
