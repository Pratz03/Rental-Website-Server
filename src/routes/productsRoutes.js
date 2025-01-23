const express = require("express");
const router = express.Router();
const { addProduct, fetchFilters, getFilteredProducts, searchAndFilterProducts } = require("../controllers/productsController");

router.post("/", addProduct);
router.get("/", searchAndFilterProducts);
router.get("/filters", fetchFilters);
router.get("/filtered-products", getFilteredProducts);

module.exports = router;
