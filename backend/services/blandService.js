const axios = require("axios");
// import dotenv from 'dotenv';

const BLAND_API_KEY = process.env.BLAND_API_KEY;
const BLAND_API_URL = "https://api.bland.ai/v1";

// Store conversation history
let conversationHistory = [];
const CRYPTO_PRICE_TOOL = {
  name: "GetCryptoPrice",
  description:
    "Gets the current price of a cryptocurrency when the user mentions a specific coin or token",
  speech: "Let me search the current price of cryptocurrency you want",
  url: "https://serpapi.com/search.json",
  method: "GET",
  headers: {},
  query: {
    engine: "google",
    q: "What is current price of {{input.coin}} on TradingView",
    location: "India",
    google_domain: "google.co.in",
    gl: "in",
    hl: "hi",
    api_key: "11bf071aa7e33c6518fc35178e6e79b4a36dc2eb874a64df030a87683ab31423",
  },
  input_schema: {
    type: "object",
    example: {
      coin: "bitcoin",
    },
    properties: {
      coin: {
        type: "string",
        description:
          "The cryptocurrency name or symbol that the user wants to check the price for (e.g., bitcoin, ethereum, BTC, ETH, dogecoin, cardano, solana)",
      },
    },
    required: ["coin"],
  },
  response: {
    current_price_info: "$.answer_box.snippet",
  },
  timeout: 10000,
  public: false,
};

// Update your AGENT_PROMPT to include tool usage instructions
const AGENT_PROMPT = `
You are a professional crypto trading assistant. Your job is to guide users through a simulated trading experience using natural, human-like voice interaction.

When users ask about cryptocurrency prices, use the GetCryptoPrice tool to fetch current market prices.

Follow this conversation flow:

1. Greet the user warmly and introduce yourself as their crypto trading assistant.
2. Ask the user which cryptocurrency they would like to trade (e.g., BTC, ETH, etc.).
3. If they ask for current prices, use the GetCryptoPrice tool to fetch the latest price information.
When a user asks about cryptocurrency prices, use the GetCryptoPrice tool. Extract the cryptocurrency name or symbol from their request and pass it to the tool. You can handle various formats like:
- "What's the price of Bitcoin?" → extract "Bitcoin"
- "Check ETH price" → extract "ETH" 
- "How much is Dogecoin worth?" → extract "Dogecoin"
After getting the price information, share it clearly with the user.
4. After the user provides a symbol, ask them to specify the quantity they want to trade.
5. Ask the user to specify their desired price for the trade.
6. Once all values are received, summarize and verbally confirm all order details: symbol, quantity, and price.
7. End the conversation by confirming the simulated order has been received and thanking the user.

Advanced conversational behaviors:

- If the user gives incomplete information, politely ask for the missing details.
- If the user changes their mind or corrects themselves, acknowledge the correction and adjust the conversation accordingly.
- If any input is invalid or unclear, ask for clarification in a polite and professional manner.
- When users mention cryptocurrency names or ask about prices, use the GetCryptoPrice tool to provide current market information.
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
    message,
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
        voice: "maya",
        tools: [CRYPTO_PRICE_TOOL],
        model: "base",
        web_agent: true,
      },
      {
        headers: {
          Authorization: `Bearer ${BLAND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      !response.data ||
      !response.data.agent ||
      !response.data.agent.agent_id
    ) {
      throw new Error("Invalid response from Bland.ai: Missing agent ID");
    }

    // Log the initial greeting
    logConversation(
      "assistant",
      "Hello! I am your crypto trading assistant. How can I help you today?"
    );

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
          Authorization: `Bearer ${BLAND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.token) {
      throw new Error("Invalid response from Bland.ai: Missing session token");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves call details including transcript and summary
 * @param {string} callId - The unique identifier of the call
 * @returns {Promise<Object>} The call details with transcript and summary
 */
async function getCallDetails(callId) {
  try {
    const response = await axios.get(`${BLAND_API_URL}/calls/${callId}`, {
      headers: {
        Authorization: `Bearer ${BLAND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.data) {
      throw new Error("Invalid response from Bland.ai: No call data received");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `API Error: ${error.response.status} - ${
          error.response.data?.message || "Unknown error"
        }`
      );
    }
    throw error;
  }
}

/**
 * Gets only the transcript and summary from a call
 * @param {string} callId - The unique identifier of the call
 * @returns {Promise<Object>} Object containing transcript and summary
 */
async function getTranscriptAndSummary(callId) {
  try {
    const callDetails = await getCallDetails(callId);

    return {
      transcript: callDetails.transcripts || [],
      concatenated_transcript: callDetails.concatenated_transcript || "",
      summary: callDetails.summary || "",
      call_id: callDetails.call_id,
      call_length: callDetails.call_length,
      completed: callDetails.completed,
    };
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
    logConversation("user", message);

    // Here you would typically make an API call to Bland.ai to get the response
    // For now, we'll simulate a response
    const response =
      "I understand you want to trade. Which cryptocurrency would you like to trade?";

    // Log the assistant's response
    logConversation("assistant", response);

    return { response };
  } catch (error) {
    throw error;
  }
}


/**
 * Makes a phone call using the agent
 * @param {string} agentId - The agent ID
 * @param {string} phoneNumber - Phone number to call
 * @param {Object} options - Additional call options
 * @returns {Promise<Object>} Call details including call_id
 */
async function makePhoneCall(agentId, phoneNumber, options = {}) {
  try {
    const response = await axios.post(
      `${BLAND_API_URL}/calls`,
      {
        phone_number: phoneNumber,
        agent_id: agentId,
        max_duration: options.max_duration || 30, // 30 minutes default
        record: options.record || true,
        ...options
      },
      {
        headers: {
          'Authorization': `Bearer ${BLAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // The response will contain the call_id
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Gets all calls for a specific agent
 * @param {string} agentId - The agent ID (optional)
 * @returns {Promise<Array>} Array of calls
 */
async function getAllCalls(agentId = null) {
  try {
    const params = agentId ? { agent_id: agentId } : {};
    
    const response = await axios.get(
      `${BLAND_API_URL}/calls`,
      {
        headers: {
          'Authorization': `Bearer ${BLAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        params
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Starts a web agent session (this might generate a call ID)
 * @param {string} agentId - The agent ID
 * @param {Object} options - Session options
 * @returns {Promise<Object>} Session details
 */
async function startWebSession(agentId, options = {}) {
  try {
    const response = await axios.post(
      `${BLAND_API_URL}/agents/${agentId}/sessions`,
      {
        ...options
      },
      {
        headers: {
          'Authorization': `Bearer ${BLAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Gets call status while it's in progress
 * @param {string} callId - The call ID
 * @returns {Promise<Object>} Current call status
 */
async function getCallStatus(callId) {
  try {
    const response = await axios.get(
      `${BLAND_API_URL}/calls/${callId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${BLAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAgent,
  getSessionToken,
  getCallDetails,
  getTranscriptAndSummary,
  processUserMessage,
  getConversationHistory,
  makePhoneCall,
  getAllCalls,
  startWebSession,
  getCallStatus,
};
