import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// In-memory storage for chat messages
const chatMessages = [];

// Endpoint for Make.com to send AI responses
app.post('/api/chat-response', (req, res) => {
  const { response, sessionId, timestamp, techId } = req.body;
  
  console.log('📨 Received from Make.com:', { response, sessionId, techId });
  
  if (!response) {
    return res.status(400).json({ error: 'Missing response field' });
  }

  const newMessage = {
    id: uuidv4(),
    text: response,
    sender: 'ai',
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    sessionId: sessionId || 'default_session',
    techId: techId
  };

  chatMessages.push(newMessage);
  console.log('✅ Stored AI message:', newMessage.id);
  
  res.status(200).json({ 
    message: 'AI response received',
    messageId: newMessage.id 
  });
});

// Endpoint for frontend to get new messages
app.get('/api/chat-messages/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { since } = req.query; // Optional: only get messages after this timestamp
  
  let sessionMessages = chatMessages.filter(msg => 
    msg.sessionId === sessionId && msg.sender === 'ai'
  );
  
  if (since) {
    const sinceDate = new Date(since);
    sessionMessages = sessionMessages.filter(msg => 
      new Date(msg.timestamp) > sinceDate
    );
  }
  
  console.log(`📥 Sending ${sessionMessages.length} messages for session ${sessionId}`);
  res.status(200).json(sessionMessages);
});

app.listen(port, () => {
  console.log(`🚀 Chat server running at http://localhost:${port}`);
});