const { getCompanyInfo, createTableAndInsertSettings, updateSettings  } = require("../models/settingsModel");

exports.createSettings = async (req, res) => {
    try {
        const {
            company_name,
            primary_color,
            secondary_color,
            text_light,
            text_dark,
            company_address,
            email_address,
            phone_number,
            company_description,
            product_fields = null,
        } = req.body;

        // Validate mandatory fields
        if (
            !company_name ||
            !primary_color ||
            !secondary_color ||
            !text_light ||
            !text_dark ||
            !company_address ||
            !email_address ||
            !phone_number ||
            !company_description
        ) {
            return res.status(400).json({ error: "All fields except 'product_fields' are required." });
        }

        const settingsData = {
            company_name,
            primary_color,
            secondary_color,
            text_light,
            text_dark,
            company_address,
            email_address,
            phone_number,
            company_description,
            product_fields,
        };

        // Create table if it doesn’t exist and insert settings
        const result = await createTableAndInsertSettings(settingsData, req.db);

        res.status(201).json({ message: "Settings created successfully!", record: result.rows[0] });
    } catch (error) {
        console.error("Error creating settings:", error.message);
        res.status(500).json({ error: "An error occurred while creating settings." });
    }
};

exports.getSettings = async (req, res) => {
  try {
    const companyInfo = await getCompanyInfo(req.db); // Pass `req.db` (client-specific DB connection)
    res.json({ message: "Yeahhhhhhhhhhh!!!", result: companyInfo });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error retrieving company settings" });
  } finally {
    await req.db.end(); // Close the client-specific DB connection
  }
};

exports.updateSettings = async (req, res) => {
    try {
        const settingsData = req.body; // Fields to update

        if (!settingsData || Object.keys(settingsData).length === 0) {
            return res.status(400).json({ error: "No data provided to update." });
        }

        console.log(">>>", settingsData);
        // Call the model to update settings
        const result = await updateSettings( settingsData, req.db);

        if (result.rowCount > 0) {
            res.json({ message: "Settings updated successfully!", updated: result.rows[0] });
        } else {
            res.status(404).json({ error: "No record found with the provided ID." });
        }
    } catch (error) {
        console.error("Error updating settings:", error.message);
        res.status(500).json({ error: "An error occurred while updating settings." });
    }
};
