import { useState } from "react";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import useFinance from "@/hooks/use-finance";

type Investment = {
  id: string;
  type: string;
  name: string;
  userId: string;
  principal: number;
  interestRate: number;
  interestBalance: number;
  withholdingTax: number;
  maturityDate: string;
  status: string;
  createdOn: string;
};

type InterestPayment = {
  id: string;
  savingsId: string;
  savingsType: string;
  userId: string;
  principalAmount: number;
  interestRate: number;
  interestAmount: number;
  newBalance: number;
  applicationMonth: string;
  appliedOn: string;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return "₦0.00";
  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const investmentColumns: ColumnDef<Investment>[] = [
  {
    id: "number",
    header: "S/N",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "type",
    header: () => <span>Type</span>,
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "";
      return <span className="inline-block capitalize">{value}</span>;
    },
  },
  {
    accessorKey: "name",
    header: () => <span>Investment Name</span>,
  },
  {
    accessorKey: "userId",
    header: () => <span>User ID</span>,
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "";
      return (
        <span className="inline-block truncate max-w-[120px]" title={value}>
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: "principal",
    header: () => <span>Principal</span>,
    cell: ({ getValue }) => {
      return <span>{formatCurrency(getValue() as number)}</span>;
    },
  },
  {
    accessorKey: "interestRate",
    header: () => <span>Interest Rate</span>,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span>{value != null ? `${value}%` : "-"}</span>;
    },
  },
  {
    accessorKey: "interestBalance",
    header: () => <span>Accrued Interest</span>,
    cell: ({ getValue }) => {
      return <span>{formatCurrency(getValue() as number)}</span>;
    },
  },
  {
    accessorKey: "withholdingTax",
    header: () => <span>WHT</span>,
    cell: ({ getValue }) => {
      return <span>{formatCurrency(getValue() as number)}</span>;
    },
  },
  {
    accessorKey: "maturityDate",
    header: () => <span>Maturity Date</span>,
    cell: ({ getValue }) => {
      return <span>{formatDate(getValue() as string)}</span>;
    },
  },
  {
    accessorKey: "status",
    header: () => <span>Status</span>,
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "";
      return (
        <span
          className={`inline-block capitalize px-2 py-0.5 rounded-full text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {value}
        </span>
      );
    },
  },
];

const interestPaymentColumns: ColumnDef<InterestPayment>[] = [
  {
    id: "number",
    header: "S/N",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "savingsType",
    header: () => <span>Savings Type</span>,
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "";
      return <span className="inline-block capitalize">{value}</span>;
    },
  },
  {
    accessorKey: "savingsId",
    header: () => <span>Savings ID</span>,
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "";
      return (
        <span className="inline-block truncate max-w-[120px]" title={value}>
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: "userId",
    header: () => <span>User ID</span>,
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "";
      return (
        <span className="inline-block truncate max-w-[120px]" title={value}>
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: "principalAmount",
    header: () => <span>Principal</span>,
    cell: ({ getValue }) => {
      return <span>{formatCurrency(getValue() as number)}</span>;
    },
  },
  {
    accessorKey: "interestRate",
    header: () => <span>Interest Rate</span>,
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span>{value != null ? `${value}%` : "-"}</span>;
    },
  },
  {
    accessorKey: "interestAmount",
    header: () => <span>Interest Amount</span>,
    cell: ({ getValue }) => {
      return <span>{formatCurrency(getValue() as number)}</span>;
    },
  },
  {
    accessorKey: "newBalance",
    header: () => <span>New Balance</span>,
    cell: ({ getValue }) => {
      return <span>{formatCurrency(getValue() as number)}</span>;
    },
  },
  {
    accessorKey: "applicationMonth",
    header: () => <span>Month</span>,
  },
  {
    accessorKey: "appliedOn",
    header: () => <span>Applied On</span>,
    cell: ({ getValue }) => {
      return <span>{formatDate(getValue() as string)}</span>;
    },
  },
];

const Finance = () => {
  const [activeTab, setActiveTab] = useState<"investments" | "interest">(
    "investments"
  );

  const {
    investments,
    investmentsSummary,
    runningInvestmentsLoading,
    runningInvestmentsError,
    investmentsPage,
    setInvestmentsPage,
    investmentsPageSize,
    setInvestmentsPageSize,
    interestPayments,
    interestTotalPages,
    interestPaymentsLoading,
    interestPaymentsError,
    interestPage,
    setInterestPage,
    interestPageSize,
    setInterestPageSize,
  } = useFinance();

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="bg-white rounded-md pb-4">
          {/* Page Header */}
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-xl font-semibold text-gray-800">Finance Overview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitor running investments and interest payment history.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-row gap-8 text-sm text-[#6D6C6C] px-6 border-b border-gray-100">
            <button
              className={`pb-3 ${
                activeTab === "investments"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              }`}
              onClick={() => setActiveTab("investments")}
            >
              Running Investments
            </button>
            <button
              className={`pb-3 ${
                activeTab === "interest"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              }`}
              onClick={() => setActiveTab("interest")}
            >
              Interest Payments
            </button>
          </div>

          {/* Running Investments Tab */}
          {activeTab === "investments" && (
            <div className="px-4 pt-4">
              {/* Summary Cards */}
              {!runningInvestmentsLoading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Investments</p>
                    <p className="text-lg font-bold text-[#7C2EBF]">
                      {investmentsSummary.totalCount}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Principal</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(investmentsSummary.totalPrincipal)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Accrued Interest</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(investmentsSummary.totalAccruedInterest)}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Liability</p>
                    <p className="text-lg font-bold text-orange-700">
                      {formatCurrency(investmentsSummary.totalLiability)}
                    </p>
                  </div>
                </div>
              )}

              <DataTable
                data={investments as Investment[]}
                columns={investmentColumns}
                loading={runningInvestmentsLoading}
                error={runningInvestmentsError as Error | null}
                useApiPagination={true}
                totalPages={Math.ceil(
                  investmentsSummary.totalCount / investmentsPageSize
                ) || 1}
                currentPage={investmentsPage}
                onPageChange={setInvestmentsPage}
                pageSize={investmentsPageSize}
                setPageSize={setInvestmentsPageSize}
              />
            </div>
          )}

          {/* Interest Payments Tab */}
          {activeTab === "interest" && (
            <div className="px-4 pt-4">
              <DataTable
                data={interestPayments as InterestPayment[]}
                columns={interestPaymentColumns}
                loading={interestPaymentsLoading}
                error={interestPaymentsError as Error | null}
                useApiPagination={true}
                totalPages={interestTotalPages}
                currentPage={interestPage}
                onPageChange={setInterestPage}
                pageSize={interestPageSize}
                setPageSize={setInterestPageSize}
              />
            </div>
          )}
        </div>
      </article>
    </Container>
  );
};

export default Finance;
