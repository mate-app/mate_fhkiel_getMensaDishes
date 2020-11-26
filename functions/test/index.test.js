// At the top of test/index.test.js
const test = require('firebase-functions-test')({
    databaseURL: 'https://mate-app-dev.firebaseio.com',
    projectId: 'mate-app-dev',
  }, '../key/mate-app-dev-firebase-adminsdk-liq4s-2c859c2b27.json');


// after firebase-functions-test has been initialized
const getMensaDishes = require('../index.js');
const functions = require('firebase-functions');

// Tests
const wrapped = test.wrap(getMensaDishes.scrapeMensa);
const data = test.pubsub.exampleMessage;

wrapped(data);