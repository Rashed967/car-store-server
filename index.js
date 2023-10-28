const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const {DB_USER, DB_PASS} = process.env


// middleware 
app.use(cors())
app.use(express.json())

// database connect 

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.kt6fwyn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// crate or connect database and use collection 

    // database injection
    const database = client.db('carServices')
    const serviceCollection = database.collection('service')


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // get services 
    app.get('/services', async(req, res) => {
        const cursor = serviceCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })


    // single service 
    app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await serviceCollection.findOne(query)
        res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// root route 
app.get('/', (req, res) => {
    res.send("server is running")
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})