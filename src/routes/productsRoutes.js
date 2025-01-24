const express = require("express");
const router = express.Router();
const {
  addProduct,
  fetchFilters,
  getFilteredProducts,
  getProductById,
  searchProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/productsController");

router.post("/", addProduct);
router.get("/", searchProducts);
router.get("/:productId", getProductById);
router.delete("/:productId", deleteProduct);
router.put("/:productId", updateProduct);
router.get("/filters", fetchFilters);
router.get("/filtered-products", getFilteredProducts);

module.exports = router;
