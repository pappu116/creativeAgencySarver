const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bfpdn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("service"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("HelloFrom Db its Working !");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const serviceCollection = client.db("creativeAgency").collection("services");
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const adminCollection = client.db("creativeAgency").collection("admin");

  // //service  red code
  app.get("/service", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // //order  red code
  app.get("/order", (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // //order  red code
  app.get("/rivews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // add review code to

  app.post("/addReview", (req, res) => {
    const review = req.body;
    console.log(review);
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // add review code to

  app.post("/admin", (req, res) => {
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // add order code to

  // find admin or user code in
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    console.log(order);
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //service add code

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    console.log(title, description, file);

    const filePath = `${__dirname}/service/${file.name}`;
    file.mv(filePath, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "Failed to upload Image" });
      }

      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString("base64");

      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encImg, "base64"),
      };

      serviceCollection
        .insertOne({ title, description, image })
        .then((result) => {
          fs.remove(filePath, (error) => {
            if (error) {
              console.log(error);
              res.status(500).send({ msg: "Failed to upload Image" });
            }
            res.send(result.insertedCount > 0);
          });
        });
      // return res.send({ name: file.name, path: `/${file.name}` });
    });
  });
});

app.listen(process.env.PORT || port);
