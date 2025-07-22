// Import required modules
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// PostgreSQL database configuration
const db = new pg.Client({
  user: process.env.USER_DB,
  host: process.env.HOST,
  database: process.env.DB,
  password: process.env.PASSWORD_DB,
  port: process.env.PORT_DB,
  ssl: { rejectUnauthorized: false }
});
db.connect();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Default in-memory items list (used before DB connection)
let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Connesso al database!');
    client.release();
  } catch (error) {
    console.error('Errore nella connessione al database:', error);
  }
}

testConnection();
// Route: Display the list page
app.get("/", async (req, res) => {
  try {
    // Fetch all items from the database
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;

    // Render the index page with list data
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.log(err);
  }
});

// Route: Add a new item
app.post("/add", async (req, res) => {
  const item = req.body.newItem;

  // Insert the new item into the database
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Route: Edit an existing item
app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  // Update the item title in the database
  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Route: Delete an item
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;

  // Delete the item from the database
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
