import api from "./api";

export const createPaymentIntent = ({ requestId, idempotencyKey }) =>
  api.post(
    "/payments/create-intent",
    { requestId, idempotencyKey },
    {
      headers: idempotencyKey
        ? {
            "x-idempotency-key": idempotencyKey,
          }
        : undefined,
    },
  );

export const mockPay = ({ requestId, amount, currency = "NPR" }) =>
  api.post("/payments/mock-pay", { requestId, amount, currency });

export const getPaymentByRequest = (requestId) =>
  api.get(`/payments/request/${requestId}`);

export const getPaymentReceipt = (paymentId) =>
  api.get(`/payments/receipt/${paymentId}`);

export const getAdminTransactions = (params = {}) =>
  api.get("/payments/admin/transactions", { params });

export const refundPayment = (paymentId, reason) =>
  api.post(`/payments/admin/refund/${paymentId}`, { reason });

const paymentService = {
  createPaymentIntent,
  mockPay,
  getPaymentByRequest,
  getPaymentReceipt,
  getAdminTransactions,
  refundPayment,
};

export default paymentService;
