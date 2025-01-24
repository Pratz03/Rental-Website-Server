const express = require("express");
const router = express.Router();
const { addUser, getAndSearchUsers, updateUser, getUser } = require("../controllers/userController");    

router.post("/", addUser);
router.get("/", getAndSearchUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);

module.exports = router;