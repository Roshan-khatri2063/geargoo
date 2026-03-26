const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getAdminDashboard,
  getUsers,
  getCustomers,
  getMechanics,
  getRequests,
  getDashboardStats,
  deleteRequest,
  approveMechanic,
  updateCustomerActiveStatus,
  updateMechanicActiveStatus,
  deleteUser,
} = require("../controllers/adminController");
const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.use(protect, requireAdmin);

router.get("/users", getUsers);
router.get("/customers", getCustomers);
router.put("/customers/:id/active-status", updateCustomerActiveStatus);
router.delete("/users/:id", deleteUser);
router.get("/mechanics", getMechanics);
router.put("/mechanics/:id/approve", approveMechanic);
router.put("/mechanics/:id/active-status", updateMechanicActiveStatus);
router.get("/requests", getRequests);
router.delete("/requests/:id", deleteRequest);
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard", getAdminDashboard);

module.exports = router;
