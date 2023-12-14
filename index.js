const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
// Middleware
app.use(cors())
app.use(express.json())

// MongoDB
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.clbkfrr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect((err)=>{
      if(err){
        console.log(err)
        return;
      }
    });
    /* Working Place Start */
    const toysCollection = client.db("toysDB").collection("toys");

    //POST ADD A JOBS
    app.post('/addatoys', async(req, res)=>{
        const newToy = req.body;
        // console.log(newToy)
        const result = await toysCollection.insertOne(newToy)
        res.send(result)
    })
    // Get Toys By Category
    app.get('/toyscategory/:category', async(req, res)=>{
        const category = req.params.category;
        const query = {category: category}
        const result = await toysCollection.find(query).toArray()
        res.send(result)
    })
    // Get My toys
    app.get('/mytoys', async(req, res)=>{
      let query = {}
      const sort = parseInt(req.query?.sort);
      if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      }
      if(sort){
        const result = await toysCollection.find(query).sort({price: sort}).toArray()
        res.send(result)
      }
      else{
        const result = await toysCollection.find(query).toArray()
        res.send(result)
      }
    })
    // Get all toys
    app.get('/alltoys', async(req, res)=>{
      const showmore = req.query?.showmore;
      if(showmore=='true'){
        const result = await toysCollection.find().toArray()
        res.send(result)
      }
      else{
        const result = await toysCollection.find().limit(20).toArray()
        res.send(result)
      }
    })
    // Get all toys
    app.get('/marquetoys', async(req, res)=>{
        const result = await toysCollection.find().limit(20).toArray()
        res.send(result)
    })
    // Get a toy details
    app.get('/toydetails/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const toy = await toysCollection.findOne(query)
      res.send(toy)

    })
    // Update A Toy
    app.put('/updatetoy/:id', async(req, res)=>{
      const id = req.params.id;
      const toy = req.body;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedToy = {
        $set:{
          price:toy.price,
          quantity: toy.quantity,
          description: toy.description,
        }
      }
      const result = await toysCollection.updateOne(filter, updatedToy, options)
      res.send(result)

    })
    // Delete A Toy
    app.delete('/deletetoy/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })

    /* Working Place End */
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Default
app.get('/', (req, res) => {
  res.send('Sports Toy server is running!')
})
app.listen(port, () => {
  console.log(`Sports Toy server is listening on port ${port}`)
})