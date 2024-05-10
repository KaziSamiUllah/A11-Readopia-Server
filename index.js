const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    app.post('/users', async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await usersDB.insertOne(users);
      res.send(result)
    })
    

    //////////////////// Book Category info APIs/////////////////////////////
    const categoryCollection = client.db("readopiaDB").collection("categories");
    app.post('/categories', async (req, res) => {
      const category = req.body;
      console.log(category);
      const result = await categoryCollection.insertOne(category);
      res.send(result)
    })


    app.get("/categories", async (req, res) => {
      const data = categoryCollection.find();
      const result = await data.toArray();
      res.send(result);
    });




////////////////////book Data APIs/////////////////////////


const bookCollection = client.db("readopiaDB").collection("books");

app.post('/books', async (req, res) => {
  const book = req.body;
  console.log(book);
  const result = await bookCollection.insertOne(book);
  res.send(result)
})











    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
