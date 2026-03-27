import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mechanicService from "../../services/mechanicService";
import requestService from "../../services/requestService";
import useAuth from "../../hooks/useAuth";
import useDialog from "../../hooks/useDialog";

const HireMechanic = () => {
  const { user } = useAuth();
  const { notify } = useDialog();
  const { id } = useParams();
  const navigate = useNavigate();
  const [mechanic, setMechanic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    service: "",
    location: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/hire-mechanics");
      return;
    }

    const fetchMechanic = async () => {
      try {
        setLoading(true);
        const res = await mechanicService.getMechanicById(id);
        setMechanic(res.data || res);
      } catch (err) {
        console.error(err);
        await notify({
          title: "Unable to Load Mechanic",
          message: "Failed to load mechanic details. Please try again.",
          tone: "danger",
        });
        navigate("/hire-mechanics");
      } finally {
        setLoading(false);
      }
    };
    fetchMechanic();
  }, [id, navigate, notify]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!user?.id) {
        await notify({
          title: "Session Required",
          message: "Please log in again before sending a request.",
          tone: "warning",
        });
        setSubmitting(false);
        return;
      }
      await requestService.createRequest({
        ...form,
        mechanicId: id,
        customerId: user.id,
      });
      await notify({
        title: "Request Submitted",
        message: "Your service request was created successfully.",
        tone: "success",
      });
      navigate("/customer/dashboard");
    } catch (err) {
      await notify({
        title: "Request Failed",
        message: err?.response?.data?.message || "Failed to create request!",
        tone: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-2xl">Loading mechanic details...</p>
      </div>
    );

  if (!mechanic)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-2xl">Mechanic not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Mechanic Profile Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20 mb-8 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Profile Info */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
                {mechanic.name}
              </h1>

              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {mechanic.bio ||
                  "Professional automotive technician with years of experience providing quality service."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Specialization</p>
                  <p className="text-white font-semibold text-lg">
                    {Array.isArray(mechanic.specialization) &&
                    mechanic.specialization.length
                      ? mechanic.specialization.join(", ")
                      : "General Repairs"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Experience</p>
                  <p className="text-white font-semibold text-lg">
                    {mechanic.experience
                      ? `${mechanic.experience} years`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold text-lg">
                    {mechanic.location || "Location not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Rating</p>
                  <p className="text-white font-semibold text-lg">
                    ⭐ {Number(mechanic.rating || 0).toFixed(1)}/5
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Response Time</p>
                  <p className="text-white font-semibold text-lg">
                    Usually within 2 hours
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-white font-semibold text-lg">
                    98% completion
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-4">
                Quick Overview
              </h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  ✓ Verified & Licensed
                </li>
                <li className="flex items-center gap-2">✓ Insured & Bonded</li>
                <li className="flex items-center gap-2">✓ Warranty Provided</li>
                <li className="flex items-center gap-2">✓ 24/7 Available</li>
                <li className="flex items-center gap-2">
                  ✓ Transparent Pricing
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Services & Expertise */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              Services Offered
            </h3>
            <ul className="space-y-3 text-gray-300">
              {(Array.isArray(mechanic.specialization) &&
              mechanic.specialization.length
                ? mechanic.specialization
                : ["General Repairs"]
              ).map((service, index) => (
                <li key={index}>✓ {service}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              Why Choose This Mechanic?
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>✓ Highly rated with proven track record</li>
              <li>✓ Fast and reliable service</li>
              <li>✓ Transparent pricing, no hidden fees</li>
              <li>✓ Quality parts and workmanship</li>
              <li>✓ Excellent customer reviews</li>
              <li>✓ Professional and courteous</li>
            </ul>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            Request Service
          </h2>
          <p className="text-gray-400 mb-8">
            Fill in the details below to book this mechanic for your vehicle
            service.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Service Type *
              </label>
              <input
                type="text"
                name="service"
                placeholder="e.g., Oil Change, Engine Repair, Tire Replacement"
                value={form.service}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Service Location *
              </label>
              <input
                type="text"
                name="location"
                placeholder="Where should the service be done? (Address or area)"
                value={form.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                placeholder="Please describe the issue in detail:
- What problems are you experiencing?
- How long has this been happening?
- Any other relevant information?"
                value={form.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                required
              ></textarea>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-blue-500/20">
              <p className="text-gray-300 text-sm">
                <strong>Note:</strong> The mechanic will review your request and
                contact you within 2 hours with a quote and available time
                slots.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "⏳ Sending Request..." : "✨ Book This Mechanic"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HireMechanic;
