const axios = require('axios');
// import dotenv from 'dotenv';

const BLAND_API_KEY = process.env.BLAND_API_KEY;
const BLAND_API_URL = 'https://api.bland.ai/v1';

// Store conversation history
let conversationHistory = [];

const AGENT_PROMPT = `
You are a professional crypto trading assistant. Your job is to guide users through a simulated trading experience using natural, human-like voice interaction.

Follow this conversation flow:

1. Greet the user warmly and introduce yourself as their crypto trading assistant.
2. Ask the user which cryptocurrency they would like to trade (e.g., BTC, ETH, etc.).
3. After the user provides a symbol, ask them to specify the quantity they want to trade.
4. Ask the user to specify their desired price for the trade.
5. Once all values are received, summarize and verbally confirm all order details: symbol, quantity, and price.
6. End the conversation by confirming the simulated order has been received and thanking the user.

Advanced conversational behaviors:

- If the user gives incomplete information, politely ask for the missing details.
- If the user changes their mind or corrects themselves, acknowledge the correction and adjust the conversation accordingly.
- If any input is invalid or unclear, ask for clarification in a polite and professional manner.
- Maintain a professional, helpful, and conversational tone at all times.

Notes:
- This is a simulated experience. No real trades will occur.
- Be concise, friendly, and focused on guiding the user through the steps smoothly.
- When discussing prices, include the currency pair (e.g., "The price is 50,000 USDT").
`;

/**
 * Logs a message to the conversation history
 * @param {string} role - 'user' or 'assistant'
 * @param {string} message - The message content
 */
function logConversation(role, message) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    role,
    message
  };
  conversationHistory.push(logEntry);
  console.log(`\n[${timestamp}] ${role.toUpperCase()}: ${message}`);
}

/**
 * Gets the conversation history
 * @returns {Array} The conversation history
 */
function getConversationHistory() {
  return conversationHistory;
}

/**
 * Creates a new Bland.ai Web Agent
 * @returns {Promise<Object>} The created agent details
 */
async function createAgent() {
  try {
    const response = await axios.post(
      `${BLAND_API_URL}/agents`,
      {
        prompt: AGENT_PROMPT,
        voice: 'maya',
        web_agent: true
      },
      {
        headers: {
          'Authorization': `Bearer ${BLAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.agent || !response.data.agent.agent_id) {
      throw new Error('Invalid response from Bland.ai: Missing agent ID');
    }

    // Log the initial greeting
    logConversation('assistant', 'Hello! I am your crypto trading assistant. How can I help you today?');

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Gets a session token for the specified agent
 * @param {string} agentId - The ID of the agent to create a session for
 * @returns {Promise<Object>} The session token and details
 */
async function getSessionToken(agentId) {
  try {
    const response = await axios.post(
      `${BLAND_API_URL}/agents/${agentId}/authorize`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${BLAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.token) {
      throw new Error('Invalid response from Bland.ai: Missing session token');
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Processes a user message and logs the conversation
 * @param {string} message - The user's message
 * @returns {Promise<Object>} The assistant's response
 */
async function processUserMessage(message) {
  try {
    // Log the user's message
    logConversation('user', message);

    // Here you would typically make an API call to Bland.ai to get the response
    // For now, we'll simulate a response
    const response = "I understand you want to trade. Which cryptocurrency would you like to trade?";
    
    // Log the assistant's response
    logConversation('assistant', response);

    return { response };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAgent,
  getSessionToken,
  processUserMessage,
  getConversationHistory
}; 