const express = require("express");
const { login, refreshToken } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login); // Login
router.post("/token", refreshToken); // Refresh token

module.exports = router;