import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as adminService from "../../services/adminService";
import { toast } from "react-hot-toast";
import useDialog from "../../hooks/useDialog";

const AdminMechanics = () => {
  const [searchParams] = useSearchParams();
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { confirm } = useDialog();

  const fetchMechanics = async () => {
    try {
      const res = await adminService.getMechanics();
      setMechanics(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const statusFilter = searchParams.get("status");
  const filteredMechanics = mechanics.filter((mechanic) => {
    if (!statusFilter) return true;
    return (
      String(mechanic.status || "").toLowerCase() ===
      String(statusFilter).toLowerCase()
    );
  });

  const approveMechanic = async (id) => {
    try {
      await adminService.approveMechanic(id);
      toast.success("Mechanic approved successfully!");
      fetchMechanics();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve mechanic");
    }
  };

  const deleteMechanic = async (id) => {
    const shouldDelete = await confirm({
      title: "Delete Mechanic",
      message:
        "This will delete mechanic profile, account data, and related requests.",
      tone: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!shouldDelete) return;
    try {
      await adminService.deleteUser(id);
      toast.success("Mechanic deleted successfully!");
      fetchMechanics();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete mechanic");
    }
  };

  const updateActiveStatus = async (id, activeStatus) => {
    try {
      setUpdatingId(id);
      await adminService.updateMechanicActiveStatus(id, activeStatus);
      toast.success("Mechanic status updated");
      fetchMechanics();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Mechanics</h1>
      {filteredMechanics.length === 0 ? (
        <p>No mechanics found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Skills</th>
                <th className="px-4 py-2 border">Experience</th>
                <th className="px-4 py-2 border">Availability</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Active Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMechanics.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 border">{m.fullName}</td>
                  <td className="px-4 py-2 border">{m.email}</td>
                  <td className="px-4 py-2 border">
                    {m.skills?.length ? m.skills.join(", ") : "Not set"}
                  </td>
                  <td className="px-4 py-2 border">
                    {m.experience || "Not set"}
                  </td>
                  <td className="px-4 py-2 border">{m.availability}</td>
                  <td className="px-4 py-2 border">{m.status || "Pending"}</td>
                  <td className="px-4 py-2 border">
                    <select
                      value={m.activeStatus || "active"}
                      disabled={updatingId === m.id}
                      onChange={(e) => updateActiveStatus(m.id, e.target.value)}
                      className="border rounded px-2 py-1 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border flex gap-2">
                    {m.status !== "Approved" && (
                      <button
                        onClick={() => approveMechanic(m.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => deleteMechanic(m.id)}
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

export default AdminMechanics;
