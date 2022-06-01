const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');

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

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'Unauthorized access'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({message: 'Forbidden access'})
    }
    req.decoded = decoded;
    next();
  })
}



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

app.post('/tool', async(req, res)=>{
  const newTool = req.body;
  const result = await toolCollection.insertOne(newTool);
  res.send(result);
})


app.get('/order', async(req,res)=>{
  const orders= await bookingCollection.find().toArray();
  res.send(orders);
})

app.get('/user', verifyJWT, async(req,res)=>{
  const users = await userCollection.find().toArray();
  res.send(users);
});

app.get('/admin/:email', async(req, res)=>{
  const email = req.params.email;
  const user= await userCollection.findOne({email: email});
  const isAdmin = user.role === 'admin';
  res.send({admin:isAdmin});
})

app.put('/user/admin/:email',verifyJWT, async(req, res)=>{
  const email = req.params.email;
  const requester = req.decoded.email;
  const requesterAccount = await userCollection.findOne({email:requester});
  if(requesterAccount.role === 'admin'){
    const filter = {email: email};
  
    const updateDoc = {
      $set: {role:'admin'}
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    
    res.send(result);
  }
  else{
    res.status(403).send({message: 'Forbidden'});
  }
 

})
// put method:
app.put('/user/:email', async(req, res)=>{
  const email = req.params.email;
  const user= req.body;
  const filter = {email: email};
  const options = {upsert: true};
  const updateDoc = {
    $set: user,
  };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
  
  res.send({result, token});

})

app.post('/booking', async(req, res)=>{
  const booking = req.body;
  
  const result = await bookingCollection.insertOne(booking);
  res.send(result);
});

app.get('/booking',verifyJWT, async(req,res)=>{
  const customer = req.query.customer;
  
  const decodedEmail = req.decoded.email;
  if(customer === decodedEmail){
    const query = {customer: customer};
    const bookings = await bookingCollection.find(query).toArray();
    return res.send(bookings);
  }

  else{
    return res.status(403).send({message: 'forbidden access'})
  }
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