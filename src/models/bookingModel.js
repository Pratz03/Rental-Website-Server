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

exports.addBooking = async (dbClient, bookings) => {
  try {
    if (!Array.isArray(bookings) || bookings.length === 0) {
      throw new Error("Invalid input: bookings should be a non-empty array.");
    }

    // Extract values dynamically
    const values = [];
    const placeholders = bookings
      .map((_, index) => {
        const offset = index * 6; // 6 columns per booking
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
      })
      .join(", ");

    bookings.forEach((booking) => {
      values.push(
        booking.booking_date,
        booking.pickup_date,
        booking.drop_date,
        booking.product_id,
        booking.user_id,
        booking.payment_status
      );
    });

    const insertQuery = `
      INSERT INTO booking_table 
      (booking_date, pickup_date, drop_date, product_id, user_id, payment_status) 
      VALUES ${placeholders} 
      RETURNING *, created_at;
    `;

    const result = await dbClient.query(insertQuery, values);

    return result.rows;
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
    const result = await dbClient.query(
      "SELECT * FROM booking_table WHERE booking_id = $1",
      [bookingId]
    );
    return result;
  } catch (error) {
    throw error;
  }
};

exports.getBookingByUserId = async (dbClient, userId) => {
  try {
    const result = await dbClient.query(
      "SELECT * FROM booking_table WHERE user_id = $1",
      [userId]
    );
    return result;
  } catch (error) {
    throw error;
  }
};

exports.getMonthBookings = async (dbClient) => {
  try {
    const result = await dbClient.query(`SELECT * FROM booking_table 
      WHERE EXTRACT(MONTH FROM booking_date) = EXTRACT(MONTH FROM CURRENT_DATE)`);
    return result;
  } catch (error) {
    throw error.message;
  }
};

exports.getBookingsByDate = async (dbClient) => {
  try {
    const result = await dbClient.query(
      `SELECT * FROM booking_table 
       WHERE DATE(created_at) = CURRENT_DATE`
    );

    // const result_month = await this.getMonthBookings(dbClient);

    // const total_bookings = await this.getBookings(dbClient);

    // if (result.rows.length === 0 || result_month.rows.length === 0) {
    //   return { message: "No bookings found" };
    // }

    return result;
  } catch (error) {
    console.error("Error fetching today's bookings:", error);
    throw error;
  }
};

exports.getMostBookedProduct = async (dbClient) => {
  console.log("+++++++++");
  
  try {
    const result = await dbClient.query(
      `SELECT COUNT(product_id) AS count_product, product_id 
       FROM booking_table 
       GROUP BY product_id 
       ORDER BY count_product DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return { message: "No bookings found" };
    }

    const mostBookedProductId = result.rows[0].product_id;
    const bookingCount = result.rows[0].count_product;

    const productQuery = await dbClient.query(
      `SELECT product_name FROM products_table WHERE product_id = $1`,
      [mostBookedProductId]
    );

    if (productQuery.rows.length === 0) {
      return {
        message: "Product not found",
        product_id: mostBookedProductId,
        booking_count: bookingCount,
      };
    }

    const productName = productQuery.rows[0].product_name;

    return {
      product_id: mostBookedProductId,
      product_name: productName,
      booking_count: bookingCount,
    };
  } catch (error) {
    console.error("Error fetching most booked product:", error);
    throw error;
  }
};
