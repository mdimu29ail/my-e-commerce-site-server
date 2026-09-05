const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String, default: '' }, // imgBB লিঙ্ক এখানে জমা হবে
    address: {
      division: { type: String, default: '' },
      district: { type: String, default: '' },
      upazila: { type: String, default: '' },
      detailAddress: { type: String, default: '' },
    },
    loyaltyPoints: { type: Number, default: 0 },
    shopName: { type: String, default: '' },
  },
  { timestamps: true, collection: 'profile' }
);

module.exports = mongoose.model('Profile', profileSchema);
