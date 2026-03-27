import { useEffect, useState } from "react";
import requestService from "../../services/requestService";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const MechanicJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeStatus = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (!user?.id) return;
        const res = await requestService.getMechanicJobs(user.id);
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user?.id]);

  const updateStatus = async (jobId, status) => {
    try {
      await requestService.updateJobStatus(jobId, status);
      toast.success(`Job marked as ${status}`);
      const res = await requestService.getMechanicJobs(user?.id);
      setJobs(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Jobs</h1>
      {jobs.length === 0 ? (
        <p>No jobs assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow rounded p-4 flex flex-col gap-2"
            >
              {(() => {
                const status = normalizeStatus(job.status);
                const canAccept = status === "pending";
                const canProgress = status === "accepted";
                const canComplete = status === "in progress";

                return (
                  <>
                    <h2 className="font-bold text-xl">{job.service}</h2>
                    <p>
                      <span className="font-semibold">Customer:</span>{" "}
                      {job.customerName}
                    </p>
                    <p>
                      <span className="font-semibold">Location:</span>{" "}
                      {job.location}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {job.status}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {canAccept && (
                        <button
                          onClick={() => updateStatus(job.id, "Accepted")}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Accept
                        </button>
                      )}
                      {canProgress && (
                        <button
                          onClick={() => updateStatus(job.id, "In Progress")}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          In Progress
                        </button>
                      )}
                      {canComplete && (
                        <button
                          onClick={() => updateStatus(job.id, "Completed")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Complete
                        </button>
                      )}
                      {!canAccept && !canProgress && !canComplete && (
                        <span className="text-sm text-gray-500">
                          No actions available
                        </span>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MechanicJobs;
