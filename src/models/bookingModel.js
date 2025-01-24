exports.createBookingTable = async (dbClient) => {
  try {
    const createTable = `CREATE TABLE IF NOT EXISTS booking_table (
            booking_id SERIAL PRIMARY KEY, 
            booking_date DATE NOT NULL, 
            pickup_date DATE NOT NULL, 
            drop_date DATE NOT NULL, 
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            payment_status TEXT NOT NULL)`;

    await dbClient.query(createTable);

    return {
      message: "Table Created.",
    };
  } catch (error) {
    throw error;
  }
};

exports.addBooking = async (dbClient, bookingData) => {
  try {
    const {
      booking_date,
      pickup_date,
      drop_date,
      product_id,
      user_id,
      payment_status,
    } = bookingData;

    const values = [
      booking_date,
      pickup_date,
      drop_date,
      product_id,
      user_id,
      payment_status,
    ];

    const insertQuery = `INSERT INTO 
      booking_table (booking_date, pickup_date, drop_date, product_id, user_iD, payment_statuS) 
      VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;

    const result = dbClient.query(insertQuery, values);

    return result;
  } catch (error) {
    throw error;
  }
};

exports.getBookings = async (dbClient) => {
  try {
    const result = await dbClient.query("SELECT * FROM booking_table");
    return result;
  } catch (error) {
    throw error.message;
  }
};

exports.getBookingById = async (dbClient, bookingId) => {
  try {
    const result = await dbClient.query("SELECT * FROM booking_table WHERE booking_id = $1", [bookingId]);
    return result;
  } catch (error) {
    throw error;
  }
}
