# Voice-Operated OTC Trading Bot

A web-based, voice-operated OTC trading bot using Bland.ai's Web Agents for real-time browser voice chat. The bot guides users through placing simulated OTC crypto orders via a conversational flow.

## Features

- Real-time voice chat interface
- Support for multiple exchanges (OKX, Bybit, Deribit, Binance)
- Live price fetching
- Conversation transcript display
- Clean, modern UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Bland.ai API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Set up the backend:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory:
```
BLAND_API_KEY=your_bland_ai_api_key
PORT=3001
```

4. Set up the frontend:
```bash
cd ../Frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd Frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click the "Start Conversation" button to begin a voice chat session
2. Follow the agent's prompts to:
   - Select an exchange
   - Choose a trading symbol
   - View current market price
   - Specify order quantity and price
3. The conversation transcript will be displayed in real-time
4. Click "Stop Conversation" to end the session

## Project Structure

```
/
├── backend/
│   ├── routes/
│   │   ├── agents.js
│   │   └── exchanges.js
│   ├── services/
│   │   ├── blandService.js
│   │   └── exchangeService.js
│   └── server.js
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   └── Transcript.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   └── App.css
    └── package.json
```

## Error Handling

The application includes comprehensive error handling for:
- API connection issues
- Invalid exchange selections
- Invalid trading symbols
- Price fetching failures
- Voice chat session errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 