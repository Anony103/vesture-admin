import { Container } from "../components/shared/container";
// import { useState } from "react";
// import { useRoleAccess } from "@/hooks";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";

// import { ActionIcon } from "../components/svg-icons/action-icon";
import useAudits from "@/hooks/use-audit";
import { LogEntry } from "../types/table-type";

const AuditLogs = () => {
  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("allcustomers");
  const {
    auditLogs,
    auditLogsError,
    auditLogsLoading,
    totalPages,
    currentPage,
    setCurrentPage,
    exportAuditsToExcel,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setPageSize,
    handleEndDateChange,
    handleStartDateChange,
    pageSize
  } = useAudits();

  const columns: ColumnDef<LogEntry>[] = [
    {
      id: "number",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },

    {
      accessorKey: "username",
      header: "User",
      cell: ({ getValue }) => (getValue() as string) ?? "System",
    },

    {
      accessorKey: "action",
      header: "Action",
    },

    {
      accessorKey: "endpointResource",
      header: "Endpoint",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? (
          <span className="truncate max-w-[200px]" title={value}>
            {value}
          </span>
        ) : (
          "-"
        );
      },
    },

    {
      accessorKey: "httpMethod",
      header: "Method",
      cell: ({ getValue }) => {
        const method = getValue() as string | null;
        if (!method) return "-";

        const color =
          method === "GET"
            ? "text-green-600"
            : method === "POST"
            ? "text-blue-600"
            : method === "DELETE"
            ? "text-red-600"
            : "text-gray-600";

        return <span className={`font-medium ${color}`}>{method}</span>;
      },
    },

    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ getValue }) => (getValue() as string) ?? "-",
    },

    {
      accessorKey: "requestPayload",
      header: "Request",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? (
          <span className="truncate max-w-[220px]" title={value}>
            {value}
          </span>
        ) : (
          "-"
        );
      },
    },

    {
      accessorKey: "responsePayload",
      header: "Response",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? (
          <span className="truncate max-w-[220px]" title={value}>
            {value}
          </span>
        ) : (
          "-"
        );
      },
    },

    {
      accessorKey: "correlationId",
      header: "Correlation ID",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? (
          <span className="truncate max-w-[180px]" title={value}>
            {value}
          </span>
        ) : (
          "-"
        );
      },
    },

    {
      accessorKey: "success",
      header: "Status",
      cell: ({ getValue }) => {
        const value = getValue() as boolean;
        return (
          <span
            className={`px-2 py-1 rounded-md text-sm font-medium ${
              value ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
            }`}
          >
            {value ? "Success" : "Failed"}
          </span>
        );
      },
    },

    {
      accessorKey: "errorMessage",
      header: "Error",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? (
          <span className="truncate max-w-[200px] text-red-600" title={value}>
            {value}
          </span>
        ) : (
          "-"
        );
      },
    },

    {
      accessorKey: "createdOn",
      header: "Date",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleString();
      },
    },
  ];

  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className=" bg-white  rounded-md pb-2">
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
              All Customers{" "}
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
              Pending Approval{" "}
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
              Approved
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
              Decline
            </p>
          </div> */}
          {/* {customerType === "allcustomers" ? (
            <div> */}{" "}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-2 py-4 border-b">
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
                onClick={exportAuditsToExcel}
                disabled={auditLogsLoading}
                className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md justify-end"
              >
                Export As Excel
              </button>
            </div>
          </div>
          <DataTable
            data={auditLogs}
            columns={columns}
            loading={auditLogsLoading}
            error={auditLogsError}
            useApiPagination={true}
            totalPages={totalPages || 1}
            currentPage={currentPage}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            setPageSize={setPageSize}
            pageSize={pageSize}
          />
          {/* <DataTable data={auditLogs} columns={columns} /> */}
        </div>
        {/* ) :(
            ""
          )} */}
        {/* </div> */}
        <div></div>
      </article>
    </Container>
  );
};

export default AuditLogs;
