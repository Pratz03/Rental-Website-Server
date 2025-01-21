const express = require("express");
require("dotenv/config");
const cors = require("cors");
const adminRoutes = require("./src/routes/adminRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/clients", adminRoutes);
app.use("/auth", authRoutes);      // Auth routes (login & token refresh)

// Error handling middleware
// app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});