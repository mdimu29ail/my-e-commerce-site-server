const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'Email' },
    status: { type: String, default: 'Draft' },
    reach: { type: Number, default: 0 },
    conversion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
