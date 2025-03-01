const {
  getProductFields,
  createProductsTable,
  insertProduct,
  getProductById,
  fetchFilters,
  getFilteredProducts,
  getProducts,
  deleteProduct,
  updateProduct,
  getFilteredAndSearchedProducts
} = require("../models/productsModel");

exports.addProduct = async (req, res) => {
  try {
    // Step 1: Fetch product_fields from settings_table
    const productFields = await getProductFields(req.db);

    if (!productFields || productFields.length === 0) {
      return res
        .status(400)
        .json({ message: "No product fields found in settings_table." });
    }

    // Step 2: Dynamically create the table if it doesn't exist
    await createProductsTable(req.db, productFields);

    // Step 3: Insert user-provided data into the products table
    const result = await insertProduct(req.db, req.body);

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

exports.getProductById = async (req, res) => {
  const { productId } = req.params; // Extract user_id from path parameters

  try {
    if (!productId) {
      return res.status(400).json({
        message: "Error: product_id is required.",
      });
    }

    const result = await getProductById(req.db, productId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      message: "Error fetching product.",
      error: error.message,
    });
  }
};

exports.getFilteredProducts = async (req, res) => {
  try {
    console.log("::::::::")
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

exports.getProducts = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const products = await getProducts(req.db, parseInt(limit), parseInt(offset));

    res.status(200).json({
      message: "Products fetched successfully.",
      products,
    });
  } catch (error) {
    console.error("Error in getProducts:", error.message);
    res.status(500).json({
      message: "Error fetching products.",
      error: error.message,
    });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Extract productId from route parameters

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required.",
      });
    }

    // Call the model to delete the product
    const deletedProduct = await deleteProduct(req.db, productId);

    res.status(200).json({
      message: "Product deleted successfully.",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error.message);
    res.status(500).json({
      message: "Error deleting product.",
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Fetch product ID from route params
    const updateData = req.body; // Data to update comes from the request body

    console.log(">>>", req.params, productId);

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }

    // Update the product
    const updatedProduct = await updateProduct(req.db, productId, updateData);

    res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error.message);
    res.status(500).json({
      message: "Error updating product.",
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

exports.getFilteredAndSearchedProducts = async (req, res) => {
  try {
    console.log("::::: Fetching Filtered & Searched Products :::::");
    
    
    const { search } = req.query; // Get search keyword from query params
    const { limit = 10, offset = 0 } = req.query;
    const filters = req.body.filters || {}; // Get filters from request body
    console.log("+++", filters, req.body)
    // Call a common function to get products based on search & filters
    const products = await getFilteredAndSearchedProducts(req.db, search, filters, parseInt(limit), parseInt(offset));

    res.status(200).json({
      message: "Products retrieved successfully.",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      message: "Error retrieving products.",
      error: error.message,
    });
  }
};

