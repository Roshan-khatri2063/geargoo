import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { DialogProvider } from "./context/DialogContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Services from "./pages/public/Services";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import MechanicsList from "./pages/customer/MechanicsList";
import HireMechanic from "./pages/customer/HireMechanics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminMechanics from "./pages/admin/AdminMechanics";
import AdminRequests from "./pages/admin/AdminRequests";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/Profile";
import ServiceRequest from "./pages/customer/ServiceRequest";
import JobTracking from "./pages/customer/JobTracking";
import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
import MechanicProfile from "./pages/mechanic/MechanicProfile";
import MechanicJobs from "./pages/mechanic/MechanicJobs";
import MechanicEarnings from "./pages/mechanic/MechanicEarnings";

function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <Router>
          <Toaster
            position="top-right"
            gutter={12}
            toastOptions={{
              duration: 3600,
              style: {
                background:
                  "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))",
                color: "#e2e8f0",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                borderRadius: "14px",
                boxShadow: "0 20px 45px rgba(2, 6, 23, 0.5)",
                backdropFilter: "blur(10px)",
                fontWeight: "600",
                padding: "12px 14px",
              },
              success: {
                iconTheme: {
                  primary: "#34d399",
                  secondary: "#042f2e",
                },
              },
              error: {
                iconTheme: {
                  primary: "#fb7185",
                  secondary: "#3f0d16",
                },
              },
            }}
          />

          <Routes>
            {/* Public routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/hire-mechanics" element={<MechanicsList />} />
              <Route path="/hire-mechanic/:id" element={<HireMechanic />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route element={<DashboardLayout />}>
              {/* Admin */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/mechanics" element={<AdminMechanics />} />
              <Route path="/admin/requests" element={<AdminRequests />} />

              {/* Customer */}
              <Route
                path="/customer/dashboard"
                element={<CustomerDashboard />}
              />
              <Route path="/customer/profile" element={<CustomerProfile />} />
              <Route
                path="/customer/request-service"
                element={<ServiceRequest />}
              />
              <Route path="/customer/job-tracking" element={<JobTracking />} />

              {/* Mechanic */}
              <Route
                path="/mechanic/dashboard"
                element={<MechanicDashboard />}
              />
              <Route path="/mechanic/profile" element={<MechanicProfile />} />
              <Route path="/mechanic/jobs" element={<MechanicJobs />} />
              <Route path="/mechanic/earnings" element={<MechanicEarnings />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </DialogProvider>
    </AuthProvider>
  );
}

export default App;
