const jwt = require("jsonwebtoken");
const { pool, createClientDbConnection } = require("../db/db");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/authService");

// This file can be used to handle additional login-related DB interaction
// Currently, it's very minimal because we are focused on JWT token handling.

exports.loginClient = async (username, password) => {
  let clientDbConnection;
  try {
    // Fetch the client by username
    const clientResult = await pool.query(
      "SELECT * FROM clients WHERE client_username = $1 AND client_password = $2",
      [username, password]
    );

    if (clientResult.rows.length === 0) {
      // Client not found
      throw new Error("Invalid username or password.");
    }

    // Get client information (ensure password matches using bcrypt or plain comparison)
    const client = clientResult.rows[0];
    console.log(client);

    if (
      client.client_username !== username &&
      client.client_password !== password
    ) {
      throw new Error("Invalid username or password.");
    }

    clientDbConnection = createClientDbConnection(client.client_database_name);
    await clientDbConnection.connect();

    //jwt authentication
    const accessToken = generateAccessToken(client.client_id);
    const refreshToken = generateRefreshToken(client.client_id);

    // For now, let's just close the connection after logging in.
    await clientDbConnection.end();

    // Return success or any necessary info (exclude password for security reasons)
    console.log("access", accessToken);
    return {
      clientId: client.client_id,
      username: client.client_username,
      databaseName: client.client_database_name,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error) {
    console.error("Error during login:", error.message);
    throw error;
  }
};

exports.generateAccessToken = (client) => {
  return jwt.sign(client, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15s",
  });
};

exports.generateRefreshToken = (client) => {
  return jwt.sign(client, process.env.REFRESH_TOKEN_SECRET);
};
