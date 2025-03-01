const express = require("express");
const router = express.Router();
const {
  addProduct,
  fetchFilters,
  getFilteredProducts,
  getProductById,
  getProducts ,
  deleteProduct,
  updateProduct,
  getFilteredAndSearchedProducts
} = require("../controllers/productsController");

router.post("/", addProduct);
router.get("/", getProducts );
router.get("/filters", fetchFilters);
router.post("/f&s-products", getFilteredAndSearchedProducts);
router.get("/filtered-products", getFilteredProducts);
router.get("/:productId", getProductById);
router.delete("/:productId", deleteProduct);
router.put("/:productId", updateProduct);

module.exports = router;
