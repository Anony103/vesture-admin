"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-toastify";
import { updateUserSchema } from "@/schemas";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/types/table-type";
import { SubmitHandler } from "react-hook-form";
import { User } from "@/types";
import { GET_ALL_TRANSACTIONS } from "@/constants/query-keys";
import { GeneralAdminService } from "@/services/general-admin-service";
import { useAppContext } from "@/context/AppContext";
import * as XLSX from "xlsx";


const MODAL_TYPE = {
  ACTIVATE_CUSTOMER: "ACTIVATE_CUSTOMER",
  DEACTIVATE_CUSTOMER: "DEACTIVATE_CUSTOMER",
};
const useMangeTransactions = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");
  // const today = new Date().toISOString().split("T")[0]; // 👉 "YYYY-MM-DD"

  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const generalAdmin = new GeneralAdminService(token);

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

  const handleClose = () => setOpen(false);
  const [visibility, setVisibility] = useState(false);
  const [customerType, setCustomerType] = useState("allcustomers");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize , setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();
  // const manageAdmin = new ManageAdminService(token);

  type FormFields = z.infer<typeof updateUserSchema>;

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const onSubmit: SubmitHandler<FormFields> = async () => {
    setIsLoading(true);
    try {
      // Assuming you have an updateAdmin method and need different parameters
      const data = await generalAdmin.updateCustomer({
        userId: selectedUser?.id, // You might need to add this to your FormFields
        status:
          modalState === MODAL_TYPE.ACTIVATE_CUSTOMER
            ? "activated"
            : "deactivated",
      });

      console.log(data);
      // if (data?.code === 200) {
      toast.success(data?.message);
      setOpen(false);
      // }
      setIsLoading(false);
      return data;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      // toast.error(error?.response?.data?.message);
    }
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
    data: allTransactions,
    isLoading: allTransactionsLoading,
    error: allTransactionsError,
  } = useQuery({
    queryKey: [
      GET_ALL_TRANSACTIONS,
      currentPage,
      pageSize,
      customerType,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await generalAdmin.getAllTransactions({
        currentPage,
        pageSize,
        searchTerm,
        dateRange: { startDate, endDate },
      });
      console.log(response?.data.content);

      return response?.data.content;
    },
  });
  useEffect(() => {
    setOnSearch((term: string) => {
      setSearchTerm(term);
    });

    return () => setOnSearch(null);
  }, [setOnSearch]);

  const exportTransactionsToExcel = () => {
    if (!allTransactions || allTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    // Map data to readable format
    const formattedData = allTransactions.map(
      (item: Transaction, index: number) => ({
        "S/N": index + 1,
        Amount: item.amount,
        "Bank Name": item.bankName,
        "Account Number": item.accountNumber,
        "User Full Name": item.userFullName,
        "Beneficiary Name": item.beneficiaryName,
        "Beneficiary Account Number": item.beneficiaryAccountNumber,
        "Transaction Reference": item.transactionReference,
        Status: item.transactionStatus,
        Type: item.transactionType,
        Reason: item.transactionReason,
        "Transaction Date": item.transactionDate,
        "Created On": item.created_on,
        "Updated On": item.updated_on,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  return {
    open,
    setOpen,
    handleSubmit,
    setPageSize,
    register,
    onSubmit,
    errors,
    customerType,
    setCustomerType,
    isLoading,
    allTransactions,
    allTransactionsLoading,
    allTransactionsError,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    setModalState,
    modalState,
    MODAL_TYPE,
    setValue,
    watch,
    endDate,
    setEndDate,
    startDate,
    setStartDate,
    totalPages,
    setTotalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    setOnSearch,
    pageSize,
    handleEndDateChange,
    handleStartDateChange,
    exportTransactionsToExcel,
  };
};

export default useMangeTransactions;
