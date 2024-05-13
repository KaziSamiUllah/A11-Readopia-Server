const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());


const vrifyToken = (req, res, next) => {
  console.log('ami middle')

  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: 'unauthorized access' })
  if (token) {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
          if (err) {
              console.log(err)
             return res.status(401).send({ message: 'unauthorized access' })
          }
          console.log(decode);
          req.user = decode
          next();
      })
  }
  console.log(token);


}





app.get("/", (req, res) => {
  res.send("Simple crud is running");
});

app.listen(port, () => {
  console.log(`crud is running through ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zunyezi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    /////////////////////////////JWT Auth ///////////////////////

    // JWT Generate
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    //clearing Token
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ success: true });
    });


        //////////////////// User APIs/////////////////////////////
        const usersDB = client.db("readopiaDB").collection("users");

        app.post("/users", async (req, res) => {
          const users = req.body;
          console.log(users);
          const result = await usersDB.insertOne(users);
          res.send(result);
        });
    
        app.get("/users/:email", vrifyToken, async (req, res) => {
          const email = req.params.email;
          const query = { userEmail: email };
          const userData = await usersDB.findOne(query);
          res.send(userData);
        });


    ////////////////////book Data APIs/////////////////////////

    const bookCollection = client.db("readopiaDB").collection("books");

    app.get("/books", vrifyToken, async (req, res) => {
      const data = bookCollection.find();
      const result = await data.toArray();
      res.send(result);
    });

    app.post("/books", vrifyToken, async (req, res) => {
      const book = req.body;
      // console.log(book);
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.get("/books/:name", vrifyToken,  async (req, res) => {
      const name = req.params.name;
      const query = { name: name };
      const book = await bookCollection.findOne(query);
      res.send(book);
    });

    ////////////Updating book quantity////////////////////

    app.put("/books/:id", vrifyToken,  async (req, res) => {
      const data = req.body;
      console.log(data);
      const paramsId = req.params.id;
      console.log(paramsId);
      const filter = { _id: new ObjectId(paramsId) };
      const options = { upsert: true };
      if (data.qty !== undefined) {
        changeQty = parseInt(data.qty);

        const updateDoc = {
          $inc: {
            quantity: changeQty,
          },
        };
        const result = await bookCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } else {
        const updateDoc = {
          $set: {
            url: data.url,
            name: data.name,
            quantity: data.quantity,
            author: data.author,
            category: data.category,
            description: data.description,
            rating: data.rating,
          },
        };
        const result = await bookCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    });

    ///////////////Update book data/////////////////////

    /////////////////Category APIs///////////////////////

    
    const categoryCollection = client.db("readopiaDB").collection("categories");
    app.post("/categories", async (req, res) => {
      const category = req.body;
      // console.log(category);
      const result = await categoryCollection.insertOne(category);
      res.send(result);
    });

    app.get("/categories",  async (req, res) => {
      const data = categoryCollection.find();
      const result = await data.toArray();
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

    app.post("/borrowed",  async (req, res) => {
      const borrowed = req.body;
      const result = await borrowdBooks.insertOne(borrowed);
      res.send(result);
    });

    app.get("/borrowed/:email", vrifyToken,  async (req, res) => {
      const userEmail = req.params.email;
      console.log(userEmail);
      const result = await borrowdBooks.find({ email: userEmail }).toArray();
      res.send(result);
    });

    app.delete("/borrowed/:id", vrifyToken,  async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await borrowdBooks.deleteOne(query);
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
