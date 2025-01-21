const jwt = require("jsonwebtoken");

exports.generateAccessToken = (client) => {
    return jwt.sign(client, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
};

exports.generateAccessTokenNoExpiry = (client) => {
    return jwt.sign(client, process.env.ACCESS_TOKEN_SECRET);
};

exports.generateRefreshToken = (client) => {
    return jwt.sign(client, process.env.REFRESH_TOKEN_SECRET);
};

exports.verifyAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, client) => {
            if (err) {
                return reject(new Error('Invalid or expired access token.'));
            }
            resolve(client);
        });
    });
};

exports.verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, client) => {
            if (err) {
                return reject(new Error('Invalid refresh token.'));
            }
            resolve(client);
        });
    });
};
