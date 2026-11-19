const Property = require('../models/propertyModel');
const config = require('../config/config');

exports.index = (req, res) => {
  const q = req.query.q || '';
  res.render('index', {
    judul: config.appName,
    whatsapp: config.whatsapp,
    properties: Property.search(q)
  });
};