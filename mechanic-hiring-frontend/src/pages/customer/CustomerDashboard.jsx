import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import mechanicService from "../../services/mechanicService";
import MechanicCard from "../../components/cards/MechanicCard";
import Loader from "../../components/common/Loader";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMechanics, setFilteredMechanics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMechanics();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMechanics(mechanics);
    } else {
      setFilteredMechanics(
        mechanics.filter(
          (m) =>
            String(m.name || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (Array.isArray(m.specialization) ? m.specialization : []).some(
              (s) => String(s).toLowerCase().includes(searchTerm.toLowerCase()),
            ) ||
            String(m.location || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, mechanics]);

  const fetchMechanics = async () => {
    try {
      const mechanicsList = await mechanicService.getAllMechanics();
      setMechanics(Array.isArray(mechanicsList) ? mechanicsList : []);
      setFilteredMechanics(Array.isArray(mechanicsList) ? mechanicsList : []);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2">
            Welcome,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {user?.name}!
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Browse and hire top-rated mechanics for your vehicle
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800/50 backdrop-blur-lg border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-lg"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl">
              🔍
            </span>
          </div>
        </div>

        {/* Mechanics Grid */}
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">
              Available Mechanics
            </h2>
            <span className="text-gray-400 text-lg">
              {filteredMechanics.length} mechanic
              {filteredMechanics.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {filteredMechanics.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/30 backdrop-blur-lg rounded-lg border border-blue-500/20">
              <p className="text-2xl text-gray-400">😅 No mechanics found</p>
              <p className="text-gray-500 mt-2">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMechanics.map((mechanic) => (
                <MechanicCard key={mechanic.id} mechanic={mechanic} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
