import { lazy, Suspense } from "react";
import { PageLoader } from "../components/shared/page-loader";

// lazy page imports
// login components
const LoginComponent = lazy(() => import("./login"));
// main components
const DashboardComponent = lazy(() => import("./dashboard"));
const CustomerComponent = lazy(() => import("./customers"));
const SettingsComponent = lazy(() => import("./settings"));
const ViewCategoriesComp = lazy(() => import("./viewcategories"));
const CategoriesComp = lazy(() => import("./categories"));
const ViewAssetsComp = lazy(() => import("./viewassets"));
const RatesComp = lazy(() => import("./interestRates"));
const CreateRatesComp = lazy(() => import("./createRates"));
const EmployeeInfoComp = lazy(() => import("./employeeInformation"));
const CreateEmployeeInfoComp = lazy(() => import("./createEmployeeInfo"));
const ViewSavings = lazy(() => import("./viewSavings"));
const ChangePasswordComp = lazy(() => import("./changePassword"))
const ForgotPasswordComp = lazy(() => import("./forgotPassword") )





// suspense exports

// Login Pages
export const LoginPage = () => (
  <Suspense fallback={<PageLoader />}>
    <LoginComponent />
  </Suspense>
);
export const ChangePasswordPage = () => (
  <Suspense fallback={<PageLoader />}>
    <ChangePasswordComp />
  </Suspense>
);
export const ForgotPasswordPage = () => (
  <Suspense fallback={<PageLoader />}>
    <ForgotPasswordComp />
  </Suspense>
);

export const LoginSalesPersonPage = () => (
  <Suspense fallback={<PageLoader />}>
    {/* <LoginSalesPersonComponent /> */}
  </Suspense>
);

// Signup Page

// main pages
export const DashboardPage = () => (
  <Suspense fallback={<PageLoader />}>
    <DashboardComponent />
  </Suspense>
);

export const CustomerPage = () => (
  <Suspense fallback={<PageLoader />}>
    <CustomerComponent />
  </Suspense>
);
export const SettingsPage = () => {
  <Suspense fallback={<PageLoader />}>
    <SettingsComponent />
  </Suspense>;
};
export const CategoriesPage = () => {
  <Suspense fallback={<PageLoader />}>
    <CategoriesComp />
  </Suspense>;
};
export const RatesPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <RatesComp />
    </Suspense>
  );
};

export const CreateRatesPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <CreateRatesComp />
    </Suspense>
  );
};

export const EmployeeInfoPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <EmployeeInfoComp />
    </Suspense>
  );
};

export const CreateEmployeeInfoPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <CreateEmployeeInfoComp />
    </Suspense>
  );
};


export const VeiwCategoriesPage = () => {
  <Suspense fallback={<PageLoader />}>
    <ViewCategoriesComp />
  </Suspense>;
};
export const VeiwAssetsPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <ViewAssetsComp />
    </Suspense>
  );
};

export const ViewSavingsPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <ViewSavings />
    </Suspense>
  );
};
