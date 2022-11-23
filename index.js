/** @format */

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());
// requiring jwt and dotenv
require("dotenv").config();
const jwt = require("jsonwebtoken");

// root api
app.get("/", (req, res) => {
  res.send("Welcome, CarsLobby server is Running successfully");
});
app.listen(port, (req, res) => {
  console.log(`CarsLobby Server is running at port: ${port}`);
});
