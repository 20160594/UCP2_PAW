const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { judul: 'Halo dari Express!' });
});

app.use((req, res) => { //handle 404 errors
  res.status(404).send('Halaman tidak ditemukan');
});

app.use((err, req, res, next) => { //handle 500 errors
  console.error(err);
  res.status(500).send('Terjadi kesalahan server');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});