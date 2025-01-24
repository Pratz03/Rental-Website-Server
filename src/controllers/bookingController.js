const { json } = require("express");
const {
  createBookingTable,
  addBooking,
  getBookings,
  getBookingById
} = require("../models/bookingModel");

exports.addBooking = async (req, res) => {
  try {
    const {
      booking_date,
      pickup_date,
      drop_date,
      product_id,
      user_id,
      payment_status,
    } = req.body;

    const tableCreated = await createBookingTable(req.db);

    const result = await addBooking(req.db, {
      booking_date,
      pickup_date,
      drop_date,
      product_id,
      user_id,
      payment_status,
    });

    res.json({ message: "Data Inserted", data: result.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const result = await getBookings(req.db);
    res.json({
      message: "Fetched all bookings",
      result: result.rows,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await getBookingById(req.db, id);
    res.json({
      message: "Fetched booking.",
      result: result.rows[0],
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};
