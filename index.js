const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Simple crud is running");
});

app.listen(port, () => {
  console.log(`crud is running through ${port}`);
});

const uri =
  "mongodb+srv://samiullahsagor:zfHtJFucCrmqV2gx@cluster0.zunyezi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //////////////////// User APIs/////////////////////////////
    const usersDB = client.db("readopiaDB").collection("users");

    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await usersDB.insertOne(users);
      res.send(result);
    });

    //////////////////// Book Category info APIs/////////////////////////////
    const categoryCollection = client.db("readopiaDB").collection("categories");
    app.post("/categories", async (req, res) => {
      const category = req.body;
      console.log(category);
      const result = await categoryCollection.insertOne(category);
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const data = categoryCollection.find();
      const result = await data.toArray();
      res.send(result);
    });

    ////////////////////book Data APIs/////////////////////////

    const bookCollection = client.db("readopiaDB").collection("books");

    app.post("/books", async (req, res) => {
      const book = req.body;
      console.log(book);
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.get("/books/:name", async (req, res) => {
      const name = req.params.name;
      const query = { name: name };
      const book = await bookCollection.findOne(query);
      res.send(book);
    });

    app.put("/books/:id", async (req, res) => {
      const data = req.body;
      console.log(data.reduced)
      const paramsId = req.params.id;
      const filter = { _id: new ObjectId(paramsId) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: data.reduced,
        },
      };
      const result = await bookCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    











    app.get("/categories/:name", async (req, res) => {
      const categoryName = req.params.name;

      const result = await bookCollection
        .find({ category: categoryName })
        .toArray();
      res.send(result);
    });

    //////////borrowedBooks////////////
    const borrowdBooks = client.db("readopiaDB").collection("borrowed");

    app.post("/borrowed", async (req, res) => {
      const borrowed= req.body;
      const result = await borrowdBooks.insertOne(borrowed);
      res.send(result);
    });


    //////////////////////////////////////////////////////////////////

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
