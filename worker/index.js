const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host:keys.redisHost,
  port:keys.redisPort,
  //retry each 1000 mm
  retry_strategy: () => 1000
});

// make a client copy
const sub = redisClient.duplicate();

function fib(index){
  if(index < 2) return 1;
  console.log('run fib');
  return fib(index-1) + fib(index-2);
};

//sub:subscribtion
sub.on('message', (channel, message) => {
  // message is the index which will be submitted to the form
  // parse the value and use hset to hash the value, key:message
  redisClient.hset('values', message, fib(parseInt(message)));
});

//listen to insert event
// each time a values is insert, we'll go to line20, hash and insert message:value
sub.subscribe('insert');