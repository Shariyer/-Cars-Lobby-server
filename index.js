/** @format */

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());
// requiring jwt and dotenv
require("dotenv").config();
const jwt = require("jsonwebtoken");

// data base connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dhtiicz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("carsLobby").collection("users");
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

// root api
app.get("/", (req, res) => {
  res.send("Welcome, CarsLobby server is Running successfully");
});
app.listen(port, (req, res) => {
  console.log(`CarsLobby Server is running at port: ${port}`);
});
