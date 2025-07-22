import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const { Pool } = pg;

const pool = new Pool({
  user: process.env.USER_DB,
  host: process.env.HOST,
  database: process.env.DB,
  password: process.env.PASSWORD_DB,
  port: process.env.PORT_DB,
  ssl: { rejectUnauthorized: false }
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

// Usa pool per tutte le query
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;
    res.render("index.ejs", { listTitle: "Today", listItems: items });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await pool.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  try {
    await pool.query("UPDATE items SET title = $1 WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

