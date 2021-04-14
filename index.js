const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fg2cz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json());
app.use(cors());


const serviceAccount = require("./book-shop-site-firebase-adminsdk-hh6i9-74c4ef5561.json");

admin.initializeApp({ 
  credential: admin.credential.cert(serviceAccount)
});


client.connect(err => {
    const booksCollection = client.db("bookShop").collection("books");

    app.get('/books',(req, res) => {
        booksCollection.find()
        .toArray((err, items) => {
            res.send(items);
        })
    })

    //For add books
    app.post('/addbooks', (req, res) => {
        const newbook = req.body;
        console.log('adding new event', newbook);
        booksCollection.insertOne(newbook)
        .then(result => {
            console.log('inserted count', result.insertedCount)
            res.send(result.insertedCount > 0)
        })
})

    app.get('/bookitem/:bookid', (req, res) => {
	    const bookid = ObjectID(req.params.bookid);
        booksCollection.find({_id: bookid})
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.post('/bookitemByIds', (req, res) => {
        const bookitemIds = req.body;
        booksCollection.find({_id: { $in: bookitemIds}})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    }) 

    app.delete('/deletebook/:id', (req, res)=> {
        const id = ObjectID(req.params.id);
        console.log("delete this",id);
        booksCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(documents.deletedCount > 0))
    })
    
});

client.connect(err => {
    const booksCollection = client.db("bookShop").collection("orders");

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        booksCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newOrder);
    })

    app.get('/orders', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });
            admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    console.log(tokenEmail, queryEmail);
                    if (tokenEmail === queryEmail) {
                        booksCollection.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.status(200).send(documents)
                            })
                    }
                    else{
                        res.status(401).send('un-authorized access')
                    }
                })
                .catch((error) => { 
                    // Handle error
                });
             }
             else{
                 res.status(401).send('un-authorized access')
             }

    })
    
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || 5000)