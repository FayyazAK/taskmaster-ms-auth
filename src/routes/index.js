const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const authRoutes = require("./authRoutes");

router.use("/auth", authRoutes);
router.use("/admin", authenticate, authorizeAdmin, adminRoutes);
router.use("/user", authenticate, userRoutes);

module.exports = router;
