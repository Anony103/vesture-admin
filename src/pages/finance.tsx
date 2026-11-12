import { useState } from "react";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import useFinance from "@/hooks/use-finance";
import { Tabs } from "@/components/shared/tabs";
import { StatCard, StatGrid } from "@/components/shared/stat-card";

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
    header: () => <span>Investment Type</span>,
    cell: ({ getValue }) => {
      const value = (getValue() as string) ?? "";
      return <span className="inline-block capitalize">{value}</span>;
    },
  },
  {
    accessorKey: "savingsId",
    header: () => <span>Investment ID</span>,
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
          <div className="px-5 pt-5 pb-3">
            <h2 className="font-display text-xl font-semibold">Finance Overview</h2>
            <p className="mt-1 text-sm text-fg2">
              Monitor running investments and interest payment history.
            </p>
          </div>

          {/* Tabs */}
          <div className="px-5 pb-1">
            <Tabs
              tabs={[
                { value: "investments", label: "Running Investments" },
                { value: "interest", label: "Interest Payments" },
              ]}
              value={activeTab}
              onChange={(value) => setActiveTab(value as "investments" | "interest")}
            />
          </div>

          {/* Running Investments Tab */}
          {activeTab === "investments" && (
            <div className="px-4 pt-4">
              {/* Summary Cards */}
              {!runningInvestmentsLoading && (
                <StatGrid className="mb-4">
                  <StatCard label="Total Investments" tone="brand" value={investmentsSummary.totalCount} />
                  <StatCard label="Total Principal" tone="sky" value={formatCurrency(investmentsSummary.totalPrincipal)} />
                  <StatCard label="Accrued Interest" tone="mint" value={formatCurrency(investmentsSummary.totalAccruedInterest)} />
                  <StatCard label="Total Liability" tone="gold" value={formatCurrency(investmentsSummary.totalLiability)} />
                </StatGrid>
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
                boxed
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
                boxed
              />
            </div>
          )}
        </div>
      </article>
    </Container>
  );
};

export default Finance;
