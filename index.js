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
    const usersCollection = client.db("carsLobby").collection("users");
    const categoriesCollection = client
      .db("carsLobby")
      .collection("categories");
    const carsCollection = client.db("carsLobby").collection("cars");
    const bookingsCollection = client.db("carsLobby").collection("bookings");
    // jwt token api
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = {
        email: email,
      };
      const user = await usersCollection.findOne(query);
      console.log(user);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: " " });
    });
    // users get api
    app.get("/users", jwtVerification, async (req, res) => {
      const email = req.query.email;
      console.log("query", email);
      const decodedEmail = req.decoded.email;
      console.log("decoded ", decodedEmail);
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      let query = {};
      if (email) {
        query = {
          email: email,
        };
      }
      const users = await usersCollection.find(query).toArray();

      res.send(users);
    });
    // users post api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    //all cars / products collection api
    app.get("/cars", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const categoryName = req.query.categoryName;
      const sellerEmail = req.query.sellerEmail;
      let query = {};
      if (sellerEmail) {
        query = {
          sellerEmail: sellerEmail,
        };
      } else if (categoryName) {
        query = {
          categoryName: categoryName,
        };
      }
      const cars = await carsCollection.find(query).toArray();
      // const bookedcars = cars.map((car) => car.pro);
      res.send(cars);
    });
    // categories collection api
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });
    // car bookings
    app.post("/bookings", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
    // My orders api from booking
    app.get("/bookings", jwtVerification, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      // console.log(email, "booking ");
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const query = {
        customerEmail: email,
      };
      const result = await bookingsCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });
    // admin or not
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.userType === "admin" });
    });
    // is seller or not
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.userType === "seller" });
    });
    // is buyer or not
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.userType === "buyer" });
    });
    // all sellers
    app.get("/users/allsellers", jwtVerification, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const query = {
        userType: "seller",
      };
      const sellers = await usersCollection.find(query).toArray();
      console.log(sellers);
      res.send(sellers);
    });
    // all buyers
    app.get("/users/allBuyers", async (req, res) => {
      const query = {
        userType: "buyer",
      };
      const buyers = await usersCollection.find(query).toArray();
      console.log(buyers);
      res.send(buyers);
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
  console.log(`CarsLobby is running at port: ${port}`);
});
