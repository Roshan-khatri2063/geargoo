import { useEffect, useState } from "react";
import mechanicService from "../../services/mechanicService";
import useAuth from "../../hooks/useAuth";

const MechanicEarnings = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completedJobs: 0,
    pendingJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        if (!user?.id) return;
        const data = await mechanicService.getMechanicEarnings(user.id);
        setStats({
          total: Number(data.total || 0),
          completedJobs: Number(data.completedJobs || 0),
          pendingJobs: Number(data.pendingJobs || 0),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [user?.id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Earnings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-500">Total Earnings</p>
          <h2 className="text-2xl font-bold mt-2">
            Rs. {stats.total.toFixed(2)}
          </h2>
        </div>
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-500">Completed Jobs</p>
          <h2 className="text-2xl font-bold mt-2">{stats.completedJobs}</h2>
        </div>
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-500">Pending Jobs</p>
          <h2 className="text-2xl font-bold mt-2">{stats.pendingJobs}</h2>
        </div>
      </div>
    </div>
  );
};

export default MechanicEarnings;
