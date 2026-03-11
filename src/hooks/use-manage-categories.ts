"use client";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-toastify";
import { createCategorySchema } from "@/schemas";
import { ManageAssetCategoryService } from "@/services/manage-categories-assets-service copy";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { SubmitHandler } from "react-hook-form";
import {
  GET_ALL_ASSETS_CATEGORY,
  GET_CATEGORY_DETAILS,
} from "@/constants/query-keys";
import { useUser } from "./use-user";
import { AssetCategory } from "@/types/table-type";
import { v4 as uuidv4 } from "uuid";
import { createSubCategorySchema } from "@/schemas";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router";

const MODAL_TYPE = {
  CREATE_CATEGORY: "CREATE_CATEGORY",
  CREATE_SUB_CATEGORY: "CREATE_SUB_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",
};
const useMangeAssetsCategories = (id?: string | undefined) => {
  const { user } = useUser();
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  // useRoleAccess("manager");
  // const today = new Date().toISOString().split("T")[0]; // 👉 "YYYY-MM-DD"

  const [modalState, setModalState] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<AssetCategory | null>(null);
  const navigate = useNavigate()
  const queryClient = useQueryClient();
  const handleToggleModal = (
    modalState: string,
    data: AssetCategory | null
  ) => {
    if (modalState?.length === 0) {
      setOpen(false);
      return;
    }
    // sessionStorage.setItem("selectedAccount", JSON.stringify(data));
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
  const { setOnSearch, searchTerm, setSearchTerm } = useAppContext();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const manageAssetsCategory = new ManageAssetCategoryService(token);

  type FormFields = z.infer<typeof createCategorySchema>;

  type SubCategoryFormFields = z.infer<typeof createSubCategorySchema>;

  const subCategoryForm = useForm<SubCategoryFormFields>({
    resolver: zodResolver(createSubCategorySchema),
    defaultValues: { subCategoryName: "" },
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    setIsLoading(true);
    // const randomNumber = Math.floor(Math.random() * 10000) + 1;
    const identifier = uuidv4();

    try {
      const data = await manageAssetsCategory.createAssetCategory({
        id: identifier,
        name: values?.categoryName,
        created_by: user?.username,
        created_on: new Date(),
      });

      console.log(data);
      if (data.data?.code === 200) {
        toast.success(data.data.message);
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: [GET_ALL_ASSETS_CATEGORY] });
      }
      setIsLoading(false);
      return data;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      // toast.error(error?.response?.data?.message);
    }
  };

  const handleCreateSubCategory = async (values: SubCategoryFormFields) => {
    setIsLoading(true);
    const identifier = uuidv4();

    try {
      const data = await manageAssetsCategory.createSubCategory({
        id: identifier,
        name: values?.subCategoryName,
        // parent_category_id: parentCategoryId,
        created_by: user?.username,
        created_on: new Date(),
      });

      if (data.data?.code === 200) {
        toast.success(data.data.message);
        setOpen(false);

        // invalidate parent categories and subcategories if necessary
        queryClient.invalidateQueries({ queryKey: [GET_ALL_ASSETS_CATEGORY] });
        queryClient.invalidateQueries({ queryKey: [GET_CATEGORY_DETAILS, id] });

        // queryClient.invalidateQueries({ queryKey: [GET_ALL_ASSETS_SUBCATEGORY] });
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

  const handleDeleteCategory = async (id: string | undefined) => {
    setIsLoading(true);

    try {
      const data = await manageAssetsCategory.deleteAssetCategory(id);

      if (data.data?.code === 200) {
        toast.success(data.data.message);
        setOpen(false);
        navigate("/assetsCategories")
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: [GET_ALL_ASSETS_CATEGORY] });
        queryClient.invalidateQueries({ queryKey: [GET_CATEGORY_DETAILS, id] });
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
    resolver: zodResolver(createCategorySchema), // Dynamic schema
    defaultValues: {
      categoryName: "",
    },
  });

  const {
    data: allAssetsCategories,
    isLoading: allAssetsCategoriesLoading,
    error: allAssetsCategoriesError,
  } = useQuery({
    queryKey: [
      GET_ALL_ASSETS_CATEGORY,
      pageSize,
      currentPage,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await manageAssetsCategory.getAllAssetsCategories({
        pageSize,
        currentPage,
        searchTerm,
        dateRange: { startDate, endDate },
      });
      console.log(response);
      setTotalPages(response?.data?.totalPages);
      return response?.data.content;
    },
  });

  const {
    data: categoriesDetails,
    isLoading: categoriesDetailsLoading,
    error: categoriesDetailsError,
  } = useQuery({
    queryKey: [GET_CATEGORY_DETAILS, id],
    queryFn: async () => {
      const response = await manageAssetsCategory.getCategoriesDetails(id);
      console.log(response);
      return response?.data;
    },
    enabled: !!id,
  });
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
    onSubmit,
    errors,
    customerType,
    setCustomerType,
    isLoading,
    allAssetsCategoriesError,
    allAssetsCategoriesLoading,
    allAssetsCategories,
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
    categoriesDetails,
    categoriesDetailsLoading,
    subCategoryForm,
    handleCreateSubCategory,
    categoriesDetailsError,
    setTotalPages,
    totalPages,
    pageSize,
    setCurrentPage,
    currentPage,
    startDate,
    endDate,
    setPageSize,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    handleDeleteCategory,
  };
};

export default useMangeAssetsCategories;
