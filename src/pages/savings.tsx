import { Tabs } from "@/components/shared/tabs";
import { Container } from "../components/shared/container";
// import { useRoleAccess } from "@/hooks";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SavingsType } from "@/types/table-type";
// import { ActionIcon } from "../components/svg-icons/action-icon";
import useMangeSavings from "@/hooks/use-manage-savings";
import { SavingstabItems } from "@/data/tabData";
import { productLabel } from "@/utils/productLabel";

const Savings = () => {
  // useRoleAccess("manager");
  const {
    allSavings,
    customerType,
    setCustomerType,
    currentPage,
    setCurrentPage,
    totalPages,
    // setTotalPages,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    allSavingsError,
    allSavingsLoading,
    exportSavingsToExcel,
    setPageSize,
    pageSize,
  } = useMangeSavings();
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
      header: () => <span>Investment Name</span>,
    },
    {
      accessorKey: "product.productName",
      header: () => <span>Product Name</span>,
      cell: ({ getValue }) => {
        const value = productLabel(getValue() as string);
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
        return <span className="inline-block w-full">₦{value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
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
      <article className=" min-h-screen  mt-6">
        <div className=" bg-white rounded-md pb-2">
          {/* <div className="flex flex-row  gap-10 text-xs text-[#6D6C6C] pt-6 px-2">
            <p
              className={`${
                customerType === "allcustomers"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("allcustomers");
              }}
            >
              All{" "}
            </p>
            <p
              className={`${
                customerType === "pendingApproval"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("pendingApproval");
              }}
            >
              {" "}
              Regular{" "}
            </p>
            <p
              className={`${
                customerType === "approved"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("approved");
              }}
            >
              Target
            </p>
            <p
              className={`${
                customerType === "decline"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("decline");
              }}
            >
              Asset Finance
            </p>
          </div> */}
          <div className="flex flex-row justify-between p-6">
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
              onClick={exportSavingsToExcel}
              disabled={allSavingsLoading}
              className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md justify-end"
            >
              Export As Excel
            </button>
          </div>

          <div className="px-4 pt-4 sm:px-6">
            <Tabs
              tabs={SavingstabItems.map((tab) => ({ value: tab.id, label: tab.label }))}
              value={customerType}
              onChange={setCustomerType}
              label="Investment type"
            />
          </div>

          <div>
            <DataTable
              data={allSavings}
              columns={columns}
              loading={allSavingsLoading}
              useApiPagination={true}
              totalPages={totalPages || 1}
              currentPage={currentPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              setPageSize={setPageSize}
              pageSize={pageSize}
              error={allSavingsError}
            />
          </div>
        </div>
        <div></div>
      </article>
    </Container>
  );
};

export default Savings;
