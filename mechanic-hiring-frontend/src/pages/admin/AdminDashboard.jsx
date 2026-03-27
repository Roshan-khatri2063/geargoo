import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUser,
  FaTools,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { toast } from "react-hot-toast";
import * as adminService from "../../services/adminService";
import paymentService from "../../services/paymentService";
import useDialog from "../../hooks/useDialog";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const [stats, setStats] = useState({
    users: 0,
    customers: 0,
    mechanics: 0,
    requests: 0,
    completed: 0,
  });
  const [pendingActions, setPendingActions] = useState({
    pendingMechanics: 0,
    pendingRequests: 0,
    stalePendingRequests: 0,
    unassignedRequests: 0,
  });
  const [range, setRange] = useState("all");
  const [jobsPerMonth, setJobsPerMonth] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({
    totalTransactions: 0,
    paidTransactions: 0,
    grossPaidAmount: 0,
    refundedAmount: 0,
  });
  const [refundingPaymentId, setRefundingPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await adminService.getDashboardStats({ range });
        const data = statsRes.data;

        setStats(
          data?.stats || {
            users: 0,
            customers: 0,
            mechanics: 0,
            requests: 0,
            completed: 0,
          },
        );
        setPendingActions(
          data?.pendingActions || {
            pendingMechanics: 0,
            pendingRequests: 0,
            stalePendingRequests: 0,
            unassignedRequests: 0,
          },
        );
        setJobsPerMonth(data?.jobsPerMonth || []);
      } catch (err) {
        console.error("Admin stats error", err);
        setStats({
          users: 0,
          customers: 0,
          mechanics: 0,
          requests: 0,
          completed: 0,
        });
        setPendingActions({
          pendingMechanics: 0,
          pendingRequests: 0,
          stalePendingRequests: 0,
          unassignedRequests: 0,
        });
        setJobsPerMonth([]);
      }

      try {
        const txRes = await paymentService.getAdminTransactions({ limit: 8 });
        const txData = txRes.data;
        setTransactions(txData?.transactions || []);
        setTransactionSummary(
          txData?.summary || {
            totalTransactions: 0,
            paidTransactions: 0,
            grossPaidAmount: 0,
            refundedAmount: 0,
          },
        );
      } catch (err) {
        console.error("Admin transactions error", err);
        setTransactions([]);
        setTransactionSummary({
          totalTransactions: 0,
          paidTransactions: 0,
          grossPaidAmount: 0,
          refundedAmount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const pieData = [
    { name: "Completed", value: stats.completed },
    { name: "Pending", value: stats.requests - stats.completed },
  ];

  const handleRefund = async (paymentId) => {
    if (!paymentId) return;
    const shouldRefund = await confirm({
      title: "Refund Payment",
      message:
        "This will mark the payment as refunded and update related statuses.",
      tone: "warning",
      confirmText: "Refund",
      cancelText: "Cancel",
    });
    if (!shouldRefund) return;
    try {
      setRefundingPaymentId(paymentId);
      await paymentService.refundPayment(paymentId, "Admin dashboard refund");
      toast.success("Payment refunded");
      const txRes = await paymentService.getAdminTransactions({ limit: 8 });
      setTransactions(txRes.data?.transactions || []);
      setTransactionSummary(
        txRes.data?.summary || {
          totalTransactions: 0,
          paidTransactions: 0,
          grossPaidAmount: 0,
          refundedAmount: 0,
        },
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Refund failed");
    } finally {
      setRefundingPaymentId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="range" className="text-sm text-gray-600">
            Time Range
          </label>
          <select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border rounded px-3 py-2 bg-white"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <button
          onClick={() => navigate("/admin/users")}
          className="bg-white shadow rounded p-6 flex items-center gap-4 text-left hover:shadow-md transition"
        >
          <FaUsers className="text-blue-600 text-3xl" />
          <div>
            <p className="text-gray-500">Total Users</p>
            <h2 className="text-xl font-bold">{stats.users}</h2>
          </div>
        </button>
        <button
          onClick={() => navigate("/admin/customers")}
          className="bg-white shadow rounded p-6 flex items-center gap-4 text-left hover:shadow-md transition"
        >
          <FaUser className="text-teal-600 text-3xl" />
          <div>
            <p className="text-gray-500">Total Customers</p>
            <h2 className="text-xl font-bold">{stats.customers}</h2>
          </div>
        </button>
        <button
          onClick={() => navigate("/admin/mechanics")}
          className="bg-white shadow rounded p-6 flex items-center gap-4 text-left hover:shadow-md transition"
        >
          <FaTools className="text-yellow-500 text-3xl" />
          <div>
            <p className="text-gray-500">Total Mechanics</p>
            <h2 className="text-xl font-bold">{stats.mechanics}</h2>
          </div>
        </button>
        <button
          onClick={() => navigate("/admin/requests")}
          className="bg-white shadow rounded p-6 flex items-center gap-4 text-left hover:shadow-md transition"
        >
          <FaClipboardList className="text-purple-600 text-3xl" />
          <div>
            <p className="text-gray-500">Total Requests</p>
            <h2 className="text-xl font-bold">{stats.requests}</h2>
          </div>
        </button>
        <button
          onClick={() => navigate("/admin/requests?status=Completed")}
          className="bg-white shadow rounded p-6 flex items-center gap-4 text-left hover:shadow-md transition"
        >
          <FaCheckCircle className="text-green-500 text-3xl" />
          <div>
            <p className="text-gray-500">Completed Jobs</p>
            <h2 className="text-xl font-bold">{stats.completed}</h2>
          </div>
        </button>
      </div>

      <div className="bg-white p-6 shadow rounded mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/mechanics?status=Pending")}
            className="border rounded p-4 text-left hover:bg-gray-50"
          >
            <p className="text-gray-500 text-sm">Pending Mechanics</p>
            <p className="text-2xl font-bold">
              {pendingActions.pendingMechanics}
            </p>
          </button>
          <button
            onClick={() => navigate("/admin/requests?status=Pending")}
            className="border rounded p-4 text-left hover:bg-gray-50"
          >
            <p className="text-gray-500 text-sm">Pending Requests</p>
            <p className="text-2xl font-bold">
              {pendingActions.pendingRequests}
            </p>
          </button>
          <button
            onClick={() => navigate("/admin/requests?status=Pending&stale=1")}
            className="border rounded p-4 text-left hover:bg-gray-50"
          >
            <p className="text-gray-500 text-sm">Stale Pending (48h+)</p>
            <p className="text-2xl font-bold">
              {pendingActions.stalePendingRequests}
            </p>
          </button>
          <button
            onClick={() => navigate("/admin/requests?unassigned=1")}
            className="border rounded p-4 text-left hover:bg-gray-50"
          >
            <p className="text-gray-500 text-sm">Unassigned Requests</p>
            <p className="text-2xl font-bold">
              {pendingActions.unassignedRequests}
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-2xl font-bold mb-4">Job Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-2xl font-bold mb-4">Jobs per Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobs" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 shadow rounded mt-8">
        <h2 className="text-2xl font-bold mb-4">Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="border rounded p-3">
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-xl font-bold">
              {transactionSummary.totalTransactions}
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="text-gray-500 text-sm">Paid</p>
            <p className="text-xl font-bold">
              {transactionSummary.paidTransactions}
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="text-gray-500 text-sm">Gross Paid</p>
            <p className="text-xl font-bold">
              Rs. {Number(transactionSummary.grossPaidAmount || 0).toFixed(2)}
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="text-gray-500 text-sm">Refunded</p>
            <p className="text-xl font-bold">
              Rs. {Number(transactionSummary.refundedAmount || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 border text-left">Payment ID</th>
                  <th className="px-3 py-2 border text-left">Request</th>
                  <th className="px-3 py-2 border text-left">Customer</th>
                  <th className="px-3 py-2 border text-left">Amount</th>
                  <th className="px-3 py-2 border text-left">Status</th>
                  <th className="px-3 py-2 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-3 py-2 border">{tx.id}</td>
                    <td className="px-3 py-2 border">{tx.requestId}</td>
                    <td className="px-3 py-2 border">
                      {tx.customerName || "-"}
                    </td>
                    <td className="px-3 py-2 border">
                      {Number(tx.amount || 0).toFixed(2)} {tx.currency || "NPR"}
                    </td>
                    <td className="px-3 py-2 border capitalize">{tx.status}</td>
                    <td className="px-3 py-2 border">
                      {String(tx.status || "").toLowerCase() === "paid" ? (
                        <button
                          onClick={() => handleRefund(tx.id)}
                          disabled={refundingPaymentId === tx.id}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-60"
                        >
                          {refundingPaymentId === tx.id
                            ? "Refunding..."
                            : "Refund"}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
