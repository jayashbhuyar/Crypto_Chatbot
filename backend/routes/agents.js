const express = require('express');
const router = express.Router();
const { createAgent, getSessionToken, processUserMessage, getConversationHistory } = require('../services/blandService');

// Health check for agents route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'agents' });
});

/**
 * POST /api/agents/create
 * Creates a new Bland.ai agent and returns its ID and session token
 */
router.post('/create', async (req, res) => {
  try {
    console.log('Creating new agent...');
    
    // Create the agent
    const agentResponse = await createAgent();
    console.log('Agent created:', agentResponse.agent.agent_id);
    
    // Get session token for the agent
    const sessionResponse = await getSessionToken(agentResponse.agent.agent_id);
    console.log('Session created:', sessionResponse.token);

    // Return both agent and session details
    res.json({
      agent: agentResponse.agent,
      session: sessionResponse
    });
  } catch (error) {
    console.error('Error in /api/agents/create:', error);
    res.status(500).json({
      error: 'Failed to create agent',
      details: error.message
    });
  }
});

/**
 * POST /api/agents/message
 * Processes a user message and returns the assistant's response
 */
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await processUserMessage(message);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * GET /api/agents/conversation
 * Returns the conversation history
 */
router.get('/conversation', (req, res) => {
  const history = getConversationHistory();
  res.json({ history });
});

module.exports = router; 