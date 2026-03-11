// export const tabs = [
//   { id: "allcustomers", label: "All Customers" },
//   { id: "pendingApproval", label: "Pending Approval" },
//   { id: "approved", label: "Approved" },
//   { id: "decline", label: "Decline" },
// ];

type CustomerType = "all" | "ACTIVE" | "deactivated" | "pending";

interface Tab {
  label: string;
  value: CustomerType;
}
export const Tabs: Tab[] = [
  { label: "All Customers", value: "all" },
  // { label: "Pending Approval", value: "pending" },
  { label: "Approved", value: "ACTIVE" },
  { label: "Deactivated", value: "deactivated" },
];
