"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, ChangeEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { toast } from "react-toastify";
import { EmployeeInfosService } from "@/services/manage-employees";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";

import { User } from "@/types";
import { GET_EMPLOYEE_INFOS } from "@/constants/query-keys";
import { createAssetSchema } from "@/schemas";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useAppContext } from "@/context/AppContext";
import { exportToExcel } from "@/utils/exportAsExcel";
import { EmployeeRecord } from "@/types/table-type";

const MODAL_TYPE = {
  CREATE_ADMIN: "CREATE_ADMIN",
  UPDATE_ADMIN: "UPDATE_ADMIN",
};
const useEmployeeInfo = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");

  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [typeToCreate, setTypeToCreate] = useState<string>("single");

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
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();
  const employeeInfoService = new EmployeeInfosService(token);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleCreateBulk = () => {
    setTypeToCreate("bulk");
  };
  const handleCreateSingle = () => {
    setTypeToCreate("single");
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement> | null,
    field: string
  ): void => {
    if (!event) return;

    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // 👇 update the correct file state
      if (field === "assetSheet") {
        setFile(file);
      }
    }
  };
  const handleFileRemove = () => {
    setFile(null);
  };

  type CreateAssetFormValues = z.infer<typeof createAssetSchema>;

  // const onSubmit: SubmitHandler<CreateAssetFormValues> = async (values) => {
  //   setIsLoading(true);
  //   try {
  //     const data = await manageAssets.createAssets({
  //       categoryId: uuidv4(),
  //       ...values,
  //       maxTenor: parseFloat(values?.maxTenor),
  //       created_by: "string",
  //       created_on: new Date(),
  //       image : ""
  //     });

  //     console.log(data);
  //     if (data.data?.code === 200) {
  //       toast.success(data.data.message);
  //       setOpen(false);
  //     }
  //     setIsLoading(false);
  //     return data;
  //   } catch (error: unknown) {
  //     console.log(error);
  //     setIsLoading(false);

  //     if (error instanceof AxiosError) {
  //       // Now TypeScript knows error is an AxiosError
  //       toast.error(error.response?.data?.message || "An error occurred");
  //     } else {
  //       toast.error("An unexpected error occurred");
  //     }
  //   }
  // };

  const handleFileUpload = async () => {
    setIsLoading(true);
    try {
      // Validate file exists
      if (!file) {
        toast.error("Please select a file to upload");
        setIsLoading(false);
        return;
      }

      // Create FormData for bulk upload
      const formData = new FormData();
      formData.append("file", file);

      // POST request
      const response = await employeeInfoService.createEmloyeeInfos(formData);
      console.log(response);
      if (response.data?.code === 200) {
        toast.success(response.data.message);
        handleFileRemove();
        setOpen(false);
      }

      setIsLoading(false);
      // return response.data;
    } catch (error: unknown) {
      console.log(error);
      setIsLoading(false);
      handleFileRemove();
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAssetFormValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: "",
      category: "",
      amount: 0,
      maxTenor: "",
      availableUnits: 0,
      description: "",
    },
  });

  const {
    data: employeeInfos,
    isLoading: employeInfosLoading,
    error: employeInfosError,
  } = useQuery({
    queryKey: [GET_EMPLOYEE_INFOS, pageSize, currentPage, searchTerm ,startDate, endDate],
    queryFn: async () => {
      const response = await employeeInfoService.getEmployeeInfos({
        pageSize,
        currentPage,
        searchTerm,
        dateRange: { startDate, endDate },
      });
      console.log(response);
      setTotalPages(response.data?.totalPages);

      return response?.data.content;
    },
  });
  console.log(file);

  const [exporting, setExporting] = useState(false);
  /** The sheet stores dates as Excel serial numbers (44563); show them as dates. */
  const asDate = (value: string | undefined) => {
    if (!value || !/^\d{4,6}(\.0+)?$/.test(value.trim())) return value ?? "";
    const serial = parseFloat(value);
    return new Date(Math.round((serial - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
  };

  /** Everything the table could show for the chosen dates (or search), not just the page on screen. */
  const exportStaffToExcel = async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error("Choose both dates, or clear them to export everything");
      return;
    }
    setExporting(true);
    try {
      const rows = (await employeeInfoService.getAllForExport({
        searchTerm,
        dateRange: { startDate, endDate },
      })) as unknown as EmployeeRecord[];
      if (!rows.length) {
        toast.error("There is no staff data to export");
        return;
      }
      exportToExcel<EmployeeRecord>({
        data: rows,
        fileName: `staff-data-${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: "Staff data",
        columns: [
          { header: "S/N", key: (_row, index) => index + 1 },
          { header: "Full Name", key: "fullName" },
          { header: "IPPIS No", key: "ippisNumber" },
          { header: "Staff ID", key: "staffId" },
          { header: "Organization", key: "employerOrganization" },
          { header: "Employment Status", key: "employmentStatus" },
          { header: "Assignment Status", key: "assignmentStatus" },
          { header: "Hire Date", key: (row) => asDate(row.hireDate) },
          { header: "Birth Date", key: (row) => asDate(row.birthDate) },
          { header: "Job Title", key: "jobTitle" },
          { header: "Command", key: "command" },
          { header: "Phone Number", key: "phoneNumber" },
          { header: "Bank", key: "bankName" },
          { header: "Account No", key: "accountNumber" },
          { header: "Staff Category", key: "staffCategory" },
          { header: "Employee Type", key: "employeeType" },
          { header: "Net Pay", key: "netPay" },
          { header: "Period", key: (row) => asDate(row.period) },
          { header: "Uploaded On", key: (row) => (row.uploadedOn ? new Date(row.uploadedOn).toLocaleString() : "") },
        ],
      });
      toast.success(`Exported ${rows.length} staff records`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Could not export the staff data");
      } else {
        toast.error("Could not export the staff data");
      }
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    setOnSearch((term: string) => {
      setSearchTerm(term);
    });

    return () => setOnSearch(null);
  }, [setOnSearch]);
  return {
    open,
    setOpen,
    handleSubmit,
    register,
    // onSubmit,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    errors,
    customerType,
    setCustomerType,
    isLoading,
    employeeInfos,
    employeInfosLoading,
    employeInfosError,
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
    handleCreateBulk,
    handleCreateSingle,
    typeToCreate,
    setTypeToCreate,
    handleFileChange,
    file,
    handleFileRemove,
    handleFileUpload,
    setCurrentPage,
    totalPages,
    setTotalPages,
    currentPage,
    setPageSize,
    pageSize,
    exportStaffToExcel,
    exporting,
  };
};

export default useEmployeeInfo;
