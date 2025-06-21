const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Creates a new agent session
 * @returns {Promise<Object>} The agent and session details
 */
export async function createAgentSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to create agent session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating agent session:', error);
    throw error;
  }
}

/**
 * Sends a user message to the backend for logging
 * @param {string} message - The user's message
 * @returns {Promise<Object>} The backend response
 */
export async function sendUserMessage(message) {
  const response = await fetch(`${API_BASE_URL}/agents/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

/**
 * Fetches available trading symbols for an exchange
 * @param {string} exchange - The exchange to fetch symbols from
 * @returns {Promise<string[]>}
 */
export async function getSymbols(exchange) {
  const response = await fetch(`${API_BASE_URL}/exchanges/${exchange}/symbols`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch trading symbols');
  }
  
  const data = await response.json();
  return data.symbols;
}

/**
 * Fetches the current price for a symbol on an exchange
 * @param {string} exchange - The exchange to fetch the price from
 * @param {string} symbol - The trading symbol to get the price for
 * @returns {Promise<number>}
 */
export async function getPrice(exchange, symbol) {
  const response = await fetch(
    `${API_BASE_URL}/exchanges/${exchange}/price?symbol=${encodeURIComponent(symbol)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch price');
  }
  
  const data = await response.json();
  return data.price;
}

/**
 * Sends an agent message to the backend for logging
 * @param {string} message - The agent's message
 * @returns {Promise<Object>} The backend response
 */
export async function sendAgentMessage(message) {
  const response = await fetch('http://localhost:3001/api/agents/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `[AGENT] ${message}` }),
  });
  if (!response.ok) throw new Error('Failed to send agent message');
  return response.json();
} 