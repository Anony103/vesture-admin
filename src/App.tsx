import "./App.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import {
  DashboardPage,
  CustomerPage,
  RatesPage,
  CreateRatesPage,
  EmployeeInfoPage,
  CreateEmployeeInfoPage,
  ViewSavingsPage,
  ChangePasswordPage,
  ForgotPasswordPage,
  FinancePage,
  LmsTransfersPage,
} from "./pages";
import Admin from "./pages/admin";

import Login from "./pages/login";
import Categories from "./pages/categories";
import Savings from "./pages/savings";
import Assets from "./pages/assets";
import CreditEntry from "./pages/creditentry";
import Transactions from "./pages/transactions";
import AuditLogs from "./pages/auditLogs";
import Settings from "./pages/settings";
import VeiwCategoriesPage from "./pages/viewcategories";
import {
  MainLayout,
  AuthLayout,
  CategoriesLayout,
  AssetsLayout,
  RatesLayout,
  CreditEntryLayout,
  EmployeeInfoLayout,
} from "./layouts";
import ViewAssets from "./pages/viewassets";
import Createassets from "./pages/createassets";
import CreateCredit from "./pages/createCreditentry";

function App() {
  const router = createHashRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/",
          element: <DashboardPage />,
        },
        {
          path: "/customers",
          element: <CustomerPage />,
        },
        {
          path: "/manageAdmins",
          element: <Admin />,
        },
        {
          path: "savings",
          // element: <Savings />,
          children: [
            {
              path: "all",
              element: <Savings />,
            },
            {
              path: ":id",
              element: <ViewSavingsPage />,
            },
          ],
        },
        {
          path: "assetsCategories",
          element: <CategoriesLayout />,
          children: [
            {
              index: true,
              element: <Categories />,
            },
            {
              path: ":id",
              element: <VeiwCategoriesPage />,
            },
          ],
        },
        {
          path: "/assets",
          element: <AssetsLayout />,
          children: [
            {
              index: true,
              element: <Assets />,
            },
            {
              path: ":id",
              element: <ViewAssets />,
            },
            {
              path: "createassets",
              element: <Createassets />,
            },
          ],
        },
        {
          path: "/interestRates",
          element: <RatesLayout />,
          children: [
            {
              index: true,
              element: <RatesPage />,
            },
            {
              path: "details",
              element: <ViewAssets />,
            },
            {
              path: "createRates",
              element: <CreateRatesPage />,
            },
          ],
        },
        {
          path: "/creditEntry",
          element: <CreditEntryLayout />,
          children: [
            {
              index: true,
              element: <CreditEntry />,
            },
            {
              path: "createcredit",
              element: <CreateCredit />,
            },
          ],
        },
        {
          path: "/employeeInfo",
          element: <EmployeeInfoLayout />,
          children: [
            {
              index: true,
              element: <EmployeeInfoPage />,
            },
            {
              path: "createEmployees",
              element: <CreateEmployeeInfoPage />,
            },
          ],
        },
   
        {
          path: "/finance",
          element: <FinancePage />,
        },
        {
          path: "/lmsTransfers",
          element: <LmsTransfersPage />,
        },
        {
          path: "/transactions",
          element: <Transactions />,
        },
        {
          path: "/auditLog",
          element: <AuditLogs />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
      ],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          index: true,
          element: <Login />,
        },
        {
          path: "changePassword",
          element: <ChangePasswordPage />,
        },
        {
          path: "forgotPassword/:token",
          element: <ForgotPasswordPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
