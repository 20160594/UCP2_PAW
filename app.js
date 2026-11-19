const express = require('express');
const path = require('path');
const config = require('./config/config');
const logger = require('./middlewares/logger');
const routes = require('./routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use((req, res) => { // handle 404 errors
  res.status(404).send('Halaman tidak ditemukan');
});

app.use((err, req, res, next) => { // handle 500 errors
  console.error(err);
  res.status(500).send('Terjadi kesalahan server');
});

app.listen(config.port, () => {
  console.log(`Server berjalan di http://localhost:${config.port}`);
});