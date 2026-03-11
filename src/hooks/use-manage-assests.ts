"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { toast } from "react-toastify";
import { ManageAssetService } from "@/services/manage-assets-service";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery } from "@tanstack/react-query";

import { SubmitHandler } from "react-hook-form";
import { GET_ALL_ASSETS, GET_ASSET_DETAILS } from "@/constants/query-keys";
import { createAssetSchema } from "@/schemas";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
// import { v4 as uuidv4 } from "uuid";
import { AssetCategory, AssetType } from "@/types/table-type";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "./use-user";

const MODAL_TYPE = {
  DELETE_ASSET: "DELETE_ASSET",
};
const useMangeAssets = (id?: string | undefined) => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // let assetSelected: AssetType | null = null; // or whatever type/default you expect

  const stored = sessionStorage.getItem("selectedAsset");
  const mode = sessionStorage.getItem("mode");

  // if (stored) {
  //   try {
  //     assetSelected = JSON.parse(stored);
  //   } catch (error) {
  //     console.error("Invalid JSON in sessionStorage for selectedAsset:", error);
  //     // Optionally clear corrupted data
  //     sessionStorage.removeItem("selectedAsset");
  //   }
  // } // useRoleAccess("manager");
  // const today = new Date().toISOString().split("T")[0]; // 👉 "YYYY-MM-DD"

  const [modalState, setModalState] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [typeToCreate, setTypeToCreate] = useState<string>("single");
  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategory | null>(null);
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  

  const handleToggleModal = (modalState: string, data: AssetType | null) => {
    if (modalState?.length === 0) {
      setOpen(false);
      return;
    }
    // sessionStorage.setItem("selectedAccount", JSON.stringify(data));
    setSelectedAsset(data);
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
  const manageAssets = new ManageAssetService(token);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [editMode, setEditMode] = useState("");

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
  //       categoryId: selectedCategory?.id,
  //       ...values,
  //       maxTenor: parseFloat(values?.maxTenor),
  //       created_by: "string",
  //       created_on: new Date(),
  //     });

  //     console.log(data);
  //     if (data.data?.code === 200) {
  //       toast.success(data.data.message);
  //       setOpen(false);
  //       navigate("/assets");
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


  console.log(mode , stored)
  const onSubmit: SubmitHandler<CreateAssetFormValues> = async (values) => {
    setIsLoading(true);
    try {
      let response;
      const commonPayload = {
        categoryId: selectedCategory?.id,
        ...values,
        maxTenor: values?.maxTenor ? parseFloat(values?.maxTenor) : undefined,
      };

      if (mode === "true" && stored) {
        // ── Edit Mode ──
        const parsed = JSON.parse(stored);
        response = await manageAssets.updateAsset({
          id: parsed.id,
          ...commonPayload,
          created_by: user?.email, // replace with actual user if available
          created_on: new Date(),
        });

        if (response.data?.code === 200) {
          toast.success(response.data.message || "Asset updated successfully");
        }
      } else {
        // ── Create Mode ──
        response = await manageAssets.createAssets({
          ...commonPayload,
          created_by: user?.email, // replace with actual user if available
          created_on: new Date(),
        });

        if (response.data?.code === 200) {
          toast.success(response.data.message || "Asset created successfully");
        }
      }

      // ── Success Handling (common for both create & edit) ──
      if (response.data?.code === 200) {
        setOpen(false);
        navigate("/assets");

        // Clear selected asset after successful edit
        // if (assetSelected) {
        //   sessionStorage.removeItem("selectedAsset");
        //   // If you're using state management, also clear it there
        // }
      }

      return response;
    } catch (error) {
      console.error("Asset operation failed:", error);

      let message = "An unexpected error occurred";

      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message || message;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    setIsLoading(true);
    try {
      // Create FormData for bulk upload
      const formData = new FormData();

      // append the file if present

      formData.append("file", file || ""); // 👈 key should match backend expectation

      // POST request
      const response = await manageAssets.createBulkAssets(formData);
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
    reset,
      control, // ✅ REQUIRED for Select
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
      image: "",
    },
  });

  const {
    data: allAssets,
    isLoading: allAssetsLoading,
    error: allAssetsError,
  } = useQuery({
    queryKey: [
      GET_ALL_ASSETS,
      pageSize,
      currentPage,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await manageAssets.getAllAssets({
        pageSize,
        currentPage,
        searchTerm,
        dateRange: { startDate, endDate },
      });
      // console.log(response);
      setTotalPages(response.data?.totalPages);
      return response?.data.content;
    },
  });
  const {
    data: assetDetails,
    isLoading: assetDetailsLoading,
    error: assetDetailsError,
  } = useQuery({
    queryKey: [GET_ASSET_DETAILS, id],
    queryFn: async () => {
      const response = await manageAssets.getAssetDetails(id);
      console.log(response);
      return response?.data;
    },
    enabled: !!id,
  });

  const handleDeleteAsset = async (id: string | undefined) => {
    setIsLoading(true);

    try {
      const data = await manageAssets.deleteAsset(id);

      if (data.data?.code === 200) {
        toast.success(data.data.message);
        setOpen(false);
        navigate("/assets");
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: [GET_ALL_ASSETS] });
        queryClient.invalidateQueries({ queryKey: [GET_ASSET_DETAILS, id] });
      }

      setIsLoading(false);
      return data;
    } catch (error: unknown) {
      setIsLoading(false);

      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Request failed");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  console.log(file);
  useEffect(() => {
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(parsed)
      reset({
        name: parsed?.name ?? "",
        amount: parsed?.amount ?? 0,
        maxTenor: parsed?.maxTenor?.toString() ?? "",
        availableUnits: parsed?.availableUnits ?? 0,
        description: parsed?.description ?? "",
        category : parsed?.category?.toString() ?? ""
      });
      // setValue("maxTenor" , parsed?.maxTenor)
    } else {
      reset(); // Clear form for create mode
    }
  }, [stored, reset]);
  return {
    open,
    setOpen,
    handleSubmit,
    register,
    onSubmit,
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
    allAssetsError,
    allAssetsLoading,
    allAssets,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    setModalState,
    modalState,
    MODAL_TYPE,
    setValue,
    watch,
    selectedAsset,
    handleCreateBulk,
    handleCreateSingle,
    typeToCreate,
    setTypeToCreate,
    handleFileChange,
    file,
    handleFileRemove,
    handleFileUpload,
    setSelectedCategory,
    selectedCategory,
    preview,
    setPreview,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    searchTerm,
    assetDetails,
    assetDetailsLoading,
    assetDetailsError,
    handleDeleteAsset,
    setPageSize,
    setSelectedAsset,
    editMode,
    setEditMode,
    control
  };
};

export default useMangeAssets;
