const express = require('express');
const AIConfig = require('../models/AIConfig');

const router = express.Router();

// 1. Get current AI Settings
router.get('/config', async (req, res) => {
  try {
    let config = await AIConfig.findOne();
    if (!config) {
      config = await AIConfig.create({}); // Creates default if missing
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. Update Knowledge Base & Settings
router.put('/config', async (req, res) => {
  try {
    const { settings, securityLevel } = req.body;
    const config = await AIConfig.findOneAndUpdate(
      {},
      { settings, securityLevel },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Update Failed' });
  }
});

// 3. Toggle Agent (ON/OFF)
router.post('/toggle', async (req, res) => {
  try {
    const { isActive } = req.body;
    const config = await AIConfig.findOneAndUpdate(
      {},
      { isActive },
      { new: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Toggle Failed' });
  }
});

// 4. Flush Memory Buffer
router.delete('/logs', (req, res) => {
  res.json({ message: 'Logs cleared' });
});

module.exports = router;
