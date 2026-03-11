import { Container } from "../components/shared/container";
// import { useState } from "react";
import { DataTable } from "../components/shared/data-table";
// import { AssetDataTable } from "../components/shared/data-table-assets";
import { ColumnDef } from "@tanstack/react-table";
// import { AssetType } from "../types/table-type";
// import { ActionIcon } from "../components/svg-icons/action-icon";
// import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { DataTable } from "@/components/shared/data-table";
// import { formatWithCommas } from "@/utils/formatNumbers";
import { RateType } from "@/types/table-type";
import useMangeInterestRates from "@/hooks/use-manage-interest-rates";

const InterestRates = () => {
  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("allcustomers");
  const {
    allRatesError,
    allRatesLoading,
    allRates,
    currentPage,
    setCurrentPage,
    totalPages,
    setPageSize,
    pageSize
  } = useMangeInterestRates();
  const navigate = useNavigate();

  // Utility function to format numbers with commas (if not already defined)
  // const formatWithCommas = (value: number) =>
  //   value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const columns: ColumnDef<RateType>[] = [
    {
      id: "number",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "savingsType",
      header: "Name",
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "N/A";
        return <span className="inline-block w-full">{value}</span>;
      },
    },
    {
      accessorKey: "annualRate",
      header: () => <span>Annual Rate</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return <span className="inline-block w-full">{value.toFixed(2)}%</span>;
      },
    },
    {
      accessorKey: "active",
      header: () => <span>Status</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as boolean) ?? false;
        return (
          <div>
            {value ? (
              <span className="inline-block text-[#2C9720] capitalize">
                Active
              </span>
            ) : (
              <span className="inline-block text-[#E70E02] capitalize">
                Inactive
              </span>
            )}
          </div>
        );
      },
    },
   
    // {
    //   accessorKey: "createdBy",
    //   header: () => <span>Created By</span>,
    //   cell: ({ getValue }) => {
    //     const value = (getValue() as string) ?? "N/A";
    //     return <span className="inline-block w-full">{value}</span>;
    //   },
    // },
    {
      accessorKey: "createdOn",
      header: () => <span>Created On</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <span className="inline-block w-full">
            {value ? new Date(value).toLocaleDateString() : "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "updatedOn",
      header: () => <span>Updated On</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <span className="inline-block w-full">
            {value ? new Date(value).toLocaleDateString() : "N/A"}
          </span>
        );
      },
    },
    // {
    //   accessorKey: "id",
    //   header: () => <span></span>,
    //   cell: () => {
    //     // const id = (getValue() as string) ?? "";
    //     return (
    //       <div className="dropdown dropdown-end">
    //         <div tabIndex={0} className="p-0 cursor-pointer">
    //           <ActionIcon />
    //         </div>
    //         <ul
    //           tabIndex={0}
    //           className="dropdown-content text-left bg-[#4F4F4F] rounded-md text-sm text-white z-[1] w-52 shadow"
    //         >
    //           {/* <li className="py-2 pl-3 cursor-pointer">
    //             <Link to={`details/${id}`}>View Details</Link>
    //           </li> */}
    //           <li className="border-t-[1px] cursor-pointer border-t-white py-2 pl-3">
    //             <a>Deactivate</a>
    //           </li>
    //         </ul>
    //       </div>
    //     );
    //   },
    // },
  ];

  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className="flex justify-between">
          <div></div>
          <button
            onClick={() => {
              navigate("createRates");
            }}
            className=" text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md"
          >
            Create Interest Rates
          </button>
        </div>
        <div className=" bg-white rounded-lg  mt-2 pb-2">
          <div>
            <DataTable
              data={allRates}
              columns={columns}
              loading={allRatesLoading}
              error={allRatesError}
              useApiPagination={true}
              totalPages={totalPages || 1}
              currentPage={currentPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              pageSize={pageSize}
              setPageSize = {setPageSize}
            />
          </div>
        </div>
        <div></div>
      </article>
    </Container>
  );
};

export default InterestRates;
