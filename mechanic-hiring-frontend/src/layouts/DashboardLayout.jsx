import { Outlet, Navigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // If not logged in → redirect
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* Role-based menu */}
        {user.role === "admin" && (
          <>
            <Link
              to="/admin/dashboard"
              className="block mb-3 hover:text-gray-300"
            >
              Dashboard
            </Link>
            <Link to="/admin/users" className="block mb-3 hover:text-gray-300">
              Users
            </Link>
            <Link
              to="/admin/customers"
              className="block mb-3 hover:text-gray-300"
            >
              Customers
            </Link>
            <Link
              to="/admin/mechanics"
              className="block mb-3 hover:text-gray-300"
            >
              Mechanics
            </Link>
            <Link
              to="/admin/requests"
              className="block mb-3 hover:text-gray-300"
            >
              Requests
            </Link>
          </>
        )}

        {user.role === "customer" && (
          <>
            <Link
              to="/customer/dashboard"
              className="block mb-3 hover:text-gray-300"
            >
              Dashboard
            </Link>
            <Link
              to="/customer/request-service"
              className="block mb-3 hover:text-gray-300"
            >
              Request Service
            </Link>
            <Link
              to="/customer/job-tracking"
              className="block mb-3 hover:text-gray-300"
            >
              Job Tracking
            </Link>
            <Link
              to="/customer/profile"
              className="block mb-3 hover:text-gray-300"
            >
              Profile
            </Link>
          </>
        )}

        {user.role === "mechanic" && (
          <>
            <Link
              to="/mechanic/dashboard"
              className="block mb-3 hover:text-gray-300"
            >
              Dashboard
            </Link>
            <Link
              to="/mechanic/jobs"
              className="block mb-3 hover:text-gray-300"
            >
              Jobs
            </Link>
            <Link
              to="/mechanic/earnings"
              className="block mb-3 hover:text-gray-300"
            >
              Earnings
            </Link>
            <Link
              to="/mechanic/profile"
              className="block mb-3 hover:text-gray-300"
            >
              Profile
            </Link>
          </>
        )}

        <button
          onClick={logout}
          className="mt-6 bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
