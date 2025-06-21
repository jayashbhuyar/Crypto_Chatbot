import React from 'react';

/**
 * Transcript component displays the conversation history between the user and the agent
 * @param {Object} props
 * @param {Array<{speaker: string, text: string, type?: string}>} props.messages - Array of conversation messages
 */
const Transcript = ({ messages }) => {
  return (
    <div className="flex flex-col space-y-4 p-4 bg-gray-50 rounded-lg">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex flex-col p-3 rounded-lg ${
            message.speaker.toLowerCase() === 'agent' 
              ? 'bg-blue-100 ml-4' 
              : message.speaker.toLowerCase() === 'user'
              ? 'bg-green-100 mr-4'
              : 'bg-gray-100'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-sm text-gray-700">
              {message.speaker}
            </span>
            <span className="text-xs text-gray-500">
              {message.timestamp}
            </span>
          </div>
          <div className="text-gray-800">
            {message.type === 'loading' ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>{message.text}</span>
              </div>
            ) : (
              message.text
            )}
          </div>
          {message.exchange && (
            <div className="mt-2 text-sm text-gray-600">
              Selected Exchange: <span className="font-medium">{message.exchange}</span>
            </div>
          )}
        </div>
      ))}
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No messages yet. Click "Start Conversation" to begin.
        </div>
      )}
    </div>
  );
};

export default Transcript; 