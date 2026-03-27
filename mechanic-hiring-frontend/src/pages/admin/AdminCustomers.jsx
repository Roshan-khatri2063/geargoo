import { useEffect, useState } from "react";
import * as adminService from "../../services/adminService";
import { toast } from "react-hot-toast";
import useDialog from "../../hooks/useDialog";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { confirm } = useDialog();

  const fetchCustomers = async () => {
    try {
      const res = await adminService.getCustomers();
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const deleteCustomer = async (id) => {
    const shouldDelete = await confirm({
      title: "Delete Customer",
      message:
        "This will remove the customer account and related requests. Continue?",
      tone: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!shouldDelete) return;

    try {
      await adminService.deleteUser(id);
      toast.success("Customer deleted successfully!");
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete customer");
    }
  };

  const updateActiveStatus = async (id, activeStatus) => {
    try {
      setUpdatingId(id);
      await adminService.updateCustomerActiveStatus(id, activeStatus);
      toast.success("Customer status updated");
      fetchCustomers();
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
      <h1 className="text-3xl font-bold mb-6">Manage Customers</h1>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Active Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-2 border">{customer.fullName}</td>
                  <td className="px-4 py-2 border">{customer.email}</td>
                  <td className="px-4 py-2 border">{customer.phone}</td>
                  <td className="px-4 py-2 border">{customer.role}</td>
                  <td className="px-4 py-2 border">
                    <select
                      value={customer.activeStatus || "active"}
                      disabled={updatingId === customer.id}
                      onChange={(e) =>
                        updateActiveStatus(customer.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => deleteCustomer(customer.id)}
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

export default AdminCustomers;
