const express = require("express");
const {
    addClient,
    getAllClients,
    getClientByUsername,
    updateClientPassword,
    deleteClient,
    getClientByJwt,
} = require("../controllers/adminController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/protected", authenticateToken, getClientByJwt); // Authorize the client
router.post("/", addClient); // Add a new client
router.get("/", getAllClients); // Get all clients
router.get("/:username", getClientByUsername); // Get client by username
router.put("/:username", updateClientPassword); // Update client's password
router.delete("/:username", deleteClient); // Delete client

module.exports = router;