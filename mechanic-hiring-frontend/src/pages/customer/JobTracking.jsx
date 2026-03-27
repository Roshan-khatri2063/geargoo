import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import requestService from "../../services/requestService";
import paymentService from "../../services/paymentService";
import useAuth from "../../hooks/useAuth";

const JobTracking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingRequestId, setPayingRequestId] = useState(null);
  const [receiptByPaymentId, setReceiptByPaymentId] = useState({});
  const [amountByRequest, setAmountByRequest] = useState({});

  const getReceiptKeyForJob = useCallback(
    (job) => Number(job.lastPaymentId || job.id),
    [],
  );

  const getReceiptForJob = useCallback(
    (job) => {
      const key = getReceiptKeyForJob(job);
      return (
        receiptByPaymentId[key] || receiptByPaymentId[Number(job.id)] || null
      );
    },
    [getReceiptKeyForJob, receiptByPaymentId],
  );

  const callbackStatus = useMemo(
    () => new URLSearchParams(location.search).get("paymentStatus"),
    [location.search],
  );
  const callbackPaymentId = useMemo(
    () => new URLSearchParams(location.search).get("paymentId"),
    [location.search],
  );

  const fetchJobs = useCallback(async () => {
    try {
      const res = await requestService.getUserRequests(user?.id);
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchJobs();
  }, [user?.id, fetchJobs]);

  useEffect(() => {
    if (!callbackStatus) return;
    if (callbackStatus === "paid") {
      toast.success("Payment verified successfully");
      fetchJobs();
    } else if (callbackStatus === "failed") {
      toast.error("Payment was not completed");
    }

    if (callbackPaymentId) {
      paymentService
        .getPaymentReceipt(callbackPaymentId)
        .then((res) => {
          const receipt = res.data?.receipt;
          if (!receipt) return;
          setReceiptByPaymentId((prev) => ({
            ...prev,
            [receipt.paymentId]: receipt,
          }));
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [callbackStatus, callbackPaymentId, fetchJobs]);

  const handlePayNow = async (job) => {
    try {
      setPayingRequestId(job.id);
      const enteredAmount = Number(amountByRequest[job.id]);
      if (Number.isNaN(enteredAmount) || enteredAmount <= 0) {
        toast.error("Enter a valid amount");
        return;
      }

      const res = await paymentService.mockPay({
        requestId: job.id,
        amount: Number(enteredAmount.toFixed(2)),
        currency: job.currency || "NPR",
      });
      const payload = res.data || {};
      toast.success(payload.message || "Payment sent successfully");

      if (payload.payment?.id) {
        const paymentId = Number(payload.payment.id);
        const requestId = Number(payload.payment.request_id || job.id);
        const receiptPayload = {
          paymentId,
          requestId,
          amount: Number(payload.payment.amount || enteredAmount),
          currency: payload.payment.currency || job.currency || "NPR",
          status: payload.payment.status || "paid",
          provider: payload.payment.provider || "esewa_mock",
          providerTransactionId: payload.payment.provider_transaction_id,
        };

        setReceiptByPaymentId((prev) => ({
          ...prev,
          [paymentId]: receiptPayload,
          [requestId]: receiptPayload,
        }));
      }

      setAmountByRequest((prev) => ({ ...prev, [job.id]: "" }));
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment start failed");
    } finally {
      setPayingRequestId(null);
    }
  };

  const handleViewReceipt = async (job) => {
    try {
      const candidateIds = [Number(job.lastPaymentId), Number(job.id)].filter(
        (id, idx, arr) => id > 0 && arr.indexOf(id) === idx,
      );

      for (const paymentId of candidateIds) {
        if (receiptByPaymentId[paymentId]) return;
        try {
          const res = await paymentService.getPaymentReceipt(paymentId);
          const receipt = res.data?.receipt;
          if (!receipt) continue;
          const receiptPaymentId = Number(receipt.paymentId || paymentId);
          const requestId = Number(receipt.requestId || job.id);
          setReceiptByPaymentId((prev) => ({
            ...prev,
            [receiptPaymentId]: receipt,
            [requestId]: receipt,
          }));
          return;
        } catch (err) {
          if (err?.response?.status !== 404) throw err;
        }
      }

      const byRequest = await paymentService.getPaymentByRequest(job.id);
      const receipt = byRequest.data?.receipt;
      if (!receipt) return;
      const receiptPaymentId = Number(receipt.paymentId || job.id);
      const requestId = Number(receipt.requestId || job.id);
      setReceiptByPaymentId((prev) => ({
        ...prev,
        [receiptPaymentId]: receipt,
        [requestId]: receipt,
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load receipt");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Job Tracking</h1>
      {jobs.length === 0 ? (
        <p>No service requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white shadow rounded p-4">
              <h2 className="font-bold text-xl mb-2">{job.service}</h2>
              <p>
                <span className="font-semibold">Mechanic:</span>{" "}
                {job.mechanicName}
              </p>
              <p>
                <span className="font-semibold">Location:</span> {job.location}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {job.status}
              </p>
              <p>
                <span className="font-semibold">Payment:</span>{" "}
                <span
                  className={
                    String(job.paymentStatus || "").toLowerCase() === "paid"
                      ? "text-green-700 font-semibold"
                      : "text-orange-700 font-semibold"
                  }
                >
                  {job.paymentStatus || "unpaid"}
                </span>
              </p>
              {!!job.amount && (
                <p>
                  <span className="font-semibold">Amount:</span> {job.amount}{" "}
                  {job.currency || "NPR"}
                </p>
              )}
              <p className="mt-2 text-gray-600">{job.description}</p>

              {String(job.paymentStatus || "").toLowerCase() !== "paid" && (
                <div className="mt-4 border rounded p-3 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">
                    Mock eSewa payment for project demo. Enter any amount and
                    send it to mechanic instantly.
                  </p>
                  <img
                    src="/QR_payment.jpeg"
                    alt="eSewa QR"
                    className="w-36 h-36 object-cover border rounded"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={amountByRequest[job.id] ?? ""}
                      onChange={(e) =>
                        setAmountByRequest((prev) => ({
                          ...prev,
                          [job.id]: e.target.value,
                        }))
                      }
                      placeholder="Enter amount"
                      className="border rounded px-3 py-2 w-40"
                    />
                    <span className="text-sm text-gray-600">
                      {job.currency || "NPR"}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePayNow(job)}
                    disabled={payingRequestId === job.id}
                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
                  >
                    {payingRequestId === job.id
                      ? "Processing payment..."
                      : "Pay Now (Mock eSewa)"}
                  </button>
                </div>
              )}

              {String(job.paymentStatus || "").toLowerCase() === "paid" && (
                <div className="mt-4 border rounded p-3 bg-green-50">
                  <button
                    onClick={() => handleViewReceipt(job)}
                    className="bg-white border px-3 py-1 rounded hover:bg-gray-100"
                  >
                    View Receipt
                  </button>
                  {getReceiptForJob(job) && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Payment ID: {getReceiptForJob(job).paymentId}</p>
                      <p>Provider: {getReceiptForJob(job).provider}</p>
                      <p>
                        Transaction:{" "}
                        {getReceiptForJob(job).providerTransactionId ||
                          "Pending verification"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobTracking;
