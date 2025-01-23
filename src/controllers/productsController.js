const {
  productModel,
  fetchFilters,
  getFilteredProducts,
  searchAndFilterProducts,
} = require("../models/productsModel");

exports.addProduct = async (req, res) => {
  try {
    // Step 1: Fetch product_fields from settings_table
    const productFields = await productModel.getProductFields(req.db);

    if (!productFields || productFields.length === 0) {
      return res
        .status(400)
        .json({ message: "No product fields found in settings_table." });
    }

    // Step 2: Dynamically create the table if it doesn't exist
    await productModel.createProductsTable(req.db, productFields);

    // Step 3: Insert user-provided data into the products table
    const result = await productModel.insertProduct(req.db, req.body);

    // Step 4: Send success response
    res.status(200).json({
      message: "Product table updated and data inserted successfully!",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      message: "Error adding product.",
      error: error.message,
    });
  }
};

exports.fetchFilters = async (req, res) => {
  try {
    const filters = await fetchFilters(req.db);
    res.status(200).json({ filters });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res
      .status(500)
      .json({ message: "Error fetching filters.", error: error.message });
  }
};

exports.getFilteredProducts = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const products = await getFilteredProducts(req.db, filters);

    res.status(200).json({
      message: "Filtered products retrieved successfully.",
      products,
    });
  } catch (error) {
    console.error("Error retrieving filtered products:", error);
    res.status(500).json({
      message: "Error retrieving filtered products.",
      error: error.message,
    });
  }
};

exports.searchAndFilterProducts = async (req, res) => {
  try {
    const filters = req.query; // Extract query parameters for filtering and searching
    let { search, ...productFilters } = filters; // Extract the search and filters
    const searchTerm = search || ""; // Default to empty if not provided

    // Initialize the dynamic filter conditions
    const filterConditions = [];
    const filterValues = [];

    // Step 1: Build dynamic filters from params (dataType logic handled in model)
    for (let key in productFilters) {
      if (productFilters[key]) {
        const filterColumn = key;
        const filterValue = productFilters[key];

        // Example: Determine column type, but you can add other logic for different columns
        const dataType = "TEXT"; // Adjust logic for getting data type (e.g., 'INTEGER', 'DATE')
        filterConditions.push({
          column: filterColumn,
          value: filterValue,
          dataType,
        });
        filterValues.push(filterValue); // Collect filter values for query
      }
    }

    // Step 2: Search and filter products based on model logic
    const products = await searchAndFilterProducts(
      req.db,
      filterConditions,
      searchTerm,
      filterValues
    );

    res.status(200).json({
      message: "Filtered and searched products retrieved successfully.",
      products,
    });
  } catch (error) {
    console.error("Error in searchAndFilterProducts:", error);
    res.status(500).json({
      message: "Error filtering and searching products.",
      error: error.message,
    });
  }
};
