const {
  createUserTable,
  insertUser,
  getAndSearchUsers,
  checkConflicts,
  updateUser,
  getUser,
} = require("../models/userModel");

exports.addUser = async (req, res) => {
  const {
    full_name,
    username,
    password,
    profile_photo,
    phone,
    email,
    city,
    address,
    role,
  } = req.body;

  // Ensure all required fields are present
  if (
    !full_name ||
    !username ||
    !password ||
    !phone ||
    !email ||
    !city ||
    !address ||
    !role
  ) {
    return res.status(400).json({
      message: "Required fields are missing.",
    });
  }

  try {
    await createUserTable(req.db);

    // Call the model to insert the user
    const result = await insertUser(req.db, {
      full_name,
      username,
      password,
      profile_photo,
      phone,
      email,
      city,
      address,
      role,
    });
    res.status(201).json({
      message: "User added successfully!",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      // Unique violation code in PostgreSQL
      return res.status(409).json({
        message:
          "Conflict: A user with the same username, phone, or email already exists.",
        error: error.detail,
      });
    }

    res.status(500).json({
      message: "Error adding user.",
      error: error.message,
    });
  }
};

exports.getAndSearchUsers = async (req, res) => {
  const searchValue = req.query.search || ""; // Get the search value from query params

  try {
    // Call the model to perform the search
    const result = await getAndSearchUsers(req.db, searchValue);
    res.status(200).json({
      message: searchValue
        ? "Search results fetched successfully!"
        : "All users fetched successfully!",
      users: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users.",
      error: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  const { id } = req.params; // Extract user_id from path parameters

  try {
    if (!id) {
      return res.status(400).json({
        message: "Error: user_id is required.",
      });
    }

    const result = await getUser(req.db, id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "User fetched successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      message: "Error fetching user.",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params; // Extract user ID from the URL
  const { username, phone, email, ...otherFields } = req.body; // Extract fields from request body

  if (!id) {
    return res.status(400).json({
      message:
        "Error: user_id (as a path parameter) is required for updating the user.",
    });
  }

  try {
    // 1. Disallow updating the username field
    if (username) {
      return res.status(400).json({
        message: "Error: Username cannot be updated.",
      });
    }

    // 2. Check for conflicts if phone or email are being updated
    if (phone || email) {
      const conflictResult = await checkConflicts(req.db, phone, email, id);
      if (conflictResult.rows.length > 0) {
        return res.status(400).json({
          message:
            "Error: Phone or email already exists in the system. Provide unique values.",
        });
      }
    }

    // 3. Combine fields to update dynamically
    const updateFields = { ...otherFields };
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "Error: No fields provided to update.",
      });
    }

    const result = await updateUser(req.db, id, updateFields);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Error: User not found with the provided user_id.",
      });
    }

    // 4. Success response
    res.status(200).json({
      message: "User updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Error updating user.",
      error: error.message,
    });
  }
};
