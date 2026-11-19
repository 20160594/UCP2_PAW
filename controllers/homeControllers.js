const Property = require('../models/propertyModel');

exports.index = (req, res) => {
  res.render('index', {
    judul: 'PT Dimensi Land',
    properties: Property.getAll()   // pakai getAll(), pakai tanda kurung
  });
};