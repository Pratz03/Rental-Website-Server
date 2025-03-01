const express = require("express");
const router = express.Router();
const {
  addBooking,
  getBookings,
  getBookingById,
  getBookingByUserId,
  getTotalBookings,
  getMostBookedProduct,
} = require("../controllers/bookingController");

router.post("/", addBooking);
router.get("/", getBookings);
router.get("/most-booked-product", getMostBookedProduct);
router.get("/bookings-today", getTotalBookings);
router.get("/total-count", getTotalBookings);
router.get("/:id", getBookingById);
router.get("/user-bookings/:id", getBookingByUserId);

module.exports = router;
