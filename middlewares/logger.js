module.exports = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const waktu = new Date().toISOString();
    console.log(`[${waktu}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
};