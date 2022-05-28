const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('cors');
const cors = require('cors');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json())
;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yooodxx.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run(){
try{
await client.connect();
console.log('Database connected');
const toolCollection = client.db('manufacturing_company').collection('tools');
const bookingCollection = client.db('manufacturing_company').collection('bookings');
const userCollection = client.db('manufacturing_company').collection('users');





app.get('/tool', async(req, res) =>{
    const query = {};
    const cursor = toolCollection.find(query);
    const tools = await cursor.toArray();
    res.send(tools)
});

app.put('/user/:email', async(req, res)=>{
  const email = req.params.email;
  const user= req.body;
  const filter = {email: email};
  const options = {upsert: true};
  const updateDoc = {
    $set: user,
  };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
  res.send({result, token});

})

app.post('/booking', async(req, res)=>{
  const booking = req.body;
  
  const result = await bookingCollection.insertOne(booking);
  res.send(result);
});

app.get('/booking', async(req,res)=>{
  const customer = req.query.customer;
  const query = {customer: customer};
  const bookings = await bookingCollection.find(query).toArray();
  res.send(bookings);
})


app.get('/tool/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const tools = await toolCollection.findOne(query);
  res.send(tools);
});




}
finally{

}

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('this is assignment 12!')
})

app.listen(port, () => {
  console.log(`manufacturing app listening on port ${port}`)
})