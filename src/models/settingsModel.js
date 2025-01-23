exports.createTableAndInsertSettings = async (settingsData, dbClient) => {
  try {
    // Step 1: Ensure the settings table exists
    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS settings_table (
                id SERIAL PRIMARY KEY,
                company_name VARCHAR(255),
                primary_color VARCHAR(255),
                secondary_color VARCHAR(255),
                text_light VARCHAR(255),
                text_dark VARCHAR(255),
                company_address TEXT,
                email_address VARCHAR(255),
                phone_number VARCHAR(15),
                company_description TEXT,
                product_fields JSONB DEFAULT NULL
            );
        `;
    await dbClient.query(createTableQuery);

    // Step 2: Insert data into the table
    const insertQuery = `
            INSERT INTO settings_table (
                company_name,
                primary_color,
                secondary_color,
                text_light,
                text_dark,
                company_address,
                email_address,
                phone_number,
                company_description,
                product_fields
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;

    const values = [
      settingsData.company_name,
      settingsData.primary_color,
      settingsData.secondary_color,
      settingsData.text_light,
      settingsData.text_dark,
      settingsData.company_address,
      settingsData.email_address,
      settingsData.phone_number,
      settingsData.company_description,
      settingsData.product_fields || null,
    ];

    const result = await dbClient.query(insertQuery, values);
    return result;
  } catch (error) {
    throw new Error(`Error in createTableAndInsertSettings: ${error.message}`);
  }
};

exports.getCompanyInfo = async (dbClient) => {
  try {
    const result = await dbClient.query("SELECT * FROM settings_table");
    return result.rows;
  } catch (error) {
    throw new Error("Error fetching company info");
  }
};

exports.updateSettings = async (settingsData, dbClient) => {
  try {
    const fieldsToUpdate = [];
    const values = [];

    let index = 1;

    // Dynamically build the SET clause for the query
    for (const key in settingsData) {
      if (settingsData[key] !== undefined) {
        // Avoid undefined values
        if (key === "product_fields" && typeof settingsData[key] !== "string") {
          // Convert product_fields to a JSON string
          fieldsToUpdate.push(`${key} = $${index}`);
          values.push(JSON.stringify(settingsData[key]));
        } else {
          fieldsToUpdate.push(`${key} = $${index}`);
          values.push(settingsData[key]);
        }
        index++;
      }
    }

    // values.push(id); // Add the `id` for the WHERE clause
    console.log("????????", fieldsToUpdate.join(", "), values);

    const updateQuery = `
            UPDATE settings_table
            SET ${fieldsToUpdate.join(", ")}
            RETURNING *;
        `;

    // Execute the update query
    const result = await dbClient.query(updateQuery, values);
    return result;
  } catch (error) {
    throw new Error(`Error updating settings: ${error.message}`);
  }
};
