const { normalize } = require('../utils/format');

// ...array properties di atas...

module.exports = {
  getAll: () => properties,
  getById: (id) => properties.find(p => p.id === Number(id)),
  search: (keyword) => {
    const words = normalize(keyword).split(' ').filter(Boolean);
    if (!words.length) return properties;
    return properties.filter(p => {
      const text = normalize([p.judul, p.lokasi, p.luas, p.harga, p.sertifikat].join(' '));
      return words.every(w => text.includes(w));
    });
  }
};


module.exports = {
  getAll: () => properties,
  getById: (id) => properties.find(p => p.id === Number(id))
};