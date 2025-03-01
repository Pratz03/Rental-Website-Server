exports.getProductFields = async (dbClient) => {
  try {
    const result = await dbClient.query(
      "SELECT product_fields FROM settings_table LIMIT 1"
    );
    return result.rows.length > 0 ? result.rows[0].product_fields : null;
  } catch (error) {
    throw new Error("Error fetching product fields: " + error.message);
  }
};

exports.createProductsTable = async (dbClient, productFields) => {
  try {
    let createTableQuery = `CREATE TABLE IF NOT EXISTS products_table (
            product_id SERIAL PRIMARY KEY,
            booking_status JSONB`; // Unique product ID

    // Dynamically add columns based on product fields
    productFields.forEach((field) => {
      createTableQuery += `, ${field.key} ${field.dataType.toUpperCase()}`; // Use dataType from the object
    });

    createTableQuery += `);`; // Close the query
    await dbClient.query(createTableQuery);
  } catch (error) {
    throw new Error("Error creating products table: " + error.message);
  }
};

exports.insertProduct = async (dbClient, productData) => {
  try {
    const insertColumns = Object.keys(productData);
    const insertValues = insertColumns.map((key) => {
      // Convert 'booking_status' to valid JSONB format if it exists
      if (key === "booking_status" && productData[key]) {
        return JSON.stringify(productData[key]); // Ensure JSON string for JSONB field
      }
      return productData[key]; // Handle other fields as-is
    });

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`);

    const insertQuery = `
            INSERT INTO products_table (${insertColumns.join(", ")})
            VALUES (${placeholders.join(", ")})
            RETURNING *;
        `;

    // Execute the query with the processed values
    const result = await dbClient.query(insertQuery, insertValues);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error inserting product data: " + error.message);
  }
};

exports.getProductById = async (dbClient, productId) => {
  try {
    const query = "SELECT * FROM products_table WHERE product_id = $1";
    const values = [productId];
    return await dbClient.query(query, values);
  } catch (error) {
    throw new Error("Error searching product: " + error.message);
  }
};

exports.getFilteredProducts = async (dbClient, filters) => {
  try {
    console.log(">>>>>>>>>>>>>>>>")
    const conditions = [];
    const values = [];
    let index = 1;

    // Build the dynamic WHERE clause based on the filters
    for (const [key, filter] of Object.entries(filters)) {
      if (Array.isArray(filter)) {
        // Handle array filters with the ANY operator
        conditions.push(`${key} = ANY($${index})`);
        values.push(filter);
      } else if (
        typeof filter === "object" &&
        filter.min !== undefined &&
        filter.max !== undefined
      ) {
        // Handle range filters with BETWEEN
        conditions.push(`${key} BETWEEN $${index} AND $${index + 1}`);
        values.push(filter.min, filter.max);
        index++; // Increment index for the second value
      } else {
        // Handle single equality filters
        conditions.push(`${key} = $${index}`);
        values.push(filter);
      }
      index++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT * FROM products_table ${whereClause}`;

    console.log("+++++++++++++++++++", query, values)

    const { rows } = await dbClient.query(query, values);
    return rows;
  } catch (error) {
    throw new Error("Error retrieving products: " + error.message);
  }
};

exports.getProducts = async (dbClient, limit, offset) => {
  try {
    // Construct SQL query with LIMIT and OFFSET for pagination
    const query = `
      SELECT * FROM products_table 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;

    // Execute the query with limit and offset values
    const result = await dbClient.query(query, [limit, offset]);

    return result.rows;
  } catch (error) {
    throw new Error("Error retrieving products: " + error.message);
  }
};


exports.deleteProduct = async (dbClient, productId) => {
  try {
    // SQL query to delete the product based on product_id
    const deleteQuery = `DELETE FROM products_table WHERE product_id = $1 RETURNING *;`;
    const result = await dbClient.query(deleteQuery, [productId]);

    // Check if the product was deleted (RETURNING will be empty if not)
    if (result.rowCount === 0) {
      throw new Error("Product not found or already deleted.");
    }

    return result.rows[0]; // Return the deleted product's details
  } catch (error) {
    throw new Error("Error deleting product: " + error.message);
  }
};

exports.updateProduct = async (dbClient, productId, updateData) => {
  try {
    // Generate SQL for updating dynamic columns
    const updateColumns = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`) // Start placeholders from $2
      .join(", ");

    if (!updateColumns) {
      throw new Error("No data provided to update the product.");
    }

    // Prepare SQL query
    const updateQuery = `
      UPDATE products_table
      SET ${updateColumns}
      WHERE product_id = $1
      RETURNING *;
    `;

    // Prepare values for query (start with productId and then the rest)
    const values = [productId, ...Object.values(updateData)];

    // Execute query
    const result = await dbClient.query(updateQuery, values);

    // Check if product was updated
    if (result.rowCount === 0) {
      throw new Error("No product found with the given ID.");
    }

    return result.rows[0];
  } catch (error) {
    throw new Error("Error updating product: " + error.message);
  }
};

