const express = require('express');
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const {DB_USER, DB_PASS} = process.env


// middleware 
app.use(cors())
app.use(express.json())


    // generate random bytes 
      // require('crypto').randomBytes(64).toString('hex')



    // secret code

    const secretCode = "0df2e5449d4a60c45f66d4333c8b44d618a9e25d88b3eab4daaf89f7013101382882dd74dec975cec35a802ef99d0cb83a4d728e20ac3f2bf0f5d9311c123f06"
  

// database connect 

// car-store
// l2tOAfAGORHA6so0

// const uri = 'mongodb+srv://car-store@admin:QzZpFIKBX1HABZti@cluster0.kt6fwyn.mongodb.net/?retryWrites=true&w=majority';

const uri = "mongodb+srv://car-store:l2tOAfAGORHA6so0@cluster0.kt6fwyn.mongodb.net/?retryWrites=true&w=majority";


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
    const checkoutCollection = database.collection('booked')


  // verify jwt 

  const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(!authorization){
      return res.status(401).send({error : "unauthorized access"})
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, secretCode, (error, decoded) => {
        if(error){
          res.status(403).send({error: true, message : "token expired"})
        }
        req.decoded = decoded;
        next()
    })

  }


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // jwt sign & get token 
    app.post('/jwt', (req, res) => {
      const email = req.body;
      console.log(email)
      const token = jwt.sign(email, secretCode, {expiresIn : "1h"})
      res.send({token})
    })


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
        const options = {
            projection : {title : 1, price : 1, service_id : 1, img : 1}
        }
        const result = await serviceCollection.findOne(query, options)
        res.send(result)
    })


    // book service 
    app.post('/checkout', async(req, res) => {
        const newCheckout = req.body;
          newCheckout.status = "Pending"
        const result = await checkoutCollection.insertOne(newCheckout)
        res.send(result)

    })

  

    // get specific service 
    app.get('/checkout', verifyJWT, async(req, res) => {
      let query = {}
      if(req.query?.email){
        query = {email : req.query.email}
      }
      const result = await checkoutCollection.find(query).toArray()
      res.send(result)
        
    })


    // update status 
    app.put('/checkout/:id', async(req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = {_id : new ObjectId(id)}
      const options = {upsert : true      }
      const updatedDoc = {
        $set : {
          status : body
        }
      }
    
      const result = await checkoutCollection.updateOne(filter, updatedDoc, options)
      res.send(result)
    })

    // delete a service 
    app.delete('/checkout/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await checkoutCollection.deleteOne(query)
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