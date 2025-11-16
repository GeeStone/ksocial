// backend/routes/notificationRoute.js
// ===================================

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAllRead,
  markNotificationRead,
} = require("../controllers/notificationController");

// GET /notifications
router.get("/", authMiddleware, getNotifications);

// PATCH /notifications/read-all
router.patch("/read-all", authMiddleware, markAllRead);

// PATCH /notifications/:id/read
router.patch("/:id/read", authMiddleware, markNotificationRead);

module.exports = router;
