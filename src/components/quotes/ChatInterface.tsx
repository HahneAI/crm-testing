import React, { useState, useRef, useEffect } from 'react';
import { AISession, AIMessage } from '../../types/ai';
import { ToolSelector } from './ToolSelector';

export const ChatInterface: React.FC<{
  session: AISession;
  onSendMessage: (message: string, tool?: string) => void;
  isProcessing: boolean;
}> = ({ session, onSendMessage, isProcessing }) => {
  const [message, setMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('quote_generator');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableTools = [
      { id: 'quote_generator', name: 'Quote Generator', description: 'Generate a new quote', usage_count: 0 },
      { id: 'pricing_optimizer', name: 'Pricing Optimizer', description: 'Optimize pricing for a quote', usage_count: 0 },
      { id: 'cost_estimator', name: 'Cost Estimator', description: 'Estimate costs for a job', usage_count: 0 },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, selectedTool);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 overflow-y-auto">
        {session.messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <p>{msg.content}</p>
              {msg.tool_used && <small className="text-xs text-gray-500">Tool: {msg.tool_used}</small>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <ToolSelector availableTools={availableTools} selectedTool={selectedTool} onToolSelect={setSelectedTool} />
        <div className="flex mt-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-grow border rounded-l-lg p-2"
            placeholder="Type your message..."
            disabled={isProcessing}
          />
          <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded-r-lg" disabled={isProcessing}>
            {isProcessing ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};
