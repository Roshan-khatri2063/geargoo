const express = require("express");
const {
  createRequest,
  getUserRequests,
  getMechanicJobs,
  updateJobStatus,
} = require("../controllers/requestController");
const router = express.Router();
router.post("/", createRequest);
router.get("/", getUserRequests);
router.get("/user", getUserRequests);
router.get("/mechanic/:mechanicId", getMechanicJobs);
router.put("/:id/status", updateJobStatus);
module.exports = router;
