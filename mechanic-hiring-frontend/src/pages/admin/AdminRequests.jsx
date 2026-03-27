import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as adminService from "../../services/adminService";
import { toast } from "react-hot-toast";
import useDialog from "../../hooks/useDialog";

const AdminRequests = () => {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useDialog();

  const fetchRequests = async () => {
    try {
      const res = await adminService.getRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusFilter = searchParams.get("status");
  const staleOnly = searchParams.get("stale") === "1";
  const unassignedOnly = searchParams.get("unassigned") === "1";

  const filteredRequests = requests.filter((request) => {
    const requestStatus = String(request.status || "").toLowerCase();

    if (statusFilter && requestStatus !== String(statusFilter).toLowerCase()) {
      return false;
    }

    if (unassignedOnly && String(request.mechanicName || "").trim()) {
      return false;
    }

    if (staleOnly) {
      const createdAt = request.createdAt ? new Date(request.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
      const hours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hours < 48) return false;
    }

    return true;
  });

  const deleteRequest = async (id) => {
    const shouldDelete = await confirm({
      title: "Delete Service Request",
      message: "This request will be permanently deleted. Continue?",
      tone: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!shouldDelete) return;
    try {
      await adminService.deleteRequest(id);
      toast.success("Request deleted successfully!");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete request");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Service Requests</h1>
      {filteredRequests.length === 0 ? (
        <p>No service requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Service</th>
                <th className="px-4 py-2 border">Customer</th>
                <th className="px-4 py-2 border">Mechanic</th>
                <th className="px-4 py-2 border">Location</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 border">{r.service}</td>
                  <td className="px-4 py-2 border">{r.customerName}</td>
                  <td className="px-4 py-2 border">{r.mechanicName}</td>
                  <td className="px-4 py-2 border">{r.location}</td>
                  <td className="px-4 py-2 border">{r.status}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => deleteRequest(r.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
