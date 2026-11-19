
const rateLimit = require('express-rate-limit'); // npm i express-rate-limit

module.exports = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak pesan, coba lagi sebentar.' }
});