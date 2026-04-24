import { createClient } from '@supabase/supabase-js'
import type { Persona, Message, FeedEvent, Memory } from '@/types'
import { MOCK_PERSONAS, MOCK_FEED_EVENTS } from './mock-data'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

// In-memory store (used when Supabase is not configured)
const store = {
  personas: [...MOCK_PERSONAS] as Persona[],
  messages: [] as Message[],
  feedEvents: [...MOCK_FEED_EVENTS] as FeedEvent[],
  memories: [] as Memory[],
}

export const db = {
  // ─── Personas ────────────────────────────────────────────────────

  async getPersonas(): Promise<Persona[]> {
    if (supabase) {
      const { data } = await supabase
        .from('personas')
        .select('*')
        .order('created_at', { ascending: false })
      return data || []
    }
    return store.personas
  },

  async getPersona(id: string): Promise<Persona | null> {
    if (supabase) {
      const { data } = await supabase.from('personas').select('*').eq('id', id).single()
      return data
    }
    return store.personas.find((p) => p.id === id) || null
  },

  async getPersonaByWallet(walletAddress: string): Promise<Persona | null> {
    const addr = walletAddress.toLowerCase()
    if (supabase) {
      const { data } = await supabase
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
    if (supabase) {
      const { data, error } = await supabase
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
    if (supabase) {
      const { data } = await supabase
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
    if (supabase) {
      const { data } = await supabase
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
    if (supabase) {
      const { data, error } = await supabase
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
    if (supabase) {
      const { data } = await supabase
        .from('feed_events')
        .select(
          `*, actor:actor_persona_id(id,name,traits), target:target_persona_id(id,name,traits)`,
        )
        .order('created_at', { ascending: false })
        .limit(limit)

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
    if (supabase) {
      const { data, error } = await supabase
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
    if (supabase) {
      const { data } = await supabase
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
    if (supabase) {
      const { data, error } = await supabase
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
}
