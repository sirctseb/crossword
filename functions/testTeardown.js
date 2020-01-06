const admin = require('firebase-admin');
const test = require('./testConfig');

after(() => {
  test.cleanup();
  return admin.database().ref().remove();
});
