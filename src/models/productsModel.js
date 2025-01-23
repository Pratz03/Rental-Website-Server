// Fetch product_fields from settings_table
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

// Dynamically create products table
exports.createProductsTable = async (dbClient, productFields) => {
  try {
    let createTableQuery = `CREATE TABLE IF NOT EXISTS products_table (
            product_id SERIAL PRIMARY KEY`; // Unique product ID

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

// Insert product data into products table
// Insert product data into products table
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

exports.fetchFilters = async (dbClient) => {
  try {
    const excludedColumns = [
      "product_id",
      "product_name",
      "image",
      "description",
      "booking_status",
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

exports.getFilteredProducts = async (dbClient, filters) => {
  try {
      const conditions = [];
      const values = [];
      let index = 1;

      // Build the dynamic WHERE clause based on the filters
      for (const [key, filter] of Object.entries(filters)) {
          if (Array.isArray(filter)) {
              // Handle array filters with the ANY operator
              conditions.push(`${key} = ANY($${index})`);
              values.push(filter);
          } else if (typeof filter === "object" && filter.min !== undefined && filter.max !== undefined) {
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

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const query = `SELECT * FROM products_table ${whereClause}`;

      const { rows } = await dbClient.query(query, values);
      return rows;
  } catch (error) {
      throw new Error("Error retrieving products: " + error.message);
  }
};

exports.searchAndFilterProducts = async (dbClient, filterConditions, searchTerm, filterValues) => {
  try {
    // Step 1: Fetch column names dynamically excluding product_id and booking_status
    const columnQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'products_table' AND column_name NOT IN ('product_id', 'booking_status');
    `;
    const columnsResult = await dbClient.query(columnQuery);
    
    // Store dynamic columns and their types (can be expanded)
    const columnDetails = columnsResult.rows;

    // Step 2: Start with basic query where TRUE is the default condition
    let query = `SELECT * FROM products_table WHERE TRUE`;
    const values = [...filterValues];  // Include initial filter values

    let index = values.length + 1;  // Placeholders start here for filters

    // Step 3: Add dynamic filter conditions based on passed parameters
    filterConditions.forEach(({ column, value, dataType }) => {
      // Add filter logic based on data type
      const columnType = columnDetails.find(col => col.column_name === column)?.data_type.toUpperCase() || 'TEXT';
      
      if (columnType === 'TEXT' || columnType === 'VARCHAR') {
        query += ` AND ${column} ILIKE $${index}`;  // Handle case-insensitive match for TEXT type
      } else if (columnType === 'INTEGER' || columnType === 'NUMERIC') {
        query += ` AND ${column} = $${index}`;  // Handle number columns
      } else if (columnType === 'DATE' || columnType === 'TIMESTAMP') {
        query += ` AND ${column} = $${index}`;  // Handle date columns
      }
      values.push(value); // Append filter value for this condition
      index++;
    });

    // Step 4: Add search term if provided
    if (searchTerm) {
      const searchClauses = columnDetails.map((column, idx) => {
        if (column.data_type === 'TEXT' || column.data_type === 'VARCHAR') {
          return `(${column.column_name} ILIKE $${index + idx})`;
        }
        return `(${column.column_name}::TEXT ILIKE $${index + idx})`; // Cast to TEXT for comparison in search
      });

      query += ` AND (${searchClauses.join(' OR ')})`;  // Combine multiple OR clauses for searching across columns
      values.push(...new Array(columnDetails.length).fill(`%${searchTerm}%`));
      index += columnDetails.length;  // Update index for placeholders
    }

    // Step 5: Execute the query with dynamic conditions
    const result = await dbClient.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error("Error searching and filtering products: " + error.message);
  }
};





