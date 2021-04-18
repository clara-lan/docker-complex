// logics to connect Redis, Postgres and react to express server for running reactAPP
// react - express - redis(cache) and postgres(index, permantly stored)
const keys = require('./keys');

//Express App setup
const express =  require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

const app = express();
// app.use(cors());//cross origin resource sharing
app.use(bodyParser.json());//parse body from reactApp request and turn it into json

//create and run Postgres, Postgres client setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
//catch Postgres errors
pgClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)') //create table if no exsiting one
    .catch((err) => console.error(err));
});

//Redis Client set up
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();// duplicate client, redis require a duplicate client to publish/deal data info

// express route handlers setup
app.get('/', (req, res) =>{
  res.send('Hi');// each time a request made on homepage '/', res will send back 'Hi'
});

//query and retrive all the submitted values(index in this calculator case)
app.get('/values/all', async(req, res)=>{
  const values = await pgClient.query('SELECT * from values');

  res.send(values.rows);//only send rows back
});

app.get('/values/current', async(req,res)=>{
  console.log(req.body);
  redisClient.hgetall('values', (err, values) =>{//hgetall:get hash values
    res.send(values);// redisClient for nodejs do not have promise(await) solution, so callback function is used here, different from line 46
  });
});

app.post('/values', async (req,res) => {
  const index = req.body.index;
  console.log(index);
  if(parseInt(index) > 40){
    return res.status(422).send('Index too high');
  }
  //hash set, put pair index:'nothing yet' in table "values"
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  //take the index and put in table values col number, interpolater with $1(replace with the first var)
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({working: true});
});

//server listen to traffic on port 5000
// no specify port on client, default port on 3000
app.listen(5000, (err) => { 
  console.log('listening');
});