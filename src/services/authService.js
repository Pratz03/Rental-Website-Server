const jwt = require("jsonwebtoken");

// Generate an access token with an expiration time (e.g., 15 seconds).
exports.generateAccessToken = (clientId, dbName) => {
  return jwt.sign(
    { id: clientId, dbName: dbName },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "3h" }
  );
};

// Generate an access token with no expiration time (not recommended for production).
exports.generateAccessTokenNoExpiry = (clientId, dbName) => {
  return jwt.sign(
    { id: clientId, dbName: dbName },
    process.env.ACCESS_TOKEN_SECRET
  );
};

// Generate a refresh token (used for generating new access tokens when the old one expires).
exports.generateRefreshToken = (clientId, dbName) => {
  return jwt.sign(
    { id: clientId, dbName: dbName },
    process.env.REFRESH_TOKEN_SECRET
  );
};

// Verify the access token and extract the client ID.
// Verify the access token and extract both client ID and dbName.
exports.verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        return reject(new Error("Invalid or expired access token."));
      }
      resolve({
        clientId: payload.id, // Extracted client ID
        dbName: payload.dbName, // Extracted dbName
      });
    });
  });
};

// Verify the refresh token and extract the client ID.
exports.verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          return reject(new Error("Invalid refresh token."));
        }
        resolve({
          clientId: payload.id, // Extracted client ID
          dbName: payload.dbName, // Extracted dbName
        });
      }
    );
  });
};
