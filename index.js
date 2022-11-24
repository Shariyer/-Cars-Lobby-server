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

// jwt function verification
const jwtVerification = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  // console.log(authorizationHeader);
  if (!authorizationHeader) {
    return res.status(401).send("access-unauthorized");
  }
  const receivedToken = authorizationHeader.split(" ")[1];
  jwt.verify(receivedToken, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });

  // console.log("only token", receivedToken);
};

// data base connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dhtiicz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // jwt token api
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = {
        email: email,
      };
      const user = await usersCollection.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: " " });
    });
    // users get api
    const usersCollection = client.db("carsLobby").collection("users");
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      if (email) {
        const query = {
          email: email,
        };
      }
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    // users post api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
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
