
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
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS= createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)
const verifyToken= async(req,res,next)=>{
    const authHeader= req?.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message:"Unauthorized User"});
    }
    const token= authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({message: "Unauthorized"})
    }
    try{
        const {payload} = await jwtVerify(token, JWKS);
        next();
    }
    catch(error){
        return res.status(403).json({message: "Forbidden"});
    }
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db= client.db('doctor-appointment');
    const doctorCollections= db.collection('doctors');
    const appointmentCollections= db.collection('appointments');
    const usersCollections=db.collection('users');

    app.get('/doctors', async(req,res)=>{
        const result= await doctorCollections.find().toArray();
        res.send(result);
    })
    app.get('/doctors/:id',verifyToken, async(req,res)=>{
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

    app.get('/appointments/user/:userId',verifyToken, async(req,res)=>{
        const {userId} = req.params;
        const result= await appointmentCollections.find({userId : userId}).toArray();
        res.send(result);
    })

    app.patch("/appointments/:appointmentId",verifyToken, async(req,res)=>{
        const {appointmentId} = req.params;
        const updatedData= req.body;
        const result= await appointmentCollections.updateOne({_id: new ObjectId(appointmentId)}, {$set: updatedData});
        res.send(result);
    })

    app.delete("/appointments/:appointmentId",verifyToken, async(req,res)=>{
        const {appointmentId}= req.params;
        const result= await appointmentCollections.deleteOne({_id: new ObjectId(appointmentId)})
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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