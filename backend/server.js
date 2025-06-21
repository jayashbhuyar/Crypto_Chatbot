require('dotenv').config();
const express = require('express');
const cors = require('cors');
const agentsRouter = require('./routes/agents');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/agents', agentsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  });
});

// 404 handler
app.use((req, res) => {
  console.error('Route not found:', req.method, req.url);
  res.status(404).json({
    error: 'Not Found',
    details: `Route ${req.method} ${req.url} not found`
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /health');
  console.log('- POST /api/agents/create');
  console.log('- POST /api/agents/message');
  console.log('- GET /api/agents/conversation');
}); 