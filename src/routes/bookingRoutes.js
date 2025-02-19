const express = require("express");
const router = express.Router();
const {
  addBooking,
  getBookings,
  getBookingById,
  getBookingByUserId,
  getTotalBookings,
  getMostBookedProduct,
  getBookingsByDate
} = require("../controllers/bookingController");

router.post("/", addBooking);
router.get("/", getBookings);
router.get("/most-booked-product", getMostBookedProduct);
router.get("/bookings-today", getBookingsByDate);
router.get("/total-count", getTotalBookings);
router.get("/:id", getBookingById);
router.get("/user-bookings/:id", getBookingByUserId);

module.exports = router;
