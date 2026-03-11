"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-toastify";
import { createSchema } from "@/schemas";
import { ManageAdminService } from "@/services/manage-admin-service";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";

import { SubmitHandler } from "react-hook-form";
// import { User } from "@/types";
import { GET_ALL_ADMIN_USERS } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import { AdminUser } from "@/types/general-type";
import * as XLSX from "xlsx";

const MODAL_TYPE = {
  CREATE_ADMIN: "CREATE_ADMIN",
  UPDATE_ADMIN: "UPDATE_ADMIN",
};
const useMangeUser = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");

  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize , setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<boolean | undefined>(false);

  const handleToggleModal = (
    modalState: string,
    data: AdminUser | null,
    status?: boolean | undefined
  ) => {
    if (modalState?.length === 0) {
      setOpen(false);
      return;
    }
    sessionStorage.setItem("selectedAccount", JSON.stringify(data));
    setSelectedUser(data);
    setStatus(status);
    setModalState(modalState);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [visibility, setVisibility] = useState(false);
  const [customerType, setCustomerType] = useState("all");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const manageAdmin = new ManageAdminService(token);
  const queryClient = useQueryClient();

  type FormFields = z.infer<typeof createSchema>;

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      if (!values.username || !values.password) {
        toast.error("Complete information");
        return;
      }
      setIsLoading(true);

      const data = await manageAdmin.createAdmin({
        username: values.username,
        password: values.password,
        role: values.role,
        name: values.name,
        phone: values.phone,
        staffNumber : values.staffNumber
        // confirmPassword : values?.confirmPassword
      });

      console.log(data);
      if (data.data?.code === 200) {
        toast.success(data.data.message);
        setOpen(false);
        setIsLoading(false);

        queryClient.invalidateQueries({ queryKey: [GET_ALL_ADMIN_USERS] });
      }
      return data;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      // toast.error(error?.response?.data?.message);
    }
  };
  const roles = [
    { label: "Admin", value: "ADMIN" },
    { label: "Super Admin", value: "SUPER_ADMIN" },
    { label: "Compliance Audit", value: "COMPLIANCE_AUDIT" },
    { label: "Credit Control", value: "CREDIT_CONTROL" },
  ];
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
    resolver: zodResolver(createSchema), // Dynamic schema
    defaultValues: {
      username: "",
      confirmPassword: "",
      password: "",
      status: "",
      role: "",
      name: "",
      phone: "",
      staffNumber : ""
    },
  });

  const {
    data: allAdmins,
    isLoading: allAdminsLoading,
    error: allAdminError,
  } = useQuery({
    queryKey: [
      GET_ALL_ADMIN_USERS,
      currentPage,
      pageSize,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await manageAdmin.getAllAdmin({
        currentPage,
        pageSize,
        searchTerm,
        dateRange: { startDate, endDate },
      });
      console.log(response);
      setTotalPages(response?.data?.totalPages);

      return response?.data?.content;
    },
  });
  console.log(selectedUser);
  // ✅ Update Admin Status
  const onUpdateStatus = async () => {
    try {
      setIsLoading(true);
      const payload = {
        adminId: selectedUser?.id,
        isActive: status,
      };
      const data = await manageAdmin.updateAdmin(payload);

      // if (response?.code === 200) {
      // toast.success(response?.message);
      // queryClient.invalidateQueries({ queryKey: [GET_ALL_ADMIN_USERS] });
      // } else {
      //   toast.error(response.message || "Failed to update status");
      // }
      if (data?.code === 200) {
        toast.success(data?.message);
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: [GET_ALL_ADMIN_USERS] });
      }
    } catch (error) {
      console.error(error);
      // toast.error(error?.response?.data?.message || "Error updating admin status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setOnSearch((term: string) => {
      setSearchTerm(term);
    });

    return () => setOnSearch(null);
  }, [setOnSearch]);

  const exportAdminsToExcel = () => {
    if (!allAdmins || allAdmins.length === 0) {
      toast.error("No admin users to export");
      return;
    }

    const formattedData = allAdmins.map((admin: AdminUser, index: number) => ({
      "S/N": index + 1,
      Email: admin.email || "-",
      Roles:
        admin.roles?.map((role) => role.name.replace("ROLE_", "")).join(", ") ||
        "-",
      Status: admin.enabled ? "Active" : "Inactive",
      "Created On": admin.created_on
        ? new Date(admin.created_on).toLocaleDateString()
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Users");
    XLSX.writeFile(workbook, "admin-users.xlsx");
  };

  return {
    open,
    setOpen,
    handleSubmit,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    selectedUser,
    register,
    onSubmit,
    errors,
    customerType,
    setCustomerType,
    isLoading,
    allAdminError,
    allAdminsLoading,
    allAdmins,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    setModalState,
    modalState,
    MODAL_TYPE,
    setValue,
    watch,
    onUpdateStatus,
    setCurrentPage,
    totalPages,
    setTotalPages,
    currentPage,
    setStatus,
    roles,
    exportAdminsToExcel,
    setPageSize,
    pageSize
  };
};

export default useMangeUser;
