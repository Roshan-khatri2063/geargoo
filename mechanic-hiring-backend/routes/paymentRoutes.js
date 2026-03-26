const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createPaymentIntent,
  createMockPayment,
  handleEsewaWebhook,
  handleEsewaSuccessCallback,
  handleEsewaFailureCallback,
  getPaymentByRequest,
  getPaymentReceipt,
  getAdminTransactions,
  refundPaymentByAdmin,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);
router.post("/mock-pay", protect, createMockPayment);
router.post("/webhook/esewa", handleEsewaWebhook);
router.get("/callback/esewa/success", handleEsewaSuccessCallback);
router.get("/callback/esewa/failure", handleEsewaFailureCallback);
router.get("/request/:requestId", protect, getPaymentByRequest);
router.get("/receipt/:paymentId", protect, getPaymentReceipt);
router.get("/admin/transactions", protect, getAdminTransactions);
router.post("/admin/refund/:paymentId", protect, refundPaymentByAdmin);

module.exports = router;
