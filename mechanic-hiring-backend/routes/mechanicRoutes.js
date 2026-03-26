const express = require("express");
const {
  getMechanics,
  getMechanicById,
  getProfile,
  updateProfile,
  getEarnings,
} = require("../controllers/mechanicController");
const router = express.Router();
router.get("/", getMechanics);
router.get("/profile/:id?", getProfile);
router.put("/profile/:id?", updateProfile);
router.get("/earnings/:id", getEarnings);
router.get("/:id", getMechanicById);
module.exports = router;
