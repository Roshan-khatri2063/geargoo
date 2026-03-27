import { Link } from "react-router-dom";

export default function MechanicCard({ mechanic }) {
  const mechanicId = mechanic?.id;

  return (
    <div className="group bg-slate-800/50 backdrop-blur-lg border border-blue-500/20 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 border-b border-blue-500/20">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{mechanic.name}</h3>
            <p className="text-gray-400 text-sm mt-1">
              {mechanic.location || "Location not specified"}
            </p>
          </div>
          <span className="text-3xl">👨‍🔧</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="text-lg font-bold text-white">
            {Number(mechanic.rating || 0).toFixed(1)}
          </span>
          <span className="text-gray-400">Rating</span>
        </div>

        {/* Experience */}
        <div>
          <label className="text-sm text-gray-400">Experience</label>
          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            {mechanic.experience
              ? `${mechanic.experience} years`
              : "Not specified"}
          </p>
        </div>

        {/* Specializations */}
        {mechanic.specialization && mechanic.specialization.length > 0 && (
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Specializations
            </label>
            <div className="flex flex-wrap gap-2">
              {mechanic.specialization.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30"
                >
                  {skill}
                </span>
              ))}
              {mechanic.specialization.length > 3 && (
                <span className="px-3 py-1 bg-slate-700/50 text-gray-300 rounded-full text-xs font-semibold border border-slate-600">
                  +{mechanic.specialization.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="pt-4 border-t border-slate-700">
          {mechanic.approvalStatus === "approved" ? (
            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold border border-green-500/30">
              ✓ Verified
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold border border-yellow-500/30">
              ⏳ Pending
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pt-0">
        {mechanicId ? (
          <Link
            to={`/hire-mechanic/${mechanicId}`}
            className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 text-center rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-105"
          >
            📞 Hire Now
          </Link>
        ) : (
          <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg opacity-70 cursor-not-allowed">
            📞 Hire Now
          </button>
        )}
      </div>
    </div>
  );
}
