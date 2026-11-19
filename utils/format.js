// Mengubah teks jadi huruf kecil, hapus spasi berlebih (untuk pencarian)
exports.normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/²/g, '2')
    .replace(/\s+/g, ' ')
    .trim();

// Membuat link WhatsApp dengan pesan otomatis
exports.waLink = (nomor, judul) =>
  `https://wa.me/${nomor}?text=${encodeURIComponent('Saya tertarik dengan properti: ' + judul)}`;