import { useState, useEffect } from "react";
import mechanicService from "../../services/mechanicService";
import requestService from "../../services/requestService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ServiceRequest = () => {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState([]);
  const [form, setForm] = useState({
    service: "",
    mechanicId: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await mechanicService.getAllMechanics();
        setMechanics(res || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchMechanics();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mechanicId) return toast.error("Please select a mechanic");
    if (!user?.id) return toast.error("Please log in again");
    try {
      await requestService.createRequest({ ...form, customerId: user.id });
      toast.success("Service request created successfully!");
      navigate("/customer/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create request");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Service Request</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="service"
          placeholder="Service Name"
          value={form.service}
          onChange={handleChange}
          className="border rounded px-4 py-2"
          required
        />
        <select
          name="mechanicId"
          value={form.mechanicId}
          onChange={handleChange}
          className="border rounded px-4 py-2"
          required
        >
          <option value="">Select Mechanic</option>
          {mechanics.map((mech) => (
            <option key={mech.id} value={mech.id}>
              {mech.name} - {(mech.specialization || []).join(", ")}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="border rounded px-4 py-2"
          required
        />
        <textarea
          name="description"
          placeholder="Describe the issue"
          value={form.description}
          onChange={handleChange}
          className="border rounded px-4 py-2 h-32"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default ServiceRequest;
