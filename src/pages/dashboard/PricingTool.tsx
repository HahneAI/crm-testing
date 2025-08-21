import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { flushSync } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import {
    getCoreConfig,
    getTerminologyConfig,
    getSmartVisualThemeConfig,
} from '../config/industry';
import { triggerSendEffect } from './ui/IndustryEffects';
import TypingIndicator from './ui/TypingIndicator';
import { ThemeAwareMessageBubble } from './ui/ThemeAwareMessageBubble';
import { ThemeAwareAvatar } from './ui/ThemeAwareAvatar';
import { Message } from '../types/job';
import DashboardLayout from '../../components/layout/DashboardLayout';

const coreConfig = getCoreConfig();
const terminologyConfig = getTerminologyConfig();

const DynamicIcon = ({ name, ...props }: { name: keyof typeof Icons } & Icons.LucideProps) => {
  const IconComponent = Icons[name];
  if (!IconComponent) {
    return <Icons.MessageCircle {...props} />;
  }
  return <IconComponent {...props} />;
};


const PricingTool = () => {
  const { theme, toggleTheme } = useTheme();
  const visualConfig = getSmartVisualThemeConfig(theme);
  
  const sessionIdRef = useRef<string>(`quote_session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPollTimeRef = useRef<Date>(new Date());
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const refreshButtonRef = useRef<HTMLButtonElement>(null);

  const welcomeMessage = import.meta.env.VITE_WELCOME_MESSAGE || `Welcome to ${coreConfig.companyName}! How can I help you today?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeMessage,
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const MAKE_WEBHOOK_URL = coreConfig.makeWebhookUrl;
  const NETLIFY_API_URL = `/.netlify/functions/chat-messages/${sessionIdRef.current}`;

  const sendUserMessageToMake = async (userMessageText: string) => {
    if (!MAKE_WEBHOOK_URL) {
      console.warn("Make.com webhook URL is not configured. Skipping message sending.");
      return;
    }
    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          timestamp: new Date().toISOString(),
          sessionId: sessionIdRef.current,
          source: 'quote_engine',
          techId: '22222222-2222-2222-2222-222222222222'
        })
      });
      if (!response.ok) throw new Error('Failed to send message to Make.com');
      console.log('✅ User message sent to AI agent successfully');
    } catch (error) {
      console.error('❌ Error sending user message to AI agent:', error);
      throw error;
    }
  };

  const pollForAiMessages = React.useCallback(async () => {
    try {
      const response = await fetch(`${NETLIFY_API_URL}?since=${lastPollTimeRef.current.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch AI messages');
      const newAiMessages = await response.json();
      
      if (newAiMessages.length > 0) {
        const processedMessages = newAiMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(prev => [...prev, ...processedMessages]);
        setIsLoading(false);
        lastPollTimeRef.current = new Date();
      }
    } catch (e) {
      console.error('Error polling for AI messages:', e);
    }
  }, [NETLIFY_API_URL]);

  useEffect(() => {
    const pollingInterval = setInterval(pollForAiMessages, 3000);
    return () => clearInterval(pollingInterval);
  }, [pollForAiMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 const handleSendMessage = async () => {
  if (!inputText.trim()) return;

  triggerSendEffect(sendButtonRef.current);

  const userMessageText = inputText;
  const messageId = uuidv4();
  const userMessage: Message = {
    id: messageId,
    text: userMessageText,
    sender: 'user',
    timestamp: new Date(),
    sessionId: sessionIdRef.current,
    status: 'sending',
  };

  // Force synchronous render of user message before loading state
  flushSync(() => {
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
  });

  // Delay loading state to allow user message animation to start
  setTimeout(() => {
    setIsLoading(true);
  }, 300); // 0.25s = slightly after user message 0.2s delay
  
  try {
    await sendUserMessageToMake(userMessageText);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'sent' } : m));
  } catch {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'error', text: `${m.text}\n\n[Error: Could not send message]` } : m));
    setIsLoading(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefreshChat = async () => {
    // Trigger leaf flutter animation on button (existing functionality)
    triggerSendEffect(refreshButtonRef.current);

    // Phase 1: Start refresh animation state
    setIsRefreshing(true);

    // Phase 2: Wait for fade-up-out animation to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Phase 3: Clear messages and generate new session
    sessionIdRef.current = `quote_session_${Date.now()}`;

    setMessages([{
      id: '1',
      text: welcomeMessage,
      sender: 'ai',
      timestamp: new Date(),
      sessionId: sessionIdRef.current
    }]);

    // Clear loading states
    setIsLoading(false);
    setInputText('');
    lastPollTimeRef.current = new Date();

    // Phase 4: Brief pause then end refresh state (allows fade-in)
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsRefreshing(false);

    console.log('🔄 Chat refreshed with new session:', sessionIdRef.current);
  };

  return (
  <DashboardLayout title="AI Pricing Tool">
    <div
      className="h-screen flex flex-col font-sans transition-colors duration-300"
      style={{ backgroundColor: visualConfig.colors.background }}
    >
<header className="flex-shrink-0 p-4">
  <div className="w-full">  {/* Changed from max-w-4xl mx-auto */}
    <div className="flex items-center justify-between">  {/* Changed from justify-start */}
      {/* Logo and Title - Clean Left Alignment */}
      <div className="flex items-center space-x-4">
        <div
          className="flex items-center justify-center p-2 rounded-2xl shadow-md"
          style={{ backgroundColor: visualConfig.colors.primary }}
        >
          {coreConfig.logoUrl ? (
            <img src={coreConfig.logoUrl} alt={`${coreConfig.companyName} Logo`} className='h-10 w-auto' />
          ) : (
            <DynamicIcon
              name={coreConfig.headerIcon}
              className="h-8 w-8"
              style={{ color: visualConfig.colors.text.onPrimary }}
            />
          )}
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: visualConfig.colors.text.primary }}
          >
            {coreConfig.companyName}
          </h1>
          <p
            className="text-sm"
            style={{ color: visualConfig.colors.text.secondary }}
          >
            {terminologyConfig.businessType}
          </p>
        </div>
      </div>

      {/* Controls - Clean Right Alignment */}
      <div className="flex items-center space-x-3">  {/* Removed ml-auto */}
        {/* Refresh Button */}
        <button
          ref={refreshButtonRef}
          onClick={handleRefreshChat}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: visualConfig.colors.primary,
            color: visualConfig.colors.text.onPrimary,
            '--tw-ring-color': visualConfig.colors.primary,
          }}
          title="Start a new chat session"
        >
          <DynamicIcon name="RotateCcw" className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">New Chat</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
            color: visualConfig.colors.text.secondary
          }}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ?
            <Icons.Sun className="h-6 w-6" /> :
            <Icons.Moon className="h-6 w-6" />
          }
        </button>
      </div>
    </div>
  </div>
</header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <div
          className="flex-1 rounded-2xl shadow-lg flex flex-col overflow-hidden min-h-0 transition-all duration-300"
          style={{
            backgroundColor: visualConfig.colors.surface,
            borderRadius: visualConfig.patterns.componentShape === 'organic' ? '1.5rem' : '0.75rem'
          }}
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
  <div
    key={message.id}
    className={`
      ${isRefreshing ? 'animate-fade-up-out' : ''}
      ${!isRefreshing && index === messages.length - 1 && message.sender === 'user' ? 'animate-fade-up-in-delay-user' : ''}
      ${!isRefreshing && index === messages.length - 1 && message.sender === 'ai' ? 'animate-fade-up-in-delay' : ''}
    `}
  >
                <ThemeAwareMessageBubble
                  message={message}
                  visualConfig={visualConfig}
                  theme={theme}
                />
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start animate-loading-entry">
                <ThemeAwareAvatar sender="ai" visualConfig={visualConfig} />
                <div
                  className="px-5 py-3 rounded-2xl shadow-md flex items-center gap-3 transition-colors duration-300"
                  style={{ backgroundColor: visualConfig.colors.elevated }}
                >
                  <TypingIndicator />
                  <p
                    className="text-sm"
                    style={{ color: visualConfig.colors.text.secondary }}
                  >
                    {terminologyConfig.statusMessages.thinking}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="border-t p-3 transition-colors duration-300"
            style={{
              backgroundColor: visualConfig.colors.surface,
              borderTopColor: theme === 'light' ? '#e5e7eb' : '#374151'
            }}
          >
            <div className="flex items-center space-x-4 max-w-4xl mx-auto">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={terminologyConfig.placeholderExamples}
                className="flex-1 px-3 py-2 rounded-xl resize-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: visualConfig.colors.background,
                  color: visualConfig.colors.text.primary,
                  borderColor: visualConfig.colors.secondary,
                  '--tw-ring-color': visualConfig.colors.primary,
                  borderRadius: visualConfig.patterns.componentShape === 'organic' ? '1.25rem' : '0.75rem'
                }}
                rows={1}
                disabled={isLoading}
              />
              <button
                ref={sendButtonRef}
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: visualConfig.colors.primary,
                  color: visualConfig.colors.text.onPrimary,
                  borderRadius: visualConfig.patterns.componentShape === 'organic' ? '1.25rem' : '0.75rem'
                }}
              >
                <DynamicIcon name="Send" className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">
                  {terminologyConfig.buttonTexts.send}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </DashboardLayout>  {/* ADD THIS LINE */}
  );
};

export default PricingTool;