import { Container } from "../components/shared/container";
// import { useRoleAccess } from "@/hooks";
// import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
// import { User } from "../types/table-type";
import { AssetCategory } from "@/types/table-type";
import { ActionIcon } from "../components/svg-icons/action-icon";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import useMangeAssetsCategories from "@/hooks/use-manage-categories";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
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
const Categories = () => {
  // useRoleAccess("manager");

  const {
    allAssetsCategoriesLoading,
    allAssetsCategoriesError,
    allAssetsCategories,
    register,
    onSubmit,
    handleSubmit,
    isLoading,
    open,
    errors,
    MODAL_TYPE,
    handleToggleModal,
    handleClose,
    modalState,
    totalPages,
    setCurrentPage,
    currentPage,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    setPageSize,
    pageSize,
  } = useMangeAssetsCategories();

  const columns: ColumnDef<AssetCategory>[] = [
    {
      id: "number",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "created_by",
      header: "Created By",
    },
    {
      accessorKey: "updated_by",
      header: "Updated By",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return <span className="inline-block w-full">{value ?? "N/A"}</span>;
      },
    },

    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className="inline-block w-full">
            {new Date(value).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "updated_on",
      header: "Updated On",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className="inline-block w-full">
            {new Date(value).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const id = row?.original.id;
        return (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="p-0 cursor-pointer">
              <ActionIcon />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content text-left bg-[#4F4F4F] rounded-md text-sm text-white z-[1] w-52 shadow"
            >
              <li className="py-2 pl-3 cursor-pointer">
                <Link to={`${id}`}>View Details</Link>
              </li>
              {/* <li className="border-t-[1px] cursor-pointer border-t-white py-2 pl-3">
                <a>Deactivate</a>
              </li> */}
            </ul>
          </div>
        );
      },
    },
  ];
  return (
    <Container>
      <article className=" min-h-screen  mt-6">
        <div className="w-[100%] flex flex-row justify-between">
          <div></div>
          <div>
            <button
              onClick={() =>
                handleToggleModal(MODAL_TYPE.CREATE_CATEGORY, null)
              }
              className=" text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md"
            >
              Create Categories
            </button>
          </div>
        </div>
        <div className=" bg-white mt-2 rounded-md pb-2">
          <div className="flex flex-col md:flex-row  items-center gap-3 px-2 py-4 border-b">
            <div className="flex flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-row justify-end p-6">
              <button
                // onClick={exportTransactionsToExcel}
                disabled={allAssetsCategoriesLoading}
                className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md justify-end"
              >
                Export as Excel
              </button>
            </div>
          </div>
          <div>
            <DataTable
              data={allAssetsCategories}
              columns={columns}
              loading={allAssetsCategoriesLoading}
              error={allAssetsCategoriesError}
              useApiPagination={true}
              totalPages={totalPages || 1}
              currentPage={currentPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              setPageSize={setPageSize}
              pageSize={pageSize}
            />
          </div>
        </div>
      </article>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h1 className="font-bold text-medium">Create Category</h1>
          {modalState === MODAL_TYPE.CREATE_CATEGORY ? (
            <div className="flex flex-col gap-5 mt-3">
              <form
                className="flex flex-col gap-5"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-1">
                  <Input
                    label="Category Name"
                    id="categoryName"
                    placeholder="Enter category name"
                    type="text"
                    {...register("categoryName")}
                    error={errors.categoryName?.message} // Pass the error message
                    className="bg-transparent text-xs border border-gray-300 h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className=" text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md hover:opacity-8"
                  >
                    {isLoading ? (
                      <ClipLoader color="white" size="20" />
                    ) : (
                      "Create Category"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            ""
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default Categories;
