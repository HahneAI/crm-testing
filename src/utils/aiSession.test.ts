import { EnterpriseAISessionManager } from './aiSession';
import { supabase } from '../services/supabase';
import { vi } from 'vitest';

// Mock supabase
vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  },
}));

describe('EnterpriseAISessionManager', () => {
  let sessionManager: EnterpriseAISessionManager;

  beforeEach(() => {
    sessionManager = new EnterpriseAISessionManager();
    vi.clearAllMocks();
  });

  it('should create a session', async () => {
    const mockSession = { id: 'test-session-id', company_id: 'test-company-id', user_id: 'test-user-id' };
    (supabase.from('ai_sessions').select().single as vi.Mock).mockResolvedValue({ data: mockSession, error: null });

    const session = await sessionManager.createSession('test-company-id', 'test-user-id');

    expect(supabase.from).toHaveBeenCalledWith('ai_sessions');
    expect(supabase.from('ai_sessions').insert).toHaveBeenCalled();
    expect(session).toEqual(mockSession);
  });

  it('should update a session', async () => {
    await sessionManager.updateSession('test-session-id', { status: 'completed' });

    expect(supabase.from).toHaveBeenCalledWith('ai_sessions');
    expect(supabase.from('ai_sessions').update).toHaveBeenCalledWith({ status: 'completed' });
    expect(supabase.from('ai_sessions').update({ status: 'completed' }).eq).toHaveBeenCalledWith('id', 'test-session-id');
  });

  it('should end a session', async () => {
    const updateSpy = vi.spyOn(sessionManager, 'updateSession');
    await sessionManager.endSession('test-session-id');
    expect(updateSpy).toHaveBeenCalledWith('test-session-id', { status: 'completed' });
  });

  it('should get active sessions', async () => {
    const mockSessions = [{ id: 'session1' }, { id: 'session2' }];

    const eqMock = vi.fn().mockReturnThis();
    const mockT = {
      eq: eqMock,
      then: (cb) => {
        cb({ data: mockSessions, error: null });
      }
    };

    const selectMock = vi.fn(() => (mockT));
    (supabase.from as vi.Mock).mockReturnValue({ select: selectMock });


    const sessions = await sessionManager.getActiveSessions('test-company-id');

    expect(supabase.from).toHaveBeenCalledWith('ai_sessions');
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(eqMock).toHaveBeenCalledWith('company_id', 'test-company-id');
    expect(eqMock).toHaveBeenCalledWith('status', 'active');
    expect(sessions).toEqual(mockSessions);
  });
});
