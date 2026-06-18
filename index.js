
const express = require('express');
const app = express();
const dotenv= require('dotenv');
dotenv.config();

const cors = require('cors');
const port= process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send('Server is Runnning Successfully');
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_URI}:${process.env.DB_PASS}@cluster0.nkigazd.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db= client.db('doctor-appointment');
    const doctorCollections= db.collection('doctors');
    const appointmentCollections= db.collection('appointments')

    app.get('/doctors', async(req,res)=>{
        const result= await doctorCollections.find().toArray();
        res.send(result);
    })

    app.get('/doctors/:id', async(req,res)=>{
        const {id} = req.params;
        const query = {_id: new ObjectId(id)};
        const result = await doctorCollections.findOne(query);
        res.send(result);
    })

    app.post('/doctors/:id/appointments', async(req,res)=>{
        const data = req.body;
        const result= await appointmentCollections.insertOne(data);
        res.send(result);
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


app.listen(port, ()=>{
    console.log(`Server is running on ${port} PORT`);
})