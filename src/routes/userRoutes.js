const express = require("express");
const router = express.Router();
const { addUser, getAndSearchUsers, updateUser, getUser } = require("../controllers/userController"); 
const { authenticateToken } = require("../middlewares/authMiddleware");
const dbMiddleware = require("../middlewares/dbMiddleware");
const dbConnectionMiddleware = require("../middlewares/dbConnectionMiddleware")   

router.post("/", dbMiddleware, addUser);
router.get("/", authenticateToken, dbConnectionMiddleware, getAndSearchUsers);
router.get("/:id", authenticateToken, dbConnectionMiddleware, getUser);
router.put("/:id",  authenticateToken, dbConnectionMiddleware, updateUser);

module.exports = router;