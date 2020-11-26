// At the top of test/index.test.js
const test = require('firebase-functions-test')({
    databaseURL: 'https://mate-app-dev.firebaseio.com',
    projectId: 'my-project',
  }, 'path/to/serviceAccountKey.json');