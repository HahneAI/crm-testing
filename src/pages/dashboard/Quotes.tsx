import React, { useState } from 'react';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Quotes = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Quote Engine assistant. I can help you create accurate quotes for landscaping jobs. What project would you like to quote today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Replace this URL with your actual Make.com scenario webhook URL
  const MAKE_WEBHOOK_URL = 'https://hook.us1.make.com/rb5gufndgl01tauq71txny9pswtovpy5';

  const sendToMake = async (userMessage: string) => {
    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          timestamp: new Date().toISOString(),
          sessionId: 'quote_session_' + Date.now(),
          source: 'quote_engine',
          techId: '22222222-2222-2222-2222-222222222222'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send to Make.com');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending to Make.com:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send to Make.com
      const makeResponse = await sendToMake(inputText);
      
      // Add AI response (you might get this back from Make.com or handle it separately)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: makeResponse.response || "Message sent to quote engine successfully! Processing your request...",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error connecting to the quote engine. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Quote Engine
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[600px] flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Processing...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about a landscaping quote..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Connected to Make.com AI Quote Engine | Tech ID: 22222222-2222-2222-2222-222222222222
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Quotes;