const jwt = require("jsonwebtoken");

// Generate an access token with an expiration time (e.g., 15 seconds).
exports.generateAccessToken = (clientId) => {
    return jwt.sign({ id: clientId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' });
};

// Generate an access token with no expiration time (not recommended for production).
exports.generateAccessTokenNoExpiry = (clientId) => {
    return jwt.sign({ id: clientId }, process.env.ACCESS_TOKEN_SECRET);
};

// Generate a refresh token (used for generating new access tokens when the old one expires).
exports.generateRefreshToken = (clientId) => {
    return jwt.sign({ id: clientId }, process.env.REFRESH_TOKEN_SECRET);
};

// Verify the access token and extract the client ID.
exports.verifyAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return reject(new Error('Invalid or expired access token.'));
            }
            resolve(payload.id); // Return the `id` (client ID) from the token payload.
        });
    });
};

// Verify the refresh token and extract the client ID.
exports.verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return reject(new Error('Invalid refresh token.'));
            }
            resolve(payload.id); // Return the `id` (client ID) from the refresh token payload.
        });
    });
};
