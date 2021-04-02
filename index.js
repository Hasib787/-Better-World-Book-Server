const express = require('express')
const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fg2cz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority` ;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()


client.connect(err => {
  const collection = client.db("bookShop").collection("books");
    console.log("Database are connected")
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || 5000)