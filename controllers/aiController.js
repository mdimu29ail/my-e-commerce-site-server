// backend/controllers/aiController.js
import AIConfig from '../models/AIConfig.js'; // A Mongoose model for AI Settings
import OpenAI from 'openai';
import { getIO } from '../socket.js'; // Assuming you have socket.io initialized

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. Get Settings (Fired when the page loads)
export const getAIConfig = async (req, res) => {
  let config = await AIConfig.findOne();
  if (!config) {
    config = await AIConfig.create({
      isActive: false,
      settings: {
        personality: 'Professional',
        language: 'Bilingual',
        knowledgeBase: '',
      },
      securityLevel: 'STRICT',
      metrics: { queries: 0, resolution: 0, threats: 0, latency: 0.8 },
    });
  }
  res.json(config);
};

// 2. Save Settings (Fired when you click "Commit Changes")
export const updateAIConfig = async (req, res) => {
  const { settings, securityLevel } = req.body;
  const config = await AIConfig.findOneAndUpdate(
    {},
    { settings, securityLevel },
    { new: true }
  );

  // Log this system update to the terminal
  const io = getIO();
  io.emit('ai-activity-log', {
    time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    type: 'SYS',
    msg: 'AI Matrix reconfigured by Administrator.',
  });

  res.json(config);
};

// 3. Toggle Agent (Fired by the large brutalist button)
export const toggleAgent = async (req, res) => {
  const { isActive } = req.body;
  const config = await AIConfig.findOneAndUpdate(
    {},
    { isActive },
    { new: true }
  );

  const io = getIO();
  io.emit('ai-activity-log', {
    time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    type: 'SYS',
    msg: isActive
      ? 'System initialization complete. Monitoring queries.'
      : 'System offline. Core deactivated.',
  });

  res.json(config);
};

// ==========================================
// 4. THE ACTUAL AI WORKER LOGIC
// Use this function wherever customers send messages (e.g. your Chat controller)
// ==========================================
export const processCustomerMessage = async (customerMessage, customerId) => {
  const config = await AIConfig.findOne();

  if (!config.isActive) return 'Sorry, live agent is currently offline.';

  const io = getIO();

  // Alert terminal that a query came in
  io.emit('ai-activity-log', {
    time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    type: 'INTENT',
    msg: `Processing query from User #${customerId}...`,
  });

  // Construct the prompt using the settings from your Admin Dashboard!
  let systemPrompt = `You are an AI customer support agent.
  Your personality is: ${config.settings.personality}.
  Your primary language is: ${config.settings.language}.
  You must adhere to the following Knowledge Base rules strictly:
  ${config.settings.knowledgeBase}
  `;

  try {
    const startTime = Date.now();

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: customerMessage },
      ],
    });

    const latency = ((Date.now() - startTime) / 1000).toFixed(2);

    // Update Database Metrics
    await AIConfig.findOneAndUpdate(
      {},
      {
        $inc: { 'metrics.queries': 1 },
        'metrics.latency': latency,
      }
    );

    // Alert terminal that AI replied
    io.emit('ai-activity-log', {
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      type: 'CHAT',
      msg: `Reply sent to User #${customerId} in ${latency}s.`,
    });

    // Update real-time metrics grid in frontend
    io.emit('ai-metrics-update', {
      queries: config.metrics.queries + 1,
      latency: latency,
    });

    return response.choices[0].message.content;
  } catch (error) {
    io.emit('ai-activity-log', {
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      type: 'ALERT',
      msg: 'API communication failure.',
    });
  }
};
