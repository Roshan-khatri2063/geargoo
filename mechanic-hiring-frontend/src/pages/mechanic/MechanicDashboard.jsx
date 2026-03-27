import { useState, useEffect, useCallback } from "react";
import useAuth from "../../hooks/useAuth";
import mechanicService from "../../services/mechanicService";
import Loader from "../../components/common/Loader";

export default function MechanicDashboard() {
  const { user } = useAuth();
  const [mechanic, setMechanic] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMechanicProfile = useCallback(async () => {
    try {
      if (!user?.id) return;
      const response = await mechanicService.getProfile(user.id);
      setMechanic(response);
    } catch (error) {
      console.error("Error fetching mechanic profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchMechanicProfile();
  }, [user?.id, fetchMechanicProfile]);

  if (loading) return <Loader />;

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 border-green-500/50 text-green-300";
      case "pending":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      case "rejected":
        return "bg-red-500/20 border-red-500/50 text-red-300";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2">
            Welcome,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {user?.name}!
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Manage your mechanic profile and services
          </p>
        </div>

        {mechanic && (
          <>
            {/* Status Card */}
            <div
              className={`mb-8 p-6 rounded-lg border ${getStatusColor(mechanic.approvalStatus)} backdrop-blur-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Profile Status</h3>
                  <p className="text-sm opacity-75 mt-1">
                    {mechanic.approvalStatus === "approved"
                      ? "✓ Your profile is approved and visible to customers"
                      : mechanic.approvalStatus === "pending"
                        ? "⏳ Your profile is under review by admins"
                        : "✗ Your profile was not approved"}
                  </p>
                </div>
                <span className="text-3xl capitalize font-bold">
                  {mechanic.approvalStatus}
                </span>
              </div>
            </div>

            {/* Main Profile Cards */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Personal Info */}
              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-8 hover:border-blue-500/50 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  👤 Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-400">
                      Full Name
                    </label>
                    <p className="text-lg font-semibold text-white mt-2">
                      {mechanic.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-400">
                      Email
                    </label>
                    <p className="text-lg font-semibold text-white mt-2">
                      {mechanic.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-400">
                      Phone
                    </label>
                    <p className="text-lg font-semibold text-white mt-2">
                      {mechanic.phone}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-400">
                      Location
                    </label>
                    <p className="text-lg font-semibold text-white mt-2">
                      {mechanic.location || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-800/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-8 hover:border-blue-500/50 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  📊 Quick Stats
                </h2>

                <div className="space-y-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Rating</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-2">
                      ⭐ {Number(mechanic.rating || 0).toFixed(1)}
                    </p>
                  </div>

                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Active Status</p>
                    <p
                      className={`text-lg font-bold mt-2 ${mechanic.isActive ? "text-green-400" : "text-red-400"}`}
                    >
                      {mechanic.isActive ? "🟢 Active" : "🔴 Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Experience */}
              <div className="bg-slate-800/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-8 hover:border-blue-500/50 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  🎓 Experience
                </h2>
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    {mechanic.experience ?? "-"}
                  </p>
                  <p className="text-gray-400 mt-2">Years of Experience</p>
                </div>
              </div>

              {/* Specialization */}
              <div className="bg-slate-800/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-8 hover:border-blue-500/50 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  🔧 Specializations
                </h2>
                <div className="flex flex-wrap gap-3">
                  {mechanic.specialization &&
                  mechanic.specialization.length > 0 ? (
                    mechanic.specialization.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">No specializations added</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {mechanic.bio && (
              <div className="mt-6 bg-slate-800/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-8 hover:border-blue-500/50 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  📝 Bio
                </h2>
                <p className="text-gray-300 leading-relaxed">{mechanic.bio}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
