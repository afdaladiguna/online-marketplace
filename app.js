const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const pool = require("./database");

const itemController = require("./itemController");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    const existingUser = await pool.query(checkEmailQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(400).send("Email already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = "INSERT INTO users (email, password) VALUES (?, ?)";
    await pool.query(insertUserQuery, [email, hashedPassword]);

    const token = jwt.sign({ email }, "talentgrowth", { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const getUserQuery = "SELECT * FROM users WHERE email = ?";

    pool.query(getUserQuery, [email], async (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }

      const user = results[0];

      if (!user) {
        return res.status(401).send("Invalid email or password");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).send("Invalid email or password");
      }

      const token = jwt.sign({ email }, "talentgrowth", { expiresIn: "1h" });

      res.status(200).json({ message: "Login successful", token });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/items", itemController.getAllItems);

app.post("/items", itemController.listItem);

app.get("/items/:itemId", itemController.getItemDetails);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
