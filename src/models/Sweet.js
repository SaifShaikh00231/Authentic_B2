const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 1 },
  imageUrls: [{ type: String }],
  quantity: { type: Number, required: true, min: 1} // 👈 Add this
}, { timestamps: true });


module.exports = mongoose.model('Sweet', sweetSchema);
