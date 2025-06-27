import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { UserProvider } from "./context/UserContext";
import { CategoryProvider } from "./components/Dashboard/Masters/Categories/CategoryContext";
import { VendorProvider } from "./components/Dashboard/Masters/Vendors/VendorContext";

// Lazy loaded components
const AuthForm = lazy(() => import("./components/AuthForm"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const OtpVerification = lazy(() => import("./components/OtpVerification"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

// Dashboard Layout
const DashboardLayout = lazy(() =>
  import("./components/Dashboard/DashboardLayout")
);
const AdminDashboard = lazy(() =>
  import("./components/Dashboard/AdminDashboard")
);

// Sales
const SalesAdd = lazy(() => import("./components/Dashboard/Sales/SalesAdd"));
const PrintInvoice = lazy(() =>
  import("./components/Dashboard/Sales/PrintInvoice")
);
const SalesList = lazy(() => import("./components/Dashboard/Sales/SalesList"));
const SalesOrderEdit = lazy(() =>
  import("./components/Dashboard/Sales/SalesOrderEdit")
);
const PaymentIn = lazy(() => import("./components/Dashboard/Sales/PaymentIn"));
const AddPaymentIn = lazy(() =>
  import("./components/Dashboard/Sales/AddPaymentIn")
);
const PaymentDetails = lazy(() =>
  import("./components/Dashboard/Sales/PaymentDetails")
);
const SalesOrderReport = lazy(() =>
  import("./components/Dashboard/Sales/SalesOrderReport")
);

// Profile
const ViewProfile = lazy(() =>
  import("./components/Dashboard/Profile/ViewProfile")
);
const EditProfile = lazy(() =>
  import("./components/Dashboard/Profile/EditProfile")
);
const AccountSettings = lazy(() =>
  import("./components/Dashboard/Profile/AccountSettings")
);
const ProfileSettings = lazy(() =>
  import("./components/Dashboard/Profile/ProfileSettings")
);

// Categories
const AddCategory = lazy(() =>
  import("./components/Dashboard/Masters/Categories/AddCategory")
);
const CategoryList = lazy(() =>
  import("./components/Dashboard/Masters/Categories/CategoryList")
);
const EditCategory = lazy(() =>
  import("./components/Dashboard/Masters/Categories/EditCategory")
);

// Products
const ProductList = lazy(() =>
  import("./components/Dashboard/Masters/Products/ProductList")
);
const AddProduct = lazy(() =>
  import("./components/Dashboard/Masters/Products/AddProduct")
);
const ProductExcel = lazy(() =>
  import("./components/Dashboard/Masters/Products/ProductExcel")
);
const EditProduct = lazy(() =>
  import("./components/Dashboard/Masters/Products/EditProduct")
);

// Customers
const CustomerList = lazy(() =>
  import("./components/Dashboard/Masters/Customers/CustomerList")
);
const AddCustomer = lazy(() =>
  import("./components/Dashboard/Masters/Customers/AddCustomer")
);
const EditCustomer = lazy(() =>
  import("./components/Dashboard/Masters/Customers/EditCustomer")
);
const CustomerDetailsWrapper = lazy(() =>
  import("./components/Dashboard/Masters/Customers/CustomerDetailsWrapper")
);
const CustomerManager = lazy(() =>
  import("./components/Dashboard/Masters/Customers/CustomerManager")
);

// Vendors
const VendorList = lazy(() =>
  import("./components/Dashboard/Masters/Vendors/VendorList")
);
const AddVendor = lazy(() =>
  import("./components/Dashboard/Masters/Vendors/AddVendor")
);

// Expenses
const ExpenseList = lazy(() =>
  import("./components/Dashboard/Expenses/ExpenseList")
);
const AddExpense = lazy(() =>
  import("./components/Dashboard/Expenses/AddExpense")
);
const EditExpense = lazy(() =>
  import("./components/Dashboard/Expenses/EditExpense")
);
const ExpensesReport = lazy(() =>
  import("./components/Dashboard/Expenses/ExpensesReport")
);

// Staff
const AddStaff = lazy(() => import("./components/Staff/AddStaff"));
const ViewStaff = lazy(() => import("./components/Staff/ViewStaff"));
const StaffPage = lazy(() => import("./components/Staff/StaffPage"));

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {}; // ✅ FIX

    setIsLoggedIn(loggedIn);
    setRole(localStorage.getItem("role") || currentUser.user_type || "");
    setAuthChecked(true);
  }, []);

  const handleLogin = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {}; // ✅ FIX

    setIsLoggedIn(true);
    setRole(localStorage.getItem("role") || currentUser.user_type || "");
    navigate("/dashboard/admin-dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <UserProvider>
      <CategoryProvider>
        <VendorProvider>
          {authChecked && (
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="/login"
                  element={<AuthForm onLogin={handleLogin} />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<OtpVerification />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/print-invoice"
                  element={isLoggedIn ? <PrintInvoice /> : <Navigate to="/" />}
                />
                <Route
                  path="/sales/billing"
                  element={isLoggedIn ? <SalesAdd /> : <Navigate to="/" />}
                />

                {/* Protected Dashboard */}
                <Route
                  path="/dashboard/*"
                  element={
                    isLoggedIn ? (
                      <DashboardLayout onLogout={handleLogout} />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                >
                  <Route index element={<Navigate to="admin-dashboard" />} />
                  <Route path="admin-dashboard" element={<AdminDashboard />} />

                  {role === "superadmin" && (
                    <>
                      {/* Profile */}
                      <Route path="profile/view" element={<ViewProfile />} />
                      <Route path="profile/edit" element={<EditProfile />} />
                      <Route
                        path="profile/settings"
                        element={<AccountSettings />}
                      />
                      <Route
                        path="profile/profile-settings"
                        element={<ProfileSettings />}
                      />

                      {/* Masters - Categories */}
                      <Route
                        path="masters/categories"
                        element={<CategoryList />}
                      />
                      <Route
                        path="masters/categories/add"
                        element={<AddCategory />}
                      />
                      <Route
                        path="masters/categories/edit/:id"
                        element={<EditCategory />}
                      />

                      {/* Masters - Products */}
                      <Route
                        path="masters/products"
                        element={<ProductList />}
                      />
                      <Route
                        path="masters/products/add"
                        element={<AddProduct />}
                      />
                      <Route
                        path="masters/products/excel-import"
                        element={<ProductExcel />}
                      />
                      <Route
                        path="masters/products/edit/:id"
                        element={<EditProduct />}
                      />

                      {/* Masters - Customers */}
                      <Route
                        path="masters/customers"
                        element={<CustomerManager />}
                      >
                        <Route index element={<Navigate to="list" />} />
                        <Route path="list" element={<CustomerList />} />
                        <Route path="add" element={<AddCustomer />} />
                        <Route
                          path="edit/:customerId"
                          element={<EditCustomer />}
                        />
                        <Route
                          path="details/:customerName"
                          element={<CustomerDetailsWrapper />}
                        />
                      </Route>

                      {/* Masters - Vendors */}
                      <Route
                        path="masters/vendors/list"
                        element={<VendorList />}
                      />
                      <Route
                        path="masters/vendors/add"
                        element={<AddVendor />}
                      />

                      {/* Sales */}
                      <Route path="sales/list" element={<SalesList />} />
                      <Route
                        path="sales/edit/:invoiceNumber"
                        element={<SalesOrderEdit />}
                      />
                      <Route path="sales/payment-in" element={<PaymentIn />} />
                      <Route
                        path="sales/payment-in/add"
                        element={<AddPaymentIn />}
                      />
                      <Route
                        path="sales/payment-in/details/:customerName"
                        element={<PaymentDetails />}
                      />
                      <Route
                        path="sales/print-invoice/:invoiceNo"
                        element={<PrintInvoice />}
                      />

                      {/* Reports */}
                      <Route
                        path="reports/sales"
                        element={<SalesOrderReport />}
                      />

                      {/* Expenses */}
                      <Route path="expenses" element={<ExpenseList />} />
                      <Route path="expenses/add" element={<AddExpense />} />
                      <Route
                        path="expenses/edit/:id"
                        element={<EditExpense />}
                      />
                      <Route
                        path="expenses/report"
                        element={<ExpensesReport />}
                      />

                      {/* Staff */}
                      <Route path="staff" element={<StaffPage />} />
                      <Route path="staff/add" element={<AddStaff />} />
                      <Route path="staff/view" element={<ViewStaff />} />
                    </>
                  )}

                  {/* Worker-only Access */}
                  {role === "staff" && (
                    <>
                      <Route path="sales/add" element={<SalesAdd />} />
                    </>
                  )}

                  <Route
                    path="*"
                    element={<div>Dashboard Page Not Found</div>}
                  />
                </Route>

                {/* Global fallback */}
                <Route path="*" element={<div>404 Page Not Found</div>} />
              </Routes>
            </Suspense>
          )}
          <ToastContainer position="top-right" autoClose={3000} />
        </VendorProvider>
      </CategoryProvider>
    </UserProvider>
  );
}

export default App;
