import { ReactElement } from "react";
import { Container } from "../components/shared/container";
import { IoIosArrowBack } from "react-icons/io";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/shared/data-table";

import { useNavigate } from "react-router-dom";
// import useMangeAssetsCategories from "@/hooks/use-manage-categories";
import { SavingsType } from "../types/table-type";
import { useParams } from "react-router-dom";
// import { ClipLoader } from "react-spinners";
import useMangeSavings from "@/hooks/use-manage-savings";
// const style = {
//   position: "absolute" as const,
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   borderRadius: 1,
//   boxShadow: 24,
//   p: 2,
// };
function ViewSavings(): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams();

  const { setPageSize, userSavings, usersSavingsError, userSavingsLoading } =
    useMangeSavings(id);

  const columns: ColumnDef<SavingsType>[] = [
     {
       id: "number",
       header: "S/N",
       cell: ({ row }) => row.index + 1,
     },
     {
       accessorKey: "user",
       header: () => <span>User</span>,
       cell: ({ getValue }) => {
         const value = (getValue() as string) ?? "";
         return <span className="inline-block w-full">{value}</span>;
       },
     },
     {
       accessorKey: "name",
       header: () => <span>Savings Name</span>,
     },
     {
       accessorKey: "product.productName",
       header: () => <span>Product Name</span>,
       cell: ({ getValue }) => {
         const value = (getValue() as string) ?? "";
         return <span className="inline-block w-full">{value}</span>;
       },
     },
     {
       accessorKey: "product.productCode",
       header: () => <span>Product Code</span>,
     },
     {
       accessorKey: "amount",
       header: () => <span>Amount</span>,
       cell: ({ getValue }) => {
         const value = (getValue() as number) ?? 0;
         return <span className="inline-block w-full">${value.toFixed(2)}</span>;
       },
     },
     {
       accessorKey: "tenor",
       header: () => <span>Tenor</span>,
       cell: ({ getValue }) => {
         const value = (getValue() as string | null) ?? "N/A";
         return <span className="inline-block w-full">{value}</span>;
       },
     },
     {
       accessorKey: "status",
       header: () => <span>Status</span>,
       cell: ({ getValue }) => {
         const value = (getValue() as string) ?? "";
         return (
           <div>
             {value === "active" ? (
               <span className="inline-block text-[#2C9720] capitalize">
                 {value}
               </span>
             ) : value === "inactive" ? (
               <span className="inline-block text-[#E70E02] capitalize">
                 {value}
               </span>
             ) : (
               <span className="inline-block capitalize">{value}</span>
             )}
           </div>
         );
       },
     },
      {
      accessorKey: "frequency",
      header: () => <span>Frequency</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return <span className="inline-block w-full">{value}</span>;
      },
    },
    {
      accessorKey: "currentBalance",
      header: () => <span>Current Balance</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return <span className="inline-block w-full">{value}</span>;
      },
    },
     // {
     //   accessorKey: "id",
     //   header: () => <span></span>,
     //   cell: () => {
     //     return (
     //       <div>
     //         <ActionIcon />
     //       </div>
     //     );
     //   },
     // },
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
          </div>
          <div className="bg-white">
            <div>
              <DataTable
                data={userSavings}
                columns={columns}
                loading={userSavingsLoading}
                error={usersSavingsError}
                setPageSize={setPageSize}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h1 className="font-bold text-medium mb-2">Create Sub Category</h1>

          Subcategory Form

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
      </Modal> */}
    </Container>
  );
}

export default ViewSavings;
