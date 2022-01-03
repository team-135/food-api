const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
var cors = require('cors')
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
//admin
//DpJ92JgpV8QyjoWi
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1tmnn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('foodDeleveryApp');
        const productCollection = database.collection('products');
        const order = database.collection('order');
        const reviews = database.collection('reviews');
        const users = database.collection('users');

        //get Api
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const result = await cursor.toArray();
            res.send(result);
        })
        //all all prodcuts 
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productCollection.insertOne(products);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })
        //singel Porduct 
        app.get('/singel-product/:id', async (req, res) => {
            const id = req.params.id;
            const querry = { _id: ObjectId(id) }
            const result = await productCollection.findOne(querry)

            res.json(result);
        })
        // order place 
        app.post('/place-order', async (req, res) => {
            const orderdata = req.body;
            const result = await order.insertOne(orderdata);
            res.json(result);
        })
        //user order 
        app.get('/user-order/:id', async (req, res) => {
            const userid = req.params.id;
            const query = { userid: userid };
            const cursor = order.find(query);
            const orders = await cursor.toArray();

            res.json(orders)
        })
        //Delete items 
        app.delete('/items-delete/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await order.deleteOne(query);
            res.json(result);
        })
        //Delete Products 
        app.delete('/products-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })
        //add reviews 
        app.post('/add-reviews', async (req, res) => {
            const orderdata = req.body;
            const result = await reviews.insertOne(orderdata);
            res.json(result);
        })
        //all reviews show 
        app.get('/all-reviews', async (req, res) => {
            const cursor = reviews.find({})
            const result = await cursor.toArray();
            res.send(result);
        })
        //Users 
        app.post('/users', async (req, res) => {
            const newUsers = req.body;
            const result = await users.insertOne(newUsers);
            res.json(result);
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const newUser = { $set: user };
            const result = await users.updateOne(filter, newUser, options);
            res.json(result);

        })
        //add admin 
        app.put('/add-admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await users.updateOne(filter, updateDoc);
            res.json(result);
        })
        //check user 
        app.get('/users-cehck/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await users.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //all orders
        app.get('/all-orders', async (req, res) => {
            const cursor = order.find({})
            const result = await cursor.toArray();
            res.send(result);
        })
        //update 
        app.put('/order-status-update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await order.findOne(filter);
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    orderStatus: 'Shipping'
                },
            };
            const results = await order.updateOne(result, updateDoc, options);
            res.json(results);
        })

    } finally {
        // await client.close();
    }

}


run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})