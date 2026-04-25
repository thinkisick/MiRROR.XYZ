import { createClient } from '@supabase/supabase-js'
import type { Persona, Message, FeedEvent, Memory, HelpRequest } from '@/types'
import { MOCK_PERSONAS, MOCK_FEED_EVENTS, MOCK_HELP_REQUESTS } from './mock-data'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
let _checked = false

function getSupabase() {
  if (_checked) return _supabase
  _checked = true
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key && url.startsWith('http')) {
    try { _supabase = createClient(url, key) } catch { _supabase = null }
  }
  return _supabase
}

const store = {
  personas: [...MOCK_PERSONAS] as Persona[],
  messages: [] as Message[],
  feedEvents: [...MOCK_FEED_EVENTS] as FeedEvent[],
  memories: [] as Memory[],
  helpRequests: [...MOCK_HELP_REQUESTS] as HelpRequest[],
}

export const db = {
  // ─── Personas ────────────────────────────────────────────────────

  async getPersonas(): Promise<Persona[]> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('personas')
        .select('*')
        .order('created_at', { ascending: false })
      return data || []
    }
    return store.personas
  },

  async getPersona(id: string): Promise<Persona | null> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb.from('personas').select('*').eq('id', id).single()
      return data
    }
    return store.personas.find((p) => p.id === id) || null
  },

  async getPersonaByWallet(walletAddress: string): Promise<Persona | null> {
    const addr = walletAddress.toLowerCase()
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('personas')
        .select('*')
        .eq('wallet_address', addr)
        .maybeSingle()
      return data
    }
    return store.personas.find((p) => p.wallet_address.toLowerCase() === addr) || null
  },

  async createPersona(
    persona: Omit<Persona, 'id' | 'created_at' | 'message_count'>,
  ): Promise<Persona> {
    const newPersona: Persona = {
      ...persona,
      id: crypto.randomUUID(),
      message_count: 0,
      created_at: new Date().toISOString(),
    }
    const sb = getSupabase()
    if (sb) {
      const { data, error } = await sb
        .from('personas')
        .insert(newPersona)
        .select()
        .single()
      if (error) throw error
      return data
    }
    store.personas.unshift(newPersona)
    return newPersona
  },

  async updatePersona(id: string, updates: Partial<Persona>): Promise<Persona | null> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('personas')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return data
    }
    const idx = store.personas.findIndex((p) => p.id === id)
    if (idx === -1) return null
    store.personas[idx] = { ...store.personas[idx], ...updates }
    return store.personas[idx]
  },

  // ─── Messages ────────────────────────────────────────────────────

  async getMessages(fromId: string, toId: string): Promise<Message[]> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('messages')
        .select('*')
        .or(
          `and(from_persona_id.eq.${fromId},to_persona_id.eq.${toId}),and(from_persona_id.eq.${toId},to_persona_id.eq.${fromId})`,
        )
        .order('created_at', { ascending: true })
      return data || []
    }
    return store.messages
      .filter(
        (m) =>
          (m.from_persona_id === fromId && m.to_persona_id === toId) ||
          (m.from_persona_id === toId && m.to_persona_id === fromId),
      )
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  },

  async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    const sb = getSupabase()
    if (sb) {
      const { data, error } = await sb
        .from('messages')
        .insert(newMessage)
        .select()
        .single()
      if (error) throw error
      return data
    }
    store.messages.push(newMessage)
    return newMessage
  },

  // ─── Feed Events ─────────────────────────────────────────────────

  async getFeedEvents(limit = 50): Promise<FeedEvent[]> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('feed_events')
        .select(
          `*, actor:actor_persona_id(id,name,traits), target:target_persona_id(id,name,traits)`,
        )
        .order('created_at', { ascending: false })
        .limit(limit)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((row: any) => ({
        ...row,
        actor_name: row.actor?.name,
        target_name: row.target?.name,
        actor_traits: row.actor?.traits,
      }))
    }
    return store.feedEvents.slice(0, limit)
  },

  async createFeedEvent(event: Omit<FeedEvent, 'id' | 'created_at'>): Promise<FeedEvent> {
    const newEvent: FeedEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    const sb = getSupabase()
    if (sb) {
      const { data, error } = await sb
        .from('feed_events')
        .insert({
          type: newEvent.type,
          actor_persona_id: newEvent.actor_persona_id,
          target_persona_id: newEvent.target_persona_id,
          description: newEvent.description,
        })
        .select()
        .single()
      if (error) throw error
      return { ...data, actor_name: newEvent.actor_name, target_name: newEvent.target_name }
    }
    store.feedEvents.unshift(newEvent)
    return newEvent
  },

  // ─── Memories ────────────────────────────────────────────────────

  async getMemories(personaId: string, limit = 10): Promise<Memory[]> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('memories')
        .select('*')
        .eq('persona_id', personaId)
        .order('created_at', { ascending: false })
        .limit(limit)
      return data || []
    }
    return store.memories.filter((m) => m.persona_id === personaId).slice(-limit)
  },

  async createMemory(memory: Omit<Memory, 'id' | 'created_at'>): Promise<Memory> {
    const newMemory: Memory = {
      ...memory,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    const sb = getSupabase()
    if (sb) {
      const { data, error } = await sb
        .from('memories')
        .insert(newMemory)
        .select()
        .single()
      if (error) throw error
      return data
    }
    store.memories.push(newMemory)
    return newMemory
  },

  // ─── Help Requests ───────────────────────────────────────────────

  async getHelpRequests(limit = 30): Promise<HelpRequest[]> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('help_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(limit)
      return data || []
    }
    return store.helpRequests.filter((r) => r.status === 'open').slice(0, limit)
  },

  async getHelpRequest(id: string): Promise<HelpRequest | null> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb.from('help_requests').select('*').eq('id', id).single()
      return data
    }
    return store.helpRequests.find((r) => r.id === id) || null
  },

  async getHelpRequestsByPersona(personaId: string): Promise<HelpRequest[]> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('help_requests')
        .select('*')
        .eq('persona_id', personaId)
        .order('created_at', { ascending: false })
      return data || []
    }
    return store.helpRequests.filter((r) => r.persona_id === personaId)
  },

  async createHelpRequest(
    request: Omit<HelpRequest, 'id' | 'created_at' | 'response_count'>,
  ): Promise<HelpRequest> {
    const newRequest: HelpRequest = {
      ...request,
      id: crypto.randomUUID(),
      response_count: 0,
      created_at: new Date().toISOString(),
    }
    const sb = getSupabase()
    if (sb) {
      const { data, error } = await sb
        .from('help_requests')
        .insert(newRequest)
        .select()
        .single()
      if (error) throw error
      return data
    }
    store.helpRequests.unshift(newRequest)
    return newRequest
  },

  async updateHelpRequest(id: string, updates: Partial<HelpRequest>): Promise<HelpRequest | null> {
    const sb = getSupabase()
    if (sb) {
      const { data } = await sb
        .from('help_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return data
    }
    const idx = store.helpRequests.findIndex((r) => r.id === id)
    if (idx === -1) return null
    store.helpRequests[idx] = { ...store.helpRequests[idx], ...updates }
    return store.helpRequests[idx]
  },
}
