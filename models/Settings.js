const mongoose = require('mongoose');

const headerConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'header_manifest' },
    labels: {
      shop: { text: String, badge: String, color: String },
      categories: { text: String, badge: String, color: String },
      flash: { text: String, badge: String, color: String },
    },
    shopMenu: {
      banners: [{ id: Number, label: String, img: String }],
    },
    catMenu: {
      banners: [{ id: Number, title: String, sub: String, img: String }],
    },
    flashMenu: {
      nodes: [{ id: Number, title: String, img: String }],
      topRated: [{ id: Number, name: String, price: String, img: String }],
    },
  },
  {
    timestamps: true,
    strict: false, // এটি দিলে স্কিমার বাইরে কিছু পাঠালেও ডাটাবেসে সেভ হবে
  }
);

module.exports = mongoose.model('Settings', headerConfigSchema);
