const { json } = require("express");
const {
  createBookingTable,
  addBooking,
  getBookings,
  getBookingById,
  getBookingByUserId,
  getMonthBookings,
  getBookingsByDate,
  getMostBookedProduct
} = require("../models/bookingModel");

exports.addBooking = async (req, res) => {
  try {
    const bookings_data = req.body;

    const tableCreated = await createBookingTable(req.db);

    const result = await addBooking(req.db, bookings_data);

    res.json({ message: "Data Inserted", data: result });
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

exports.getBookingByUserId = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await getBookingByUserId(req.db, id);

    if (result.rows.length === 0) {
      throw new Error("No booking found.");
    }

    res.json({
      message: "Fetched booking.",
      result: result.rows,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getTotalBookings = async (req, res) => {
  try {
    const result = await getBookings(req.db);
    const bookings_today = await getTodayBookings(req.db);
    const bookings_month = await getMonthBookings(req.db);

    res.json({
      message: "Fetched bookings",
      total_bookings: result.rows.length,
      bookings_today: bookings_today.rows.length,
      bookings_month: bookings_month.rows.length
    });
  } catch (error) {
    res.json({ Error: error.message });
  }
};

exports.getMostBookedProduct = async (req, res) => {
  console.log(">>>>>>>>>");
  
  try {
    const result = await getMostBookedProduct(req.db);

    res.json(result);
  } catch (error) {
    res.json({ Error: error.message });
  }
}

exports.getBookingsByDate = async (req, res) => {
  console.log(">>>>>>>>>");
  
  try {
    const result = await getBookingsByDate(req.db);

    res.json(result);
  } catch (error) {
    res.json({ Error: error.message });
  }
}