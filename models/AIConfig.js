const mongoose = require('mongoose');

const aiConfigSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  settings: {
    personality: { type: String, default: 'Professional' },
    language: { type: String, default: 'Bilingual' },
    knowledgeBase: { type: String, default: 'Store Policy: Default.' },
  },
  securityLevel: { type: String, default: 'STRICT' },
  metrics: {
    queries: { type: Number, default: 1450 },
    resolution: { type: Number, default: 94 },
    threats: { type: Number, default: 12 },
    latency: { type: Number, default: 0.8 },
  },
});

module.exports = mongoose.model('AIConfig', aiConfigSchema);
