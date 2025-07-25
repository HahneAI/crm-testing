import { supabase } from '../../../services/supabase';

// Webhook endpoint for receiving Make.com responses
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();

    // TODO: Validate webhook signature if needed
    // if (!validateMakeWebhook(payload)) {
    //   return new Response('Invalid webhook', { status: 401 });
    // }

    // Process AI response
    await processAIResponse(payload);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal error', { status: 500 });
  }
}

async function processAIResponse(payload: any) {
  const { session_id, ai_response, tool_used, quote_data, is_complete } = payload;

  // Update session with AI response
  await supabase
    .from('ai_sessions')
    .update({
      updated_at: new Date().toISOString(),
      status: is_complete ? 'completed' : 'active'
    })
    .eq('id', session_id);

  // Add AI message to conversation
  await supabase
    .from('ai_messages')
    .insert({
      session_id,
      type: 'ai',
      content: ai_response,
      tool_used,
      timestamp: new Date().toISOString(),
      metadata: payload.metadata
    });

  // If quote data provided, create/update quote
  if (quote_data) {
    await createOrUpdateQuote(session_id, quote_data, tool_used, payload.metadata);
  }

  // Trigger real-time update to frontend
  await supabase
    .channel(`session_${session_id}`)
    .send({
      type: 'broadcast',
      event: 'ai_response',
      payload: {
        session_id,
        message: ai_response,
        tool_used,
        quote_data
      }
    });
}

async function createOrUpdateQuote(session_id: string, quote_data: any, tool_used: string, metadata: any) {
    const { data: existingQuote } = await supabase
        .from('quotes')
        .select('id')
        .eq('ai_session_id', session_id)
        .single();

    if (existingQuote) {
        await supabase
            .from('quotes')
            .update({
                ...quote_data,
                ai_generated: true,
                ai_tool_used: tool_used,
                ai_confidence_score: metadata?.confidence_score,
            })
            .eq('id', existingQuote.id);
    } else {
        await supabase
            .from('quotes')
            .insert({
                ...quote_data,
                ai_session_id: session_id,
                ai_generated: true,
                ai_tool_used: tool_used,
                ai_confidence_score: metadata?.confidence_score,
            });
    }
}
