const express = require('express');
const path = require('path');
const PORT = 3000;

const app = express();
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/api', require('./routes/api'));

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

module.exports = app;
