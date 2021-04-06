const express = require('express')
const MongoClient = require('mongodb').MongoClient;
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

    app.get('/events',(req, res) => {
        booksCollection.find()
        .toArray((err, items) => {
            res.send(items);
            console.log('form database', items);
        })
    })

    app.post('/addBooks', (req, res) => {
        const newEvent = req.body;
        console.log('adding new event', newEvent);
        booksCollection.insertOne(newEvent)
        .then(result => {
            console.log('inserted count', result.insertedCount)
            res.send(result.insertedCount > 0)
        })
})
    
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || 5000)