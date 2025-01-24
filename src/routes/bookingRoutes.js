const express = require("express");
const router = express.Router();
const { addBooking, getBookings, getBookingById } = require("../controllers/bookingController");

router.post("/", addBooking);
router.get("/", getBookings);
router.get("/:id", getBookingById);

module.exports = router;
