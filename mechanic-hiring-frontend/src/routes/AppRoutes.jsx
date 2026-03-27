import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import MechanicsList from "../pages/customer/MechanicsList";
import HireMechanics from "../pages/customer/HireMechanics";
import MechanicDashboard from "../pages/mechanic/MechanicDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Home from "../pages/public/Home";
import Services from "../pages/public/Services";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import ProtectedRoute from "../components/common/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="home" element={<Home />} />
      <Route path="services" element={<Services />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="hire-mechanic" element={<MechanicsList />} />
      <Route path="hire-mechanic/:id" element={<HireMechanics />} />
    </Route>

    <Route path="/customer/*" element={
      <ProtectedRoute role="customer">
        <DashboardLayout>
          <Routes>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="mechanics" element={<MechanicsList />} />
          </Routes>
        </DashboardLayout>
      </ProtectedRoute>
    } />

    <Route path="/mechanic/*" element={
      <ProtectedRoute role="mechanic">
        <DashboardLayout>
          <MechanicDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    } />

    <Route path="/admin/*" element={
      <ProtectedRoute role="admin">
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    } />

    <Route path="/unauthorized" element={<p>Not authorized</p>} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;