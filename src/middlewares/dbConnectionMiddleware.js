const { pool, createClientDbConnection } = require("../db/db");

const dbConnectionMiddleware = async (req, res, next) => {
  try {
    const loginData = req.client;

    // Create a new DB connection for the client
    const clientDbConnection = createClientDbConnection(loginData.dbName);
    req.db = clientDbConnection;

    // Open database connection
    await clientDbConnection.connect();

    // Close the connection when response is finished
    res.on("finish", async () => {
      if (req.db) {
        try {
          await req.db.end(); // Properly close the connection
          console.log("Database connection closed.");
        } catch (err) {
          console.error("Error closing DB connection:", err.message);
        }
      }
    });

    next();
  } catch (error) {
    console.error("Error in dbMiddleware:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
};
const releaseDbConnectionMiddleware = async (req, res, next) => {
  if (req.db) {
    try {
      await req.db.release(); // Release the connection back to the pool
    } catch (err) {
      console.error("Error releasing DB connection:", err.message);
    }
  }
  next();
};

module.exports = { dbConnectionMiddleware, releaseDbConnectionMiddleware };
