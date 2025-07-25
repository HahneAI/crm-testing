import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase';
import { AISession } from '../types/ai';

export interface AISessionManager {
  createSession(companyId: string, userId: string): Promise<AISession>;
  updateSession(sessionId: string, updates: Partial<AISession>): Promise<void>;
  endSession(sessionId: string): Promise<void>;
  getActiveSessions(companyId: string): Promise<AISession[]>;
  sendToMake(sessionId: string, message: string, tool: string): Promise<void>;
}

export class EnterpriseAISessionManager implements AISessionManager {
  private makeWebhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;

  async createSession(companyId: string, userId: string): Promise<AISession> {
    // Generate enterprise UUID using Task 1 system
    const sessionUuid = this.generateEnterpriseUUID(companyId);

    const session: Partial<AISession> = {
      id: uuidv4(),
      company_id: companyId,
      user_id: userId,
      session_uuid: sessionUuid,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
    };

    const { data, error } = await supabase
      .from('ai_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data as AISession;
  }

  private generateEnterpriseUUID(companyId: string): string {
    // Integrate with Task 1 UUID system
    // Include geo/client/profit encoding from existing system
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `ai_${companyId}_${timestamp}_${random}`;
  }

  async updateSession(sessionId: string, updates: Partial<AISession>): Promise<void> {
    const { error } = await supabase
        .from('ai_sessions')
        .update(updates)
        .eq('id', sessionId);
    if (error) throw error;
  }

  async endSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, { status: 'completed' });
  }

  async getActiveSessions(companyId: string): Promise<AISession[]> {
    const { data, error } = await supabase
        .from('ai_sessions')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active');
    if (error) throw error;
    return data as AISession[];
  }

  async sendToMake(sessionId: string, message: string, tool: string): Promise<void> {
    const payload = {
      session_id: sessionId,
      message: message,
      tool: tool,
      timestamp: new Date().toISOString(),
      company_context: await this.getCompanyContext(sessionId)
    };

    try {
      const response = await fetch(this.makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Make.com webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send to Make.com:', error);
      throw error;
    }
  }

  private async getCompanyContext(sessionId: string): Promise<any> {
    // Get company data for AI context using Task 2 database structure
    const { data: session } = await supabase
      .from('ai_sessions')
      .select(`
        *,
        companies(*),
        users(*)
      `)
      .eq('id', sessionId)
      .single();

    return {
      company: session?.companies,
      user: session?.users,
      recent_quotes: await this.getRecentQuotes(session?.company_id),
      clients: await this.getActiveClients(session?.company_id)
    };
  }

  private async getRecentQuotes(companyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data;
  }

  private async getActiveClients(companyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active');
    if (error) throw error;
    return data;
  }
}