exports.fetchFilters = async (dbClient) => {
  try {
    const excludedColumns = [
      "product_id",
      "product_name",
      "image",
      "description",
      "booking_status",
      "created_at"
    ];

    // Fetch column information dynamically
    const columnQuery = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'products_table'
              AND column_name NOT IN (${excludedColumns
                .map((col) => `'${col}'`)
                .join(", ")});
        `;

    const columnInfo = await dbClient.query(columnQuery);
    const filters = [];

    // Iterate over columns and fetch unique values and range if numeric
    for (const column of columnInfo.rows) {
      const { column_name, data_type } = column;

      if (
        ["integer", "numeric", "real", "double precision"].includes(data_type)
      ) {
        const numericQuery = `
                    SELECT
                        array_agg(DISTINCT ${column_name}) AS unique_values,
                        MIN(${column_name}) AS min_value,
                        MAX(${column_name}) AS max_value
                    FROM products_table;
                `;

        const result = await dbClient.query(numericQuery);
        const { unique_values, min_value, max_value } = result.rows[0];

        filters.push({
          column_name,
          data_type,
          unique_values,
          min_value,
          max_value,
        });
      } else {
        const uniqueQuery = `
                    SELECT array_agg(DISTINCT ${column_name}) AS unique_values
                    FROM products_table;
                `;

        const result = await dbClient.query(uniqueQuery);
        const { unique_values } = result.rows[0];

        filters.push({
          column_name,
          data_type,
          unique_values,
        });
      }
    }

    return filters;
  } catch (error) {
    console.error("Error fetching filters:", error);
    res
      .status(500)
      .json({ message: "Error fetching filters.", error: error.message });
  }
};

exports.getFilteredAndSearchedProducts = async (dbClient, searchQuery, filters, limit, offset) => {
  try {
    console.log("::::: Fetching Filtered & Searched Products :::::");
    console.log("Received Body:", filters);  // Debugging
    console.log("Received Query Params:", searchQuery);

    const conditions = [];
    const values = [];
    let index = 1;

    const columnsResult = await dbClient.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products_table' 
        AND column_name NOT IN ('product_id', 'booking_status');
    `);
    const columnNames = columnsResult.rows.map((row) => row.column_name);

    if (columnNames.length === 0) {
      throw new Error("No searchable columns found in products_table.");
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const searchConditions = columnNames
        .map((column) => `${column}::TEXT ILIKE $${index}`)
        .join(" OR ");
      conditions.push(`(${searchConditions})`);
      values.push(`%${searchQuery}%`);
      index++;
    }

    // Step 3: Handle Filters
    for (const [key, filter] of Object.entries(filters)) {
      if (Array.isArray(filter)) {
        // Handle array filters with the ANY operator
        conditions.push(`${key} = ANY($${index})`);
        values.push(filter);
      } else if (
        typeof filter === "object" &&
        filter.min !== undefined &&
        filter.max !== undefined
      ) {
        // Handle range filters with BETWEEN
        conditions.push(`${key} BETWEEN $${index} AND $${index + 1}`);
        values.push(filter.min, filter.max);
        index++; // Increment index for the second value
      } else {
        // Handle single equality filters
        conditions.push(`${key} = $${index}`);
        values.push(filter);
      }
      index++;
    }

    // Step 4: Construct Final Query
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT * FROM products_table ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log("Executing Query:", query, values);

    const { rows } = await dbClient.query(query, values);
    return rows;
  } catch (error) {
    throw new Error("Error retrieving products: " + error.message);
  }
};

