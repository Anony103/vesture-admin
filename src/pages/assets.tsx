import { Container } from "../components/shared/container";
// import { useState } from "react";
// import { DataTable } from "../components/shared/data-table";
// import { AssetDataTable } from "../components/shared/data-table-assets";
import { ColumnDef } from "@tanstack/react-table";
import { AssetType } from "../types/table-type";
import { RowMenu } from "@/components/shared/row-menu";
import { useNavigate } from "react-router-dom";
import useMangeAssets from "@/hooks/use-manage-assests";
import { DataTable } from "@/components/shared/data-table";
import { formatWithCommas } from "@/utils/formatNumbers";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";

const Assets = () => {
  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("allcustomers");
  const {
    allAssetsLoading,
    allAssets,
    allAssetsError,
    currentPage,
    setCurrentPage,
    totalPages,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    setPageSize,
    pageSize,
    setSelectedAsset,
  } = useMangeAssets();
  const navigate = useNavigate();
  const columns: ColumnDef<AssetType>[] = [
    {
      id: "number",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "amount",
      header: () => <span>Amount</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return (
          <span className="inline-block w-full">
            ${formatWithCommas(value)}
          </span>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: () => <span>Asset Category</span>,
    },
    // {
    //   accessorKey: "updated_by",
    //   header: () => <span>Updated By</span>,
    // },
    {
      accessorKey: "created_on",
      header: () => <span>Created On</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <span className="inline-block w-full">
            {new Date(value).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "updated_on",
      header: () => <span>Updated On</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <span className="inline-block w-full">
            {new Date(value).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => (
        <RowMenu
          items={[
            { label: "View Details", to: `${row?.original.id}` },
            {
              label: "Edit Assets",
              separated: true,
              onSelect: () => {
                navigate("createassets");
                setSelectedAsset(row?.original);
                sessionStorage.setItem("selectedAsset", JSON.stringify(row?.original));
                sessionStorage.setItem("mode", "true");
              },
            },
          ]}
        />
      ),
    },
  ];

  console.log(allAssets);
  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className="flex justify-between">
          <div></div>
          <button
            onClick={() => {
              navigate("createassets");
              sessionStorage.removeItem("selectedAsset")
            }}
            className=" text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md"
          >
            Create Assets
          </button>
        </div>
        <div className=" bg-white rounded-lg  mt-2 pb-2">
          <div className="flex flex-row gap-6 p-6">
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
            <button
              // onClick={exportSavingsToExcel}
              // disabled={allSavingsLoading}
              className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md justify-end"
            >
              Export As Excel
            </button>
          </div>

          <div>
            {/* {allAssets?.length > 0 ? ( */}
            <DataTable
              data={allAssets}
              columns={columns}
              loading={allAssetsLoading}
              error={allAssetsError}
              useApiPagination={true}
              totalPages={totalPages || 1}
              currentPage={currentPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              setPageSize={setPageSize}
              pageSize={pageSize}
            />
            {/* ) : (
              ""
            )} */}
          </div>
        </div>
        <div></div>
      </article>
    </Container>
  );
};

export default Assets;
