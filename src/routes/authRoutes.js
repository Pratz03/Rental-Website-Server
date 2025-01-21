const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.clientLogin); // Login
router.post("/token", authController.refreshToken); // Refresh token

module.exports = router;