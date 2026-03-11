"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-toastify";
import { createSchema } from "@/schemas";
import { ManageSavingsService } from "@/services/manage-savings-service";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { SavingsType } from "@/types/table-type";
import { SubmitHandler } from "react-hook-form";
import { User } from "@/types";
// import { GET_ALL_ASSETS } from "@/constants/query-keys";
import { GET_ALL_SAVINGS } from "@/constants/query-keys";
import { useAppContext } from "@/context/AppContext";
import * as XLSX from "xlsx";

const MODAL_TYPE = {
  CREATE_ADMIN: "CREATE_ADMIN",
  UPDATE_ADMIN: "UPDATE_ADMIN",
};
const useMangeSavings = (id ?: string) => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");
  // const today = new Date().toISOString().split("T")[0]; // 👉 "YYYY-MM-DD"

  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize , setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();

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
  const [customerType, setCustomerType] = useState("get-all-savings");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const manageSavings = new ManageSavingsService(token);

  type FormFields = z.infer<typeof createSchema>;

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    setIsLoading(true);
    try {
      let data;

      if (modalState === MODAL_TYPE.CREATE_ADMIN) {
        if (values.username || values.password) {
          toast.error("Complete information");
          return;
        }
      } else {
        if (!values.status) {
          toast.error("status is required");
          return;
        }
        // Assuming you have an updateAdmin method and need different parameters
        // data = await manageAdmin.updateAdmin({
        //   userId: selectedUser?.id, // You might need to add this to your FormFields
        //   status: values.status,
        // });
      }

      console.log(data);
      // if (data.data?.code === 200) {
      //   toast.success(data.data.message);
      //   setOpen(false);
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
    resolver: zodResolver(createSchema), // Dynamic schema
    defaultValues: {
      username: "",
      confirmPassword: "",
      password: "",
      status: "",
    },
  });

  const {
    data: allSavings,
    isLoading: allSavingsLoading,
    error: allSavingsError,
  } = useQuery({
    queryKey: [
      GET_ALL_SAVINGS,
      customerType,
      pageSize,
      currentPage,
      searchTerm,
      startDate,
      endDate
    ],
    queryFn: async () => {
      const response = await manageSavings.getAllSavings(
        customerType,
        {
          pageSize,
          currentPage,
          searchTerm,
          dateRange: { startDate, endDate },
        }
      );
      console.log(response.data.content);
      console.log(response.data);
      setTotalPages(response.data.totalPages);
      return response?.data.content ?? response?.data;
    },
  });

  const {
    data: userSavings,
    isLoading: userSavingsLoading,
    error: usersSavingsError,
  } = useQuery({
    queryKey: [
      GET_ALL_SAVINGS,
      id
    ],
    queryFn: async () => {
      const response = await manageSavings.getUserSavings(id);
      // console.log(response.data.content);
      console.log(response)
      console.log(response.data);
      setTotalPages(response.data.totalPages);
      return response?.data.content ?? response?.data;
    },
  });

  const exportSavingsToExcel = () => {
    if (!allSavings || allSavings.length === 0) {
      toast.error("No data to export");
      return;
    }

    const formattedData = allSavings.map((item: SavingsType) => ({
      "Customer Name": item.user,
      "Savings Name": item.name,
      "Product Name": item.product?.productName,
      "Product Code": item.product?.productCode,
      Amount: item.amount,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Savings");

    XLSX.writeFile(workbook, "savings-data.xlsx");
  };

  return {
    open,
    setOpen,
    handleSubmit,
    register,
    onSubmit,
    errors,
    customerType,
    setCustomerType,
    setPageSize,
    isLoading,
    allSavingsError,
    allSavingsLoading,
    allSavings,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    setModalState,
    modalState,
    MODAL_TYPE,
    setValue,
    watch,
    selectedUser,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    exportSavingsToExcel,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    searchTerm,
    handleStartDateChange,
    handleEndDateChange,
    setSearchTerm,
    setOnSearch,
    pageSize,
    userSavings,
    usersSavingsError,
    userSavingsLoading
  };
};

export default useMangeSavings;
