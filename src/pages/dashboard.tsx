import { Container } from "../components/shared/container";
import DashboardCard from "../components/dashboard/DashboardCard";
// import { useRoleAccess } from "@/hooks";
import PieChartComp from "../components/dashboard/PieChart";
import BarChartComponent from "../components/dashboard/BarChart";
import { GroupData } from "../types";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
// import { users } from "../data/Datafortable";
import { User } from "../types";
import useDashboard from "@/hooks/use-dashboard";
import { Panel } from "@/components/shared/panel";
import { BarChart3, Gem, Layers, PieChart as PieChartIcon, TrendingUp, Users } from "lucide-react";
import { Tabs } from "@/data/ItemData";
const Dashboard = () => {
  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("all");
  const {
    allUsers,
    allUsersLoading,
    stats,
    statsLoading,
    monthlyTransaction,
    savingsPercentage,
    setMonth,
    displayTime,
    setDisplayTime,
    setCurrentPage,
    totalPages,
    // setTotalPages,
    currentPage,
    customerType,
    setPageSize,
    pageSize,
    setCustomerType,
  } = useDashboard();
  // const data: GroupData[] = [
  //   { id: 0, name: "Group A", value: 100 },
  //   { id: 1, name: "Group B", value: 300 },
  //   { id: 2, name: "Group C", value: 100 },
  // ];
  const chartData: GroupData[] = [
    { id: 0, name: "SmallVest", value: savingsPercentage?.sssPercentage },
    {
      id: 1,
      name: "Target Lock",
      value: savingsPercentage?.targetSavingsPercentage,
    },
    {
      id: 2,
      name: "Smart Lock",
      value: savingsPercentage?.smartLockPercentage,
    },
    { id: 3, name: "BNPL", value: savingsPercentage?.bnplPercentage },
  ];

  const columns: ColumnDef<User>[] = [
    {
      id: "number",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: ({ row }) => {
        const firstName = row.original.firstName as string;
        const lastName = row.original.lastName as string;
        const middleName = row.original.middleName as string;
        return (
          <span>{`${firstName || ""} ${middleName || ""} ${
            lastName || ""
          }`}</span>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <span>{row.original.email || row.original.username || "N/A"}</span>;
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      accessorKey: "bvn",
      header: "BVN",
    },
    {
      accessorKey: "organization",
      header: "Organization",
    },
    {
      accessorKey: "status",
      header: "Account Status",
      cell: ({ row }) => {
        const status = row?.original.status;

        // if (!isEnabled) return <span className="text-red-500">Disabled</span>;
        // if (!isLocked) return <span className="text-red-500">Locked</span>;
        if (status === "deactivated")
          return <span className="v-chip v-chip-bad">{status}</span>;
        if (status === "pending")
          return <span className="v-chip v-chip-warn">{status}</span>;
        return <span className="v-chip v-chip-ok">{status}</span>;
      },
    },
    {
      accessorKey: "created_on",
      header: "Registration Date",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    //  {
    //    accessorKey: "status",
    //    header: () => <span></span>,
    //    cell: ({ row }) => {
    //      console.log(row?.original);
    //      return (
    //        <div className="dropdown dropdown-end">
    //          <div tabIndex={0} className="p-0">
    //            <ActionIcon />
    //          </div>
    //          <ul
    //            tabIndex={0}
    //            className="dropdown-content text-left bg-[#4F4F4F] gap-y-2 cursor-pointer  rounded-md text-sm text-white z-[100] p-2 w-52  shadow"
    //          >
    //            {row?.original.status === "deactivated" ||
    //            row?.original.status === null ? (
    //              <li
    //                onClick={() =>
    //                  handleToggleModal(
    //                    MODAL_TYPE.ACTIVATE_CUSTOMER,
    //                    row?.original
    //                  )
    //                }
    //              >
    //                <a>Activate</a>
    //              </li>
    //            ) : (
    //              ""
    //            )}

    //            {row?.original.status === "ACTIVE" ||
    //            row?.original.status === null ? (
    //              <li
    //                onClick={() =>
    //                  handleToggleModal(
    //                    MODAL_TYPE.DEACTIVATE_CUSTOMER,
    //                    row?.original
    //                  )
    //                }
    //              >
    //                <a>DeActivate</a>
    //              </li>
    //            ) : (
    //              ""
    //            )}
    //          </ul>
    //        </div>
    //      );
    //    },
    //  },
  ];
  const options = [
    { title: "This Week", value: "this-week" },
    { title: "This Month", value: "this-month" },
    { title: "This Year", value: "this-year" },
  ];

  // one colour per product, in the order of chartData above
  const productColors = ["var(--brand)", "var(--mint)", "rgb(var(--sky-rgb))", "var(--gold)"];

  const transactions = monthlyTransaction ?? [];
  const volume = transactions.reduce(
    (sum: number, row: { totalAmount: number }) => sum + (Number(row.totalAmount) || 0),
    0
  );
  const peak = transactions.reduce(
    (best: { month: string; totalAmount: number } | null, row: { month: string; totalAmount: number }) =>
      !best || row.totalAmount > best.totalAmount ? row : best,
    null
  );
  const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
  const noInvestmentData = chartData.every((item) => !item.value);

  return (
    <Container>
      <article className="min-h-screen space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Investment"
            amount={stats?.totalSavings}
            icon={TrendingUp}
            accent="164 92 255"
            to="/savings/all"
            loading={statsLoading}
            delay={0}
          />
          <DashboardCard
            title="Customers"
            amount={stats?.totalCustomers}
            icon={Users}
            accent="53 224 194"
            to="/customers"
            loading={statsLoading}
            delay={70}
          />
          <DashboardCard
            title="Assets"
            amount={stats?.totalAssets}
            icon={Gem}
            accent="96 165 250"
            to="/assets"
            loading={statsLoading}
            delay={140}
          />
          <DashboardCard
            title="Categories"
            amount={stats?.totalAssetCategories}
            icon={Layers}
            accent="255 181 71"
            to="/assetsCategories"
            loading={statsLoading}
            delay={210}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          <Panel
            className="xl:col-span-2"
            delay={280}
            title="Investment mix"
            subtitle="Share of each product"
            action={
              <div className="v-seg" role="group" aria-label="Period">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={displayTime.toLowerCase() === option.title.toLowerCase()}
                    onClick={() => {
                      setMonth(option.value);
                      setDisplayTime(option.title);
                    }}
                  >
                    {option.title.replace("This ", "")}
                  </button>
                ))}
              </div>
            }
          >
            {noInvestmentData ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-panel-hi text-fg3">
                  <PieChartIcon size={22} />
                </span>
                <p className="text-sm font-semibold">No investments in this period</p>
                <p className="text-xs text-fg3">Try a wider period.</p>
              </div>
            ) : (
              <PieChartComp data={chartData} colors={productColors} />
            )}
          </Panel>

          <Panel
            className="xl:col-span-3"
            delay={350}
            title="Transactions"
            subtitle="Volume by month"
            action={
              transactions.length > 0 && (
                <div className="flex gap-5 text-right">
                  <div>
                    <p className="v-eyebrow">Total</p>
                    <p className="v-mono text-sm font-semibold">₦{compact.format(volume)}</p>
                  </div>
                  {peak && (
                    <div>
                      <p className="v-eyebrow">Peak</p>
                      <p className="text-sm font-semibold">{peak.month}</p>
                    </div>
                  )}
                </div>
              )
            }
          >
            <div className="h-[260px] min-w-0">
              {transactions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-panel-hi text-fg3">
                    <BarChart3 size={22} />
                  </span>
                  <p className="text-sm font-semibold">No transactions yet</p>
                </div>
              ) : (
                <BarChartComponent data={transactions} />
              )}
            </div>
          </Panel>
        </div>

        <Panel
          delay={420}
          title="Customers"
          subtitle="Newest registrations"
          action={
            <div className="v-seg" role="group" aria-label="Customer filter">
              {Tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={customerType === tab.value}
                  onClick={() => setCustomerType(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
        >
          <DataTable
            data={allUsers}
            loading={allUsersLoading}
            columns={columns}
            useApiPagination={true}
            totalPages={totalPages || 1}
            currentPage={currentPage}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            setPageSize={setPageSize}
            pageSize={pageSize}
            boxed
          />
        </Panel>
      </article>
    </Container>
  );
};

export default Dashboard;
