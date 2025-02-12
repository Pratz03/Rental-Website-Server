const jwt = require("jsonwebtoken");
const { pool, createClientDbConnection } = require("../db/db");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/authService");

// This file can be used to handle additional login-related DB interaction
// Currently, it's very minimal because we are focused on JWT token handling.

exports.login = async (dbClient, username, password) => {
  console.log("----", dbClient);
  
  // let clientDbConnection;
  try {
    // Fetch the client by username
    const authResult = await dbClient.dbConnection.query(
      "SELECT * FROM user_table WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (authResult.rows.length === 0) {
      // Client not found
      throw new Error("Invalid username or password.");
    }

    // Get client information (ensure password matches using bcrypt or plain comparison)
    const result = authResult.rows[0];
    console.log(result);

    if (
      result.username !== username &&
      result.password !== password
    ) {
      throw new Error("Invalid username or password.");
    }

    // clientDbConnection = createClientDbConnection(result.client_database_name);
    // await clientDbConnection.connect();

    // const authData = {
    //   user_id: result.user_id,
    //   database: 
    // }

    //jwt authentication
    const accessToken = generateAccessToken(result.user_id, dbClient.name);
    const refreshToken = generateRefreshToken(result.user_id, dbClient.name);

    // For now, let's just close the connection after logging in.
    // await clientDbConnection.end();

    // Return success or any necessary info (exclude password for security reasons)
    console.log("access", accessToken);
    return {
      clientId: result.user_id,
      username: result.username,
      role: result.role,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error) {
    console.error("Error during login:", error.message);
    throw error;
  }
};

// exports.generateAccessToken = (client) => {
//   return jwt.sign(client, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "15s",
//   });
// };

// exports.generateRefreshToken = (client) => {
//   return jwt.sign(client, process.env.REFRESH_TOKEN_SECRET);
// };
