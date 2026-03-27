import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import mechanicService from "../../services/mechanicService";

const MechanicsList = () => {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await mechanicService.getAllMechanics();
        setMechanics(res.data || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMechanics();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading mechanics...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Available Mechanics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.map((mechanic) => (
          <div
            key={mechanic.id}
            className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-bold text-slate-900">
              {mechanic.name}
            </h2>
            <p className="text-gray-600">
              {Array.isArray(mechanic.specialization) &&
              mechanic.specialization.length
                ? mechanic.specialization.join(", ")
                : "General Repairs"}
            </p>
            <p className="text-sm text-gray-500">
              Experience:{" "}
              {mechanic.experience
                ? `${mechanic.experience} years`
                : "Not specified"}
            </p>
            <p className="text-sm text-gray-500">
              Location: {mechanic.location || "Location not specified"}
            </p>
            <Link
              to={`/hire-mechanic/${mechanic.id}`}
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Hire Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MechanicsList;
