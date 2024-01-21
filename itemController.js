const { v4: uuidv4 } = require("uuid");
const pool = require("./database");

const listItem = async (req, res) => {
  try {
    const { itemName, price, category, location } = req.body;
    const sellerEmail = "admin@admin.com";
    const itemId = uuidv4();

    const insertQuery =
      "INSERT INTO items (sellerEmail, itemId, itemName, price, category, location) VALUES (?, ?, ?, ?, ?, ?)";

    await pool.query(insertQuery, [
      sellerEmail,
      itemId,
      itemName,
      price,
      category,
      location,
    ]);

    res.status(201).json({
      message: "Item listed successfully",
    });
  } catch (e) {
    console.error("Error", e);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getAllItems = (req, res) => {
  const { category, maxPrice, location } = req.query;

  let searchQuery = "SELECT * FROM items WHERE 1";

  const queryParams = [];

  if (category) {
    searchQuery += " AND category = ?";
    queryParams.push(category);
  }

  if (location) {
    searchQuery += " AND location = ?";
    queryParams.push(location);
  }

  if (maxPrice) {
    searchQuery += " AND price <= ?";
    queryParams.push(parseFloat(maxPrice));
  }

  pool.query(searchQuery, queryParams, (error, results) => {
    if (error) {
      console.error("Error fetching items from database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.status(200).json(results);
  });
};

const getItemDetails = (req, res) => {
  const itemId = req.params.itemId;

  const selectQuery = "SELECT * FROM items WHERE itemId = ?";

  pool.query(selectQuery, [itemId], (error, results) => {
    if (error) {
      console.error("Error fetching item details from database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const itemDetails = results[0];
    res.status(200).json(itemDetails);
  });
};

module.exports = {
  listItem,
  getAllItems,
  getItemDetails,
};
