const { generateAccessTokenNoExpiry, verifyRefreshToken } = require("../services/authService");
const authModel = require("../models/authModel");

let refreshTokens = [];  // Store active refresh tokens temporarily (can be stored in DB)

exports.clientLogin = async (req, res) => {
    try {
        const { client_username, client_password } = req.body;
        const clientData = await authModel.loginClient(client_username, client_password);
        
        // Store the refresh token
        refreshTokens.push(clientData.refreshToken);

        res.status(200).json({
            message: 'Login successful',
            clientId: clientData.clientId,
            username: clientData.username,
            databaseName: clientData.databaseName,
            accessToken: clientData.accessToken,
            refreshToken: clientData.refreshToken,
        });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Something went wrong during login.' });
    }
};

exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token || !refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }

    try {
        const client = await verifyRefreshToken(token);
        const accessToken = generateAccessTokenNoExpiry(client);

        // Issue new tokens
        res.json({ accessToken });
    } catch (error) {
        res.sendStatus(403);
    }
};
