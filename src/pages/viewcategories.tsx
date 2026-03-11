import { ReactElement, useState } from "react";
import { Container } from "../components/shared/container";
import { IoIosArrowBack } from "react-icons/io";
// import { ActionIcon } from "../components/svg-icons/action-icon";
import { Input } from "@/components/ui/input";
// import { Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/shared/data-table";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useNavigate } from "react-router-dom";
import useMangeAssetsCategories from "@/hooks/use-manage-categories";
import { AssetType } from "../types/table-type";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 1,
  boxShadow: 24,
  p: 2,
};
function ViewCategories(): ReactElement {
  const [customerType, setCustomerType] = useState("assets");
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    categoriesDetails,
    categoriesDetailsLoading,
    categoriesDetailsError,
    // register,
    // onSubmit,
    // handleSubmit,
    // isLoading,
    open,
    // errors,
    MODAL_TYPE,
    handleToggleModal,
    handleClose,
    subCategoryForm,
    handleCreateSubCategory,
    handleDeleteCategory,
    setPageSize,
    isLoading,
    modalState,
  } = useMangeAssetsCategories(id);
  console.log(categoriesDetails);

  const assetColumns: ColumnDef<AssetType>[] = [
    {
      accessorKey: "name",
      header: "Asset Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "amount",
      header: "Price",
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return <span>₦{value?.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "initialAmount",
      header: "Initial Payment",
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        return <span>{value ? `₦${value.toLocaleString()}` : "—"}</span>;
      },
    },
    {
      accessorKey: "maxTenor",
      header: "Max Tenor",
      cell: ({ getValue }) => <span>{getValue<number>()} months</span>,
    },
    {
      accessorKey: "availableUnits",
      header: "Units Left",
    },
    {
      accessorKey: "created_on",
      header: "Date Created",
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>());
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
  ];
  return (
    <Container>
      <div className="min-h-screen">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div
              onClick={() => {
                navigate(-1);
              }}
              className="flex gap-2 items-center text-xs"
            >
              <IoIosArrowBack />
              Back
            </div>
            {/* <button
              onClick={() =>
                handleToggleModal(MODAL_TYPE.CREATE_SUB_CATEGORY, null)
              }
              className=" text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md"
            >
              Create Sub Category
            </button> */}
          </div>
          <div className="bg-white md:h-[150px] rounded p-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex flex-col gap-4">
              <h1 className="text-lg font-bold">
                {categoriesDetails?.name || ""}
              </h1>
              <div className="flex gap-2 text-xs">
                {/* <p className="text-[#7C2EBF]">Deactivate</p> */}
                <p
                  className="text-[#E70E02] cursor-pointer"
                  onClick={() =>
                    handleToggleModal(MODAL_TYPE.DELETE_CATEGORY, null)
                  }
                >
                  Delete
                </p>
              </div>
            </div>
            <div className="flex gap-8 w-[100%] md:w-[30%] mt-4 md:mt-0">
              <div className="h-full bg-[#F6EBFE] py-8 px-2 gap-2 flex flex-col text-center justify-center items-center rounded-md w-[50%]">
                {categoriesDetailsLoading ? (
                  <ClipLoader size="10px" />
                ) : (
                  categoriesDetails?.assets?.length
                )}
                <p className="text-[#8D8D8D] text-xs">Sub Categories</p>
              </div>
              <div className="h-full bg-[#F6EBFE] py-8 px-2 gap-2 flex flex-col text-center justify-center items-center rounded-md w-[50%]">
                <p className="text-[#7C2EBF] text-medium font-bold">
                  {categoriesDetailsLoading ? (
                    <ClipLoader size="10px" />
                  ) : (
                    categoriesDetails?.assets?.length
                  )}
                </p>
                <p className="text-[#8D8D8D] text-xs">Assets</p>
              </div>
            </div>
          </div>
          <div className=" bg-white ">
            <div className="flex flex-row  gap-10 text-xs text-[#6D6C6C] pt-6 px-2">
              {/* <p
                className={`${
                  customerType === "subCategories"
                    ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                    : ""
                } mx-2 pb-6`}
                onClick={() => {
                  setCustomerType("subCategories");
                }}
              >
                Sub Categories{" "}
              </p> */}
              <p
                className={`${
                  customerType === "assets"
                    ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                    : ""
                } mx-2 pb-6`}
                onClick={() => {
                  setCustomerType("assets");
                }}
              >
                {" "}
                Assets{" "}
              </p>
            </div>
            {customerType ? (
              <div>
                <DataTable
                  data={categoriesDetails?.assets}
                  columns={assetColumns}
                  loading={categoriesDetailsLoading}
                  error={categoriesDetailsError}
                  setPageSize={setPageSize}
                />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* <h1 className="font-bold text-medium mb-2">Create Sub Category</h1> */}

          {/* Subcategory Form */}

          {modalState === MODAL_TYPE.CREATE_SUB_CATEGORY && (
            <>
              <h1 className="font-bold text-medium mb-2">
                Create Sub Category
              </h1>

              <form
                onSubmit={subCategoryForm.handleSubmit(handleCreateSubCategory)}
                className="flex flex-col gap-5 mt-3"
              >
                <Input
                  label="Sub Category Name"
                  placeholder="Enter sub category name"
                  {...subCategoryForm.register("subCategoryName")}
                  error={
                    subCategoryForm.formState.errors.subCategoryName?.message
                  }
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-xs bg-[#7C2EBF] py-3 text-white rounded-md"
                >
                  {isLoading ? "Creating..." : "Create Sub Category"}
                </button>
              </form>
            </>
          )}
          {modalState === MODAL_TYPE.DELETE_CATEGORY && (
            <>
              <h1 className="font-bold text-medium mb-3 text-red-600">
                Delete Category
              </h1>

              <p className="text-xs text-gray-600 mb-4">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="text-xs px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDeleteCategory(id)}
                  disabled={isLoading}
                  className="text-xs px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default ViewCategories;
