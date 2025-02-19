const express = require("express");
const router = express.Router();
const {
  addUser,
  getAndSearchUsers,
  updateUser,
  getUser,
  totalUser,
} = require("../controllers/userController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const dbMiddleware = require("../middlewares/dbMiddleware");
const {
  dbConnectionMiddleware,
} = require("../middlewares/dbConnectionMiddleware");

router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

router.post("/", dbMiddleware, addUser);
router.get("/total-user", authenticateToken, dbConnectionMiddleware, totalUser);
router.get(
  "/",
  authenticateToken,
  dbConnectionMiddleware,
  getAndSearchUsers
);
router.get("/:id", authenticateToken, dbConnectionMiddleware, getUser);
router.put("/:id", authenticateToken, dbConnectionMiddleware, updateUser);

module.exports = router;
