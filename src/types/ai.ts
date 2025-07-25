export interface AISession {
  id: string;
  company_id: string;
  user_id: string;
  session_uuid: string; // Integrate with Task 1 UUID system
  status: 'active' | 'completed' | 'failed';
  make_session_id?: string;
  created_at: string;
  updated_at: string;
  messages: AIMessage[];
}

export interface AIMessage {
  id: string;
  session_id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  tool_used?: string;
  metadata?: any;
}

export interface QuoteData {
  id: string;
  session_id: string;
  client_id: string;
  quote_number: string;
  title: string;
  description: string;
  items: QuoteItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  valid_until: string;
  ai_generated: boolean;
  ai_confidence_score?: number;
}

export interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface AISuggestion {
    id: string;
    type: 'item' | 'text' | 'pricing';
    content: any;
}

export interface AITool {
    id: string;
    name: string;
    description: string;
    usage_count: number;
}
