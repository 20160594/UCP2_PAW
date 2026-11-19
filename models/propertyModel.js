


module.exports = {
  getAll: () => properties,
  getById: (id) => properties.find(p => p.id === Number(id))
};