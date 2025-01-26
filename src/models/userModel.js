exports.createUserTable = async (dbClient) => {
  console.log("userrrrrrrrrrrr");
  
  try {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS user_table (
          user_id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          profile_photo TEXT,
          phone TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          city TEXT NOT NULL,
          address TEXT NOT NULL,
          role TEXT NOT NULL
        );
      `;
    await dbClient.query(createTableQuery);
  } catch (error) {
    throw new Error("Error creating user table: " + error.message);
  }
};

// Model to insert user
exports.insertUser = async (dbClient, userData) => {
  try {
    console.log(">>>>", userData);
    
    const {
      username,
      password,
      profile_photo,
      phone,
      email,
      city,
      address,
      role,
    } = userData;
    const query = `
        INSERT INTO user_table (
          username, password, profile_photo, phone, email, city, address, role
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;

    const values = [
      username,
      password,
      profile_photo,
      phone,
      email,
      city,
      address,
      role,
    ];
    return await dbClient.query(query, values);
  } catch (error) {
    throw new Error("Error inserting user data: " + error.message);
  }
};

// Model to search users in the database
exports.getAndSearchUsers = async (dbClient, searchValue) => {
  console.log(">>>>>", dbClient);
  
  try {
    // Fetch all column names dynamically except excluded columns
    const columnQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'user_table'
        AND column_name NOT IN ('role', 'password', 'profile_photo');
      `;

    const columnResult = await dbClient.query(columnQuery);
    const columns = columnResult.rows.map((row) => row.column_name);

    // Construct the WHERE clause dynamically for the search
    let searchQuery = "SELECT * FROM user_table";
    const queryParams = [];

    if (searchValue) {
      const conditions = columns.map((column, index) => {
        queryParams.push(`%${searchValue}%`); // Add search value as a parameter
        return `${column}::TEXT ILIKE $${index + 1}`; // Search with ILIKE for all text columns
      });

      searchQuery += ` WHERE ${conditions.join(" OR ")}`; // Combine conditions with OR
    }

    searchQuery += " ORDER BY user_id;"; // Optional: Add ORDER BY for predictable results

    // Execute the search query
    return await dbClient.query(searchQuery, queryParams);
  } catch (error) {
    throw new Error("Error searching users: " + error.message);
  }
};

exports.getUser = async (dbClient, id) => {
  try {
    const query = "SELECT * FROM user_table WHERE user_id = $1";
    const values = [id];
    return await dbClient.query(query, values);
  } catch (error) {
    throw new Error("Error searching users: " + error.message);
  }
};

// Check for phone or email conflicts in user_table
exports.checkConflicts = async (dbClient, phone, email, userId) => {
  const query = `
      SELECT * FROM user_table 
      WHERE (phone = $1 OR email = $2) AND user_id != $3;
    `;
  const values = [phone || null, email || null, userId];
  return await dbClient.query(query, values);
};

// Update the user in user_table
exports.updateUser = async (dbClient, userId, updateFields) => {
  const keys = Object.keys(updateFields);
  const values = Object.values(updateFields);
  const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);

  const query = `
      UPDATE user_table
      SET ${setClauses.join(", ")}
      WHERE user_id = $${keys.length + 1}
      RETURNING *;
    `;

  // Add user_id to the values for WHERE clause
  return await dbClient.dbConnection.query(query, [...values, userId]);
};
