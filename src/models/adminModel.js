const {
  pool,
  createAdminClient,
  createClientDbConnection,
} = require("../db/db");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/authService");
const { createUserTable, insertUser } = require("../models/userModel");
const { getDatabase } = require("../services/dbService");
const { createTableAndInsertSettings } = require("./settingsModel");

exports.addClient = async (username, password, databaseName) => {
  let adminClient, clientDbConnection;
  const dbName = getDatabase(databaseName);
  
  try {
    // Check if the client already exists
    const existingClient = await pool.query(
      "SELECT * FROM clients WHERE client_username = $1",
      [username]
    );

    if (existingClient.rows.length > 0) {
      throw new Error("Client username already exists.");
    }

    console.log("......", dbName);
    

    // Insert new client info
    const result = await pool.query(
      "INSERT INTO clients (client_username, client_password, client_database_name) VALUES ($1, $2, $3) RETURNING *",
      [username, password, dbName]
    );

    // Create a connection to the default admin database
    adminClient = createAdminClient();
    await adminClient.connect();

    // Create a new database
    await adminClient.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database ${dbName} created.`);

    // Connect to the new client database
    clientDbConnection = createClientDbConnection(dbName);
    await clientDbConnection.connect();

    await createUserTable(clientDbConnection);
    await insertUser(clientDbConnection, {
      username: username,
      password: password,
      profile_photo: "",
      phone: "123456789",
      email: "example@example.com",
      city: "City",
      address: "Address",
      role: "admin",
    });

    await createTableAndInsertSettings({
        company_name: "",
        primary_color: "#6e62e5",
        secondary_color: "#4858a0",
        text_light: "#ffffff",
        text_dark: "#333333",
        company_address: "",
        email_address: "",
        phone_number: "",
        company_description: "",
        product_fields: "",
    },clientDbConnection);

    return result.rows[0];
  } catch (error) {
    console.error("Error adding client and creating database:", error.message);
    throw error;
  } finally {
    if (adminClient) await adminClient.end();
    if (clientDbConnection) await clientDbConnection.end();
  }
};

exports.getAllClients = async () => {
  const result = await pool.query("SELECT * FROM clients");
  return result.rows;
};

exports.getClientByUsername = async (username) => {
  const result = await pool.query(
    "SELECT * FROM clients WHERE client_username = $1",
    [username]
  );
  return result.rows[0];
};

exports.updateClientPassword = async (username, password) => {
  await pool.query(
    "UPDATE clients SET client_password = $1 WHERE client_username = $2",
    [password, username]
  );
  return "Client password updated!!";
};

exports.deleteClient = async (username) => {
  let adminClient;

  try {
    // Get client database information
    const client = await pool.query(
      "SELECT client_database_name FROM clients WHERE client_username = $1",
      [username]
    );

    if (client.rows.length === 0) {
      throw new Error("Client not found.");
    }

    const databaseName = client.rows[0].client_database_name;

    // Delete the client from the central `clients` table
    await pool.query("DELETE FROM clients WHERE client_username = $1", [
      username,
    ]);
    console.log(`Client ${username} removed from 'clients' table.`);

    // Connect to the admin database to drop the client database
    adminClient = createAdminClient();
    await adminClient.connect();

    // Drop the client database
    await adminClient.query(`DROP DATABASE ${databaseName}`);
    console.log(`Database ${databaseName} deleted.`);
  } catch (error) {
    console.error("Error deleting client and database:", error.message);
    throw error;
  } finally {
    if (adminClient) await adminClient.end();
  }
};
