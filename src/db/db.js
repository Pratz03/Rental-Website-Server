const { Pool, Client } = require("pg");

const pool = new Pool({
    user: "postgres",
    password: "admin",
    host: "localhost",
    port: 5432,
    database: "client_db", // Main database for clients table
    max: 20, // Set the maximum number of connections
});

// Function to create a client for administrative operations
const createAdminClient = () => {
    return new Client({
        user: "postgres",
        password: "admin",
        host: "localhost",
        port: 5432,
        database: "postgres", // Default connection for administrative operations
        max: 20, // Set the maximum number of connections
    });
};

// Function to create a client for client-specific databases
const createClientDbConnection = (databaseName) => {
    return new Client({
        user: "postgres",
        password: "admin",
        host: "localhost",
        port: 5432,
        database: databaseName, // Connect to client-specific database
        max: 20, // Set the maximum number of connections
    });
};

module.exports = { pool, createAdminClient, createClientDbConnection };
