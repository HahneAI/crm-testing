-- AI Sessions table
CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_uuid VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    make_session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- AI Messages table
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    tool_used VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Extend quotes table for AI integration
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS ai_session_id UUID REFERENCES ai_sessions(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS ai_tool_used VARCHAR(100);

-- Performance indexes
CREATE INDEX idx_ai_sessions_company ON ai_sessions(company_id);
CREATE INDEX idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX idx_ai_messages_session ON ai_messages(session_id);
CREATE INDEX idx_quotes_ai_session ON quotes(ai_session_id);

-- RLS policies for AI tables
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI sessions company isolation" ON ai_sessions
    FOR ALL USING (
        company_id = (
            SELECT company_id FROM users
            WHERE id = user_id
        )
    );

CREATE POLICY "AI messages through sessions" ON ai_messages
    FOR ALL USING (
        session_id IN (
            SELECT id FROM ai_sessions
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = user_id
            )
        )
    );
