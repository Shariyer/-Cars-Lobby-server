/** @format */

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const reportsCollection = client.db("carsLobby").collection("reports");
    const advertisementsCollection = client
      .db("carsLobby")
      .collection("advertisements");
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
    app.get("/cars", async (req, res) => {
      const categoryName = req.query.categoryName;

      const query = {
        categoryName: categoryName,
      };
      const cars = await carsCollection.find(query).toArray();
      // const bookedcars = cars.map((car) => car.pro);
      res.send(cars);
    });
    // add car
    app.post("/cars", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });
    app.delete("/cars/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const result = await carsCollection.deleteOne(filter);
      res.send(result);
    });
    // loading specific sellers product
    app.get("/cars/:email", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const sellerEmail = req.params.email;

      const query = {
        sellerEmail: sellerEmail,
      };
      const cars = await carsCollection.find(query).toArray();
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
    // delete bookings
    app.delete("/bookings/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const result = await bookingsCollection.deleteOne(filter);
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
    // seller verified or not
    app.get("/users/allsellers/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({
        verification: user?.sellerStatus === "verified",
        user_id: user._id,
      });
    });
    // deleting seller
    app.delete("/users/allsellers/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });
    // seller verify
    app.put("/users/allSellers/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const upsert = { upsert: true };
      const updatedDoc = {
        $set: {
          sellerStatus: "verified",
        },
      };
      const productFilter = { _id: ObjectId(id) };
      const updatedDocForProduct = {
        $set: {
          sellerStatus: "verified",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        upsert
      );
      const sellerUpdateInproduct = await carsCollection.updateOne(
        productFilter,
        updatedDocForProduct,
        upsert
      );
      console.log(sellerUpdateInproduct);
      res.send(result);
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
    // deleting buyer
    app.delete("/users/allBuyers/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });
    // report products
    app.get("/reports", async (req, res) => {
      const query = {};
      const result = await reportsCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/reports/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const rReportedProducts = req.body;
      const id = req.params.id;
      // console.log(rReportedProducts, "reporteeddddd");

      const query = {
        _id: id,
      };

      const reportedItems = await reportsCollection.find(query).toArray();
      if (reportedItems.length === 0) {
        const result = await reportsCollection.insertOne(rReportedProducts);
        res.send(result);
      }
    });
    // delete reported items
    app.delete("/reports/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const id = req.params.id;
      const filter = {
        _id: id,
      };
      const result = await reportsCollection.deleteOne(filter);
      res.send(result);
    });
    // get adverting
    app.get("/advertise", async (req, res) => {
      const query = {};
      const result = await advertisementsCollection.find(query).toArray();
      res.send(result);
    });
    //post advertising
    app.post("/advertise/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const advertingProduct = req.body;
      const id = req.params.id;

      const query = {
        _id: id,
      };

      const advertiseMent = await advertisementsCollection
        .find(query)
        .toArray();
      // console.log(advertiseMent.length === 0);
      if (advertiseMent.length === 0) {
        const result = await advertisementsCollection.insertOne(
          advertingProduct
        );
        res.send(result);
      }
    });
    // stop advertising
    app.delete("/advertise/:id", jwtVerification, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      const id = req.params.id;
      const filter = {
        _id: id,
      };
      const result = await advertisementsCollection.deleteOne(filter);
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
  console.log(`CarsLobby is running at port: ${port}`);
});
