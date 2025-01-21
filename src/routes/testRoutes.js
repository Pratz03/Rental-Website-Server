const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await req.db;
    res.json({ message: "Yeahhhhhhhhhhh!!!", result: result });
  } catch (error) {
    res.json({ message: "Nahhhhhhhhhhh!!!" });
  }
}); // Login

module.exports = router;
