const express = require("express");
require("dotenv/config");
const cors = require("cors");
const adminRoutes = require("./src/routes/adminRoutes");
const authRoutes = require("./src/routes/authRoutes");
const testRoutes = require("./src/routes/testRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");
const productsRoutes = require("./src/routes/productsRoutes");
const userRoutes = require("./src/routes/userRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const { authenticateToken } = require("./src/middlewares/authMiddleware");
const dbMiddleware = require("./src/middlewares/dbMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/clients", adminRoutes);
app.use("/auth", authRoutes); // Auth routes (login & token refresh)
app.use("/test", authenticateToken, dbMiddleware, testRoutes);
app.use("/settings", authenticateToken, dbMiddleware, settingsRoutes);
app.use("/products", authenticateToken, dbMiddleware, productsRoutes);
app.use("/users", authenticateToken, dbMiddleware, userRoutes);
app.use("/bookings", authenticateToken, dbMiddleware, bookingRoutes);

// Error handling middleware
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
