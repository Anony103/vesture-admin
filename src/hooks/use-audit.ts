"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { toast } from "react-toastify";
import { updateUserSchema } from "@/schemas";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";

// import { SubmitHandler } from "react-hook-form";
import { User } from "@/types";
import { GET_ALL_AUDIT_LOGS } from "@/constants/query-keys";
import { AuditLogService } from "@/services/audit-logs";
import { LogEntry } from "@/types/table-type";
import * as XLSX from "xlsx";

const MODAL_TYPE = {
  ACTIVATE_CUSTOMER: "ACTIVATE_CUSTOMER",
  DEACTIVATE_CUSTOMER: "DEACTIVATE_CUSTOMER",
};
const useAudits = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");
  const userDetails = JSON.parse(
    sessionStorage.getItem(`${SESSION_STORAGE_KEY}_TEMP_AUTH_DATA`) || ""
  );
  console.log(userDetails);
  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize , setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const today = new Date().toISOString().split("T")[0]; // 👉 "YYYY-MM-DD"

  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();
  const auditLogService = new AuditLogService(token);

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
  // const [isLoading, setIsLoading] = useState(false);
  // const manageAdmin = new ManageAdminService(token);
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  type FormFields = z.infer<typeof updateUserSchema>;

  // const onSubmit: SubmitHandler<FormFields> = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Assuming you have an updateAdmin method and need different parameters
  //     const data = await generalAdmin.updateCustomer({
  //       userId: selectedUser?.id, // You might need to add this to your FormFields
  //       status:
  //         modalState === MODAL_TYPE.ACTIVATE_CUSTOMER
  //           ? "activated"
  //           : "deactivated",
  //     });

  //     console.log(data);
  //     // if (data?.code === 200) {
  //     toast.success(data?.message);
  //     setOpen(false);
  //     // }
  //     setIsLoading(false);
  //     return data;
  //   } catch (error) {
  //     console.log(error);
  //     setIsLoading(false);
  //     // toast.error(error?.response?.data?.message);
  //   }
  // };
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
    data: auditLogs,
    isLoading: auditLogsLoading,
    error: auditLogsError,
  } = useQuery({
    queryKey: [
      GET_ALL_AUDIT_LOGS,
      pageSize,
      currentPage,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await auditLogService.getAuditLogs({
        currentPage,
        pageSize,
        searchTerm,
        dateRange: { startDate, endDate },
      });
      setTotalPages(response.data.data.totalPages);
      console.log(response.data.data.content);
      return response?.data.data.content;
    },
  });
  useEffect(() => {
    setOnSearch((term: string) => {
      setSearchTerm(term);
    });
    return () => setOnSearch(null);
  }, [setOnSearch]);

  const exportAuditsToExcel = () => {
    if (!auditLogs || auditLogs.length === 0) {
      console.log("No data to export");
      return;
    }

    // 🔹 Transform data (important)
    const formattedData = auditLogs.map((item: LogEntry) => ({
      "Audit ID": item.id,
      "User ID": item.userId ?? "—",
      Username: item.username ?? "—",
      Action: item.action,
      "Request Description": item.requestPayload ?? "—",
      Success: item.success ? "Yes" : "No",
      "Error Message": item.errorMessage ?? "—",
      "IP Address": item.ipAddress ?? "—",
      Device: item.device ?? "—",
      Channel: item.channel ?? "—",
      "Created On": new Date(item.createdOn).toLocaleString(),
    }));

    // 🔹 Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // 🔹 Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

    // 🔹 Export file
    XLSX.writeFile(workbook, "audit_logs.xlsx");
  };

  return {
    open,
    setOpen,
    handleSubmit,
    setPageSize,

    register,
    // onSubmit,
    errors,
    customerType,
    setCustomerType,
    exportAuditsToExcel,
    // isLoading,
    selectedUser,
    auditLogs,
    auditLogsLoading,
    auditLogsError,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    setModalState,
    modalState,
    MODAL_TYPE,
    setValue,
    watch,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    pageSize,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    handleEndDateChange,
    handleStartDateChange,
  };
};

export default useAudits;
