"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { ManageRatesService } from "@/services/manage-rates-service";

import { SubmitHandler } from "react-hook-form";
import { User } from "@/types";
import { GET_ALL_RATES } from "@/constants/query-keys";
import { createRateSchema } from "@/schemas";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { AssetCategory } from "@/types/table-type";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router";
import { QueryClient } from "@tanstack/react-query";


const MODAL_TYPE = {
  CREATE_ADMIN: "CREATE_ADMIN",
  UPDATE_ADMIN: "UPDATE_ADMIN",
};
const useMangeInterestRates = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");

  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [typeToCreate, setTypeToCreate] = useState<string>("single");
  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategory | null>(null);
  const [preview, setPreview] = useState("");
  const queryClient = new QueryClient();

  const [savingTypes] = useState([
    { id: "1", name: "Smart Lock", value: "SmartLock" },
    { id: "2", name: "Save Small Small", value: "SSS" },
    { id: "3", name: "Buy Now Pay Later", value: "BNPL" },
    { id: "4", name: "Target Savings", value: "TargetSavings" },
  ]);

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
  const manageRates = new ManageRatesService(token);
  const navigate = useNavigate();

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

  type CreateRateFormValues = z.infer<typeof createRateSchema>;

  const onSubmit: SubmitHandler<CreateRateFormValues> = async (values) => {
    setIsLoading(true);
    try {
      const data = await manageRates.createRates({
        id: uuidv4(),
        savingsType: values?.savingsType,
        annualRate: values.annualRate,
        active: values.active,
      });

      console.log(data);
      if (data.data?.code === 200) {
        toast.success(data.data.message);
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: [GET_ALL_RATES] });

        navigate("/interestRates");
      }
      setIsLoading(false);
      return data;
    } catch (error: unknown) {
      console.log(error);
      setIsLoading(false);

      if (error instanceof AxiosError) {
        // Now TypeScript knows error is an AxiosError
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  // const handleFileUpload = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Create FormData for bulk upload
  //     const formData = new FormData();

  //     // append the file if present

  //     formData.append("file", file || ""); // 👈 key should match backend expectation

  //     // POST request
  //     const response = await manageAssets.createBulkAssets(formData);
  //     console.log(response);
  //     if (response.data?.code === 200) {
  //       toast.success(response.data.message);
  //       handleFileRemove();
  //       setOpen(false);
  //     }

  //     setIsLoading(false);
  //     // return response.data;
  //   } catch (error: unknown) {
  //     console.log(error);
  //     setIsLoading(false);
  //     handleFileRemove();
  //     if (error instanceof AxiosError) {
  //       toast.error(error.response?.data?.message || "An error occurred");
  //     } else {
  //       toast.error("An unexpected error occurred");
  //     }
  //   }
  // };
  useEffect(() => {
    setOnSearch((term: string) => {
      setSearchTerm(term);
    });

    return () => setOnSearch(null);
  }, [setOnSearch]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRateFormValues>({
    resolver: zodResolver(createRateSchema),
    defaultValues: {
      id: "",
      savingsType: "",
      annualRate: 0,
      active: true,
    },
  });

  const {
    data: allRates,
    isLoading: allRatesLoading,
    error: allRatesError,
  } = useQuery({
    queryKey: [GET_ALL_RATES, pageSize, currentPage, searchTerm],
    queryFn: async () => {
      const response = await manageRates.getAllRates(
        pageSize,
        currentPage,
        searchTerm
      );
      // console.log(response.data);
      setTotalPages(response.data?.totalPages);
      return response?.data?.content;
    },
  });

  console.log(file);
  return {
    open,
    setOpen,
    handleSubmit,
    register,
    onSubmit,
    errors,
    customerType,
    savingTypes,
    setCustomerType,
    isLoading,
    allRatesError,
    allRatesLoading,
    allRates,
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
    // handleFileUpload,
    setSelectedCategory,
    selectedCategory,
    preview,
    setPreview,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    searchTerm,
    setPageSize,
  };
};

export default useMangeInterestRates;
