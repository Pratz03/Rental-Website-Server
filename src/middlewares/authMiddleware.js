const { verifyAccessToken } = require("../services/authService");

exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new Error("No token provided");
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new Error("No token provided");
        }

        const client = await verifyAccessToken(token);
        req.client = client;  // Attach client info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};
