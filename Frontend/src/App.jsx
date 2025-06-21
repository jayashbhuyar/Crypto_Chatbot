import React, { useState, useEffect, useRef } from 'react';
import { BlandWebClient } from 'bland-client-js-sdk';
import { createAgentSession, sendUserMessage, sendAgentMessage } from './services/api.jsx';
import Transcript from './components/Transcript.jsx';
import './App.css';

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [blandClient, setBlandClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const transcriptRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { agent, session } = await createAgentSession();
      
      // Create new client instance with agent ID and session token
      const client = new BlandWebClient(agent.agent_id, session.token);
      setBlandClient(client);

      // Initialize the conversation
      await client.initConversation({
        sampleRate: 44100,
        onMessage: async (message) => {
          console.log('Agent message received:', message);
          
          // Check if message contains exchange selection
          const exchangeMatch = message.match(/selected\s+(\w+)/i);
          if (exchangeMatch) {
            setSelectedExchange(exchangeMatch[1]);
          }

          // Add loading state for exchange data fetching
          if (message.includes('fetching data')) {
            setMessages(prev => [...prev, { 
              speaker: 'System',
              text: 'Fetching data from exchange...',
              type: 'loading',
              timestamp: new Date().toLocaleTimeString()
            }]);
          }

          setMessages(prev => [...prev, { 
            speaker: 'Agent', 
            text: message,
            exchange: selectedExchange,
            timestamp: new Date().toLocaleTimeString()
          }]);
          // Send agent message to backend for logging
          try {
            await sendAgentMessage(message);
          } catch (err) {
            console.error('Failed to log agent message to backend:', err);
          }
        },
        onUserSpeech: async (text) => {
          console.log('User speech detected:', text);
          setMessages(prev => [...prev, {
            speaker: 'User',
            text: text,
            exchange: selectedExchange,
            timestamp: new Date().toLocaleTimeString()
          }]);
          // Send to backend for logging
          try {
            await sendUserMessage(text);
          } catch (err) {
            console.error('Failed to log user message to backend:', err);
          }
        },
        onListening: (isListening) => {
          console.log('Listening state changed:', isListening);
          setIsListening(isListening);
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          setError(error.message);
          setIsConnected(false);
        },
        onClose: () => {
          console.log('Conversation closed');
          setIsConnected(false);
        },
        onStart: () => {
          console.log('Conversation started');
          setIsConnected(true);
        },
        onEnd: () => {
          console.log('Conversation ended');
          setIsConnected(false);
        }
      });

      // Add initial greeting
      setMessages([{ 
        speaker: 'Agent', 
        text: agent.first_sentence || 'Hello! I\'m your crypto trading assistant. Which exchange would you like to trade on?',
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Set connected state after successful initialization
      setIsConnected(true);
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError('Failed to start conversation: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopConversation = async () => {
    try {
      if (blandClient) {
        await blandClient.stopConversation();
        setIsConnected(false);
        setMessages(prev => [...prev, {
          speaker: 'System',
          text: 'Conversation ended',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      setError('Failed to stop conversation: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Crypto OTC Trading Assistant</h1>
          <div className="mt-2 text-sm text-gray-600">
            Status: {isConnected ? (isListening ? 'Listening...' : 'Connected') : 'Disconnected'}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center mb-6">
            {!isConnected ? (
              <button 
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleStartConversation}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Conversation'}
              </button>
            ) : (
              <button 
                className="px-4 py-2 rounded-md text-white font-medium bg-red-600 hover:bg-red-700"
                onClick={handleStopConversation}
              >
                Stop Conversation
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="h-[600px] overflow-y-auto" ref={transcriptRef}>
              <Transcript messages={messages} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
