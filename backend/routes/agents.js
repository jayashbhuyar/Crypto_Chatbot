const express = require("express");
const router = express.Router();
const {
  createAgent,
  getSessionToken,
  processUserMessage,
  getConversationHistory,
  getCallDetails,
  getTranscriptAndSummary,
  makePhoneCall,
  getAllCalls,
  getCallStatus,
} = require("../services/blandService");
const { getCryptoPrice } = require("../helpers/googleSearch");

// Health check for agents route
router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "agents" });
});

/**
 * POST /api/agents/create
 * Creates a new Bland.ai agent and returns its ID and session token
 */
router.post("/create", async (req, res) => {
  try {
    console.log("Creating new agent...");

    // Create the agent
    const agentResponse = await createAgent();
    console.log("Agent created:", agentResponse.agent.agent_id);

    // Get session token for the agent
    const sessionResponse = await getSessionToken(agentResponse.agent.agent_id);
    console.log("Session created:", sessionResponse.token);

    // Return both agent and session details
    res.json({
      agent: agentResponse.agent,
      session: sessionResponse,
    });
  } catch (error) {
    console.error("Error in /api/agents/create:", error);
    res.status(500).json({
      error: "Failed to create agent",
      details: error.message,
    });
  }
});

router.get("/crypto-price", getCryptoPrice);

/**
 * POST /api/agents/message
 * Processes a user message and returns the assistant's response
 */
router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await processUserMessage(message);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
});

/**
 * GET /api/agents/conversation
 * Returns the conversation history
 */
router.get("/conversation", (req, res) => {
  const history = getConversationHistory();
  res.json({ history });
});

/**
 * GET /api/agents/calls/:callId
 * Retrieves complete call details including transcript and summary
 */
router.get("/calls/:callId", async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({ error: "Call ID is required" });
    }

    console.log("Retrieving call details for:", callId);
    const callDetails = await getCallDetails(callId);

    res.json({
      success: true,
      data: callDetails,
    });
  } catch (error) {
    console.error("Error in /api/agents/calls/:callId:", error);
    res.status(500).json({
      error: "Failed to retrieve call details",
      details: error.message,
    });
  }
});

/**
 * GET /api/agents/calls/:callId/transcript
 * Retrieves only the transcript and summary for a specific call
 */
router.get("/calls/:callId/transcript", async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({ error: "Call ID is required" });
    }

    console.log("Retrieving transcript for call:", callId);
    const transcriptData = await getTranscriptAndSummary(callId);

    res.json({
      success: true,
      data: transcriptData,
    });
  } catch (error) {
    console.error("Error in /api/agents/calls/:callId/transcript:", error);
    res.status(500).json({
      error: "Failed to retrieve transcript",
      details: error.message,
    });
  }
});

/**
 * GET /api/agents/calls/:callId/summary
 * Retrieves only the summary for a specific call
 */
router.get("/calls/:callId/summary", async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({ error: "Call ID is required" });
    }

    console.log("Retrieving summary for call:", callId);
    const { summary, call_length, completed } = await getTranscriptAndSummary(
      callId
    );

    res.json({
      success: true,
      data: {
        call_id: callId,
        summary,
        call_length,
        completed,
      },
    });
  } catch (error) {
    console.error("Error in /api/agents/calls/:callId/summary:", error);
    res.status(500).json({
      error: "Failed to retrieve summary",
      details: error.message,
    });
  }
});

/**
 * POST /api/agents/:agentId/call
 * Makes a phone call using the specified agent
 */
router.post("/:agentId/call", async (req, res) => {
  try {
    const { agentId } = req.params;
    const { phone_number, max_duration, record, ...otherOptions } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    console.log("Making call with agent:", agentId, "to:", phone_number);
    const callDetails = await makePhoneCall(agentId, phone_number, {
      max_duration,
      record,
      ...otherOptions,
    });

    res.json({
      success: true,
      message: "Call initiated successfully",
      data: callDetails,
    });
  } catch (error) {
    console.error("Error in /api/agents/:agentId/call:", error);
    res.status(500).json({
      error: "Failed to initiate call",
      details: error.message,
    });
  }
});

/**
 * GET /api/agents/calls
 * Gets all calls (optionally filtered by agent_id)
 */
router.get("/calls", async (req, res) => {
  try {
    const { agent_id } = req.query;

    console.log(
      "Retrieving all calls",
      agent_id ? `for agent: ${agent_id}` : ""
    );
    const calls = await getAllCalls(agent_id);

    res.json({
      success: true,
      data: calls,
    });
  } catch (error) {
    console.error("Error in /api/agents/calls:", error);
    res.status(500).json({
      error: "Failed to retrieve calls",
      details: error.message,
    });
  }
});

/**
 * GET /api/agents/calls/:callId/status
 * Gets the current status of a call
 */
router.get("/calls/:callId/status", async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({ error: "Call ID is required" });
    }

    console.log("Getting status for call:", callId);
    const status = await getCallStatus(callId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error in /api/agents/calls/:callId/status:", error);
    res.status(500).json({
      error: "Failed to get call status",
      details: error.message,
    });
  }
});

module.exports = router;
