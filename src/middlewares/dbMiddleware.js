const { pool, createClientDbConnection } = require("../db/db");

const dbMiddleware = async (req, res, next) => {
    try {
        const clientId = req.client; // Extracted from token by authenticateToken
        
        const result = await pool.query(
            "SELECT client_database_name FROM clients WHERE client_id = $1",
            [clientId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Client not found" });
        }

        const { client_database_name: dbName } = result.rows[0];
        const clientDbConnection = createClientDbConnection(dbName);

        // Attach database connection to the request
        req.db = clientDbConnection;

        // Open database connection
        await clientDbConnection.connect();
        next();
    } catch (error) {
        console.error("Error in dbMiddleware:", error.message);
        res.status(500).json({ error: "Database connection failed" });
    }
};

module.exports = dbMiddleware;
