const app = require('./app');

const server = app.listen(9910, () => {
  console.log(`Express is running on port ${server.address().port}`);
});