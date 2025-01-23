const express = require("express");
const router = express.Router();
const {
  addProduct,
  fetchFilters,
  getFilteredProducts,
  searchProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/productsController");

router.post("/", addProduct);
router.get("/", searchProducts);
router.delete("/:productId", deleteProduct);
router.put("/:product_id", updateProduct);
router.get("/filters", fetchFilters);
router.get("/filtered-products", getFilteredProducts);

module.exports = router;
