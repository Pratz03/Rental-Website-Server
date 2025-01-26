const { generateAccessTokenNoExpiry, verifyRefreshToken } = require("../services/authService");
const authModel = require("../models/authModel");

let refreshTokens = [];  // Store active refresh tokens temporarily (can be stored in DB)

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(",,,,,", req.db);
        
        const loginData = await authModel.login(req.db, username, password);
        
        // Store the refresh token
        refreshTokens.push(loginData.refreshToken);

        res.status(200).json({
            message: 'Login successful',
            clientId: loginData.clientId,
            username: loginData.username,
            databaseName: loginData.databaseName,
            accessToken: loginData.accessToken,
            refreshToken: loginData.refreshToken,
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
