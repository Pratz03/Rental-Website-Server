const express = require("express");
const { getSettings, createSettings, updateSettings } = require("../controllers/settingsController")

const router = express.Router();

router.get("/", getSettings);
router.post("/create-settings", createSettings);
router.put("/update-settings", updateSettings);

module.exports = router;
