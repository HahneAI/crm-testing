import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AISession, AIMessage, QuoteData } from '../../types/ai';
import { ChatInterface } from '../../components/quotes/ChatInterface';
import { QuoteBuilder } from '../../components/quotes/QuoteBuilder';
import { EnterpriseAISessionManager } from '../../utils/aiSession';

const Quotes = () => {
  const { user, userProfile } = useAuth();
  const [activeSession, setActiveSession] = useState<AISession | null>(null);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionManager = new EnterpriseAISessionManager();

  useEffect(() => {
    if (userProfile) {
      fetchSessions();
      fetchQuotes();
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeSession) {
      const subscription = supabase
        .channel(`session_${activeSession.id}`)
        .on('broadcast', { event: 'ai_response' }, (payload) => {
          setChatMessages((prev) => [...prev, payload.payload.message]);
          if (payload.payload.quote_data) {
            fetchQuotes();
          }
          setIsProcessing(false);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeSession]);

  const fetchSessions = async () => {
    if (userProfile) {
      const activeSessions = await sessionManager.getActiveSessions(userProfile.company_id);
      setSessions(activeSessions);
      if (activeSessions.length > 0) {
        setActiveSession(activeSessions[0]);
        fetchMessages(activeSessions[0].id);
      }
    }
  };

  const fetchQuotes = async () => {
    if (userProfile) {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching quotes:', error);
      else setQuotes(data as QuoteData[]);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });
    if (error) console.error('Error fetching messages:', error);
    else setChatMessages(data as AIMessage[]);
  };

  const handleSendMessage = async (message: string, tool?: string) => {
    if (!activeSession) return;
    setIsProcessing(true);
    const newMessage: AIMessage = {
      id: '',
      session_id: activeSession.id,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, newMessage]);

    await sessionManager.sendToMake(activeSession.id, message, tool || 'quote_generator');
  };

  const handleCreateSession = async () => {
    if (user && userProfile) {
      const newSession = await sessionManager.createSession(userProfile.company_id, user.id);
      setActiveSession(newSession);
      setSessions(prev => [newSession, ...prev]);
    }
  }

  return (
    <DashboardLayout title="AI Quote Engine">
      <div className="flex h-full">
        <div className="w-1/3 border-r">
          <div className="p-4">
            <button onClick={handleCreateSession} className="w-full bg-blue-500 text-white p-2 rounded">New Session</button>
          </div>
          <ul>
            {sessions.map(session => (
              <li key={session.id} onClick={() => setActiveSession(session)} className={`p-4 cursor-pointer ${activeSession?.id === session.id ? 'bg-gray-200' : ''}`}>
                Session {session.session_uuid}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 flex flex-col">
          {activeSession ? (
            <>
              <ChatInterface
                session={activeSession}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
              {quotes.find(q => q.ai_session_id === activeSession.id) && (
                <QuoteBuilder
                  quote={quotes.find(q => q.ai_session_id === activeSession.id)!}
                  onUpdateQuote={() => {}}
                />
              )}
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p>Select a session or create a new one to start.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Quotes;