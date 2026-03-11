"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, ChangeEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { toast } from "react-toastify";
import { CreditEntryService } from "@/services/manage-credit-entry";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";

import { User } from "@/types";
import { GET_CREDIT_ENTRY } from "@/constants/query-keys";
import { createAssetSchema } from "@/schemas";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useAppContext } from "@/context/AppContext";

const MODAL_TYPE = {
  CREATE_ADMIN: "CREATE_ADMIN",
  UPDATE_ADMIN: "UPDATE_ADMIN",
};
const useCreditEntry = () => {
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
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  const creditEntryService = new CreditEntryService(token);

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
      // Create FormData for bulk upload
      const formData = new FormData();

      // append the file if present

      formData.append("file", file || ""); // 👈 key should match backend expectation

      // POST request
      const response = await creditEntryService.createBulkCreditEntry(formData);
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
    data: creditEntries,
    isLoading: creditEntriesLoading,
    error: creditEntriesError,
  } = useQuery({
    queryKey: [
      GET_CREDIT_ENTRY,
      pageSize,
      currentPage,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await creditEntryService.getCreditEntries({
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
    creditEntries,
    creditEntriesLoading,
    creditEntriesError,
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
  };
};

export default useCreditEntry;
