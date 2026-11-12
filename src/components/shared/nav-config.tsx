import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BadgeCheck,
  BadgePercent,
  Building2,
  DatabaseZap,
  FlaskConical,
  Gem,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Layers,
  PiggyBank,
  Percent,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Webhook,
} from "lucide-react";
import { useStagingFundingStatus } from "@/hooks/use-staging-funding";

/** Sidebar widths in px: wide with labels, and the narrow icon rail. */
export const SIDEBAR_WIDTH = { expanded: 248, rail: 68 } as const;

export type NavItem = {
  id: string;
  title: string;
  /** where the link goes */
  path: string;
  /** the page counts as "this item" for any address that starts with this (defaults to path) */
  activePrefix?: string;
  icon: LucideIcon;
};

export type NavGroup = { label: string; items: NavItem[] };

/** The admin's navigation, in the order and grouping the sidebar shows it. Also what names the page in the top bar. */
export const useNavGroups = (): NavGroup[] => {
  // only staging, and only a super admin, is told this exists
  const stagingFunding = useStagingFundingStatus();

  return [
    {
      label: "Overview",
      items: [{ id: "1", title: "Dashboard", path: "/", icon: LayoutDashboard }],
    },
    {
      label: "People",
      items: [
        { id: "2", title: "Customers", path: "/customers", icon: Users },
        { id: "16", title: "KYC", path: "/kyc", icon: BadgeCheck },
        { id: "3", title: "Manage Admins", path: "/manageAdmins", icon: ShieldCheck },
      ],
    },
    {
      label: "Products",
      items: [
        { id: "4", title: "Investment", path: "/savings/all", activePrefix: "/savings", icon: TrendingUp },
        { id: "5", title: "Assets Categories", path: "/assetsCategories", icon: Layers },
        { id: "6", title: "Assets", path: "/assets", icon: Gem },
        { id: "8", title: "Interest Rates", path: "/interestRates", icon: Percent },
      ],
    },
    {
      label: "Money",
      items: [
        { id: "13", title: "Finance", path: "/finance", icon: Landmark },
        { id: "10", title: "Transaction History", path: "/transactions", icon: Receipt },
        { id: "14", title: "LMS Transfers", path: "/lmsTransfers", icon: ArrowLeftRight },
        { id: "7", title: "Public Sector Credit Entry", path: "/creditEntry", icon: Building2 },
        { id: "21", title: "Withdrawal Payouts", path: "/withdrawalPayouts", icon: HandCoins },
        { id: "20", title: "Deposit Fees", path: "/depositFees", icon: BadgePercent },
        { id: "19", title: "Auto-save", path: "/autoSave", icon: PiggyBank },
      ],
    },
    {
      label: "Monitoring",
      items: [
        { id: "17", title: "Webhook Log", path: "/webhookLogs", icon: Webhook },
        { id: "11", title: "Audit Log", path: "/auditLog", icon: ScrollText },
        { id: "9", title: "Data Refresh", path: "/employeeInfo", icon: DatabaseZap },
        ...(stagingFunding.enabled
          ? [{ id: "18", title: "Test Funding", path: "/stagingFunding", icon: FlaskConical }]
          : []),
      ],
    },
    {
      label: "System",
      items: [{ id: "12", title: "Settings", path: "/settings", icon: Settings }],
    },
    // Ledger is switched off for now. To bring it back, add { title: "Ledger", path: "/ledger" } to a group here, plus the
    // "/ledger" route and the LedgerPage import in App.tsx.
  ];
};

/** Is this address the page of that menu item? */
export const isItemActive = (item: NavItem, pathname: string): boolean => {
  if (item.path === "/") {
    return pathname === "/" || pathname === "/dashboard";
  }
  const prefix = item.activePrefix ?? item.path;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};
