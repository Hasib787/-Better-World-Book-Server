const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fg2cz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json());
app.use(cors());

client.connect(err => {
    const booksCollection = client.db("bookShop").collection("books");

    app.get('/books',(req, res) => {
        booksCollection.find()
        .toArray((err, items) => {
            res.send(items);
        })
    })

    app.post('/addbooks', (req, res) => {
        const newbook = req.body;
        console.log('adding new event', newbook);
        booksCollection.insertOne(newbook)
        .then(result => {
            console.log('inserted count', result.insertedCount)
            res.send(result.insertedCount > 0)
        })
})

    app.delete('/deletebook/:id', (req, res)=> {
        const id = ObjectID(req.params.id);
        console.log("delete this",id);
        booksCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(documents.deletedCount > 0))
    })
    
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || 5000)