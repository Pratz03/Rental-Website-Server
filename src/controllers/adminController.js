const adminModel = require("../models/adminModel");

exports.addClient = async (req, res, next) => {
    try {
        const { client_username, client_password, client_database_name } = req.body;
        const newClient = await adminModel.addClient(client_username, client_password, client_database_name);
        res.status(200).json(newClient); // Success response with created client info
    } catch (error) {
        if (error.message === "Client username already exists.") {
            res.status(400).json({ error: error.message }); // Bad Request
        } else {
            res.status(500).json({ error: error.message }); // Internal Server Error
        }
    }
};

exports.getAllClients = async (req, res, next) => {
    try {
        const clients = await adminModel.getAllClients();
        res.json(clients);
    } catch (error) {
        next(error);
    }
};

exports.getClientByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        const client = await adminModel.getClientByUsername(username);
        res.json(client);
    } catch (error) {
        next(error);
    }
};

exports.updateClientPassword = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { password } = req.body;
        await adminModel.updateClientPassword(username, password);
        res.json("Client password updated!");
    } catch (error) {
        next(error);
    }
};

exports.deleteClient = async (req, res, next) => {
    try {
        const { username } = req.params;
        await adminModel.deleteClient(username);
        res.json("Client is deleted!");
    } catch (error) {
        if (error.message === "Client not found.") {
            res.status(200).json({ error: error.message });
        } else {
            res.status(200).json({ error: error.message })
        }
        next(error);
    }
};

exports.getClientByJwt = async (req, res, next) => {
    try {
        const { client_username } = req.client; // Extracted client from authenticateToken
        const client = await adminModel.getClientByUsername(client_username);
        if (!client) {
            return res.status(404).json({ error: "Client not found." });
        }
        res.status(200).json(client);
    } catch (error) {
        next(error);
    }
};