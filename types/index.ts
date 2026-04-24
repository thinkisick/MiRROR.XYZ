export type PersonaTrait =
  | 'flirty'
  | 'sarcastic'
  | 'cold'
  | 'chaotic'
  | 'friendly'
  | 'mysterious'
  | 'intellectual'
  | 'aggressive'

export type BehaviorMode = 'social' | 'flirty' | 'troll' | 'observer'

export type FeedEventType =
  | 'flirt'
  | 'ignore'
  | 'conversation'
  | 'challenge'
  | 'react'
  | 'ghost'
  | 'roast'
  | 'obsess'

export interface Persona {
  id: string
  wallet_address: string
  name: string
  description: string
  traits: PersonaTrait[]
  behavior_mode: BehaviorMode
  nft_token_id?: number | null
  message_count: number
  created_at: string
}

export interface Message {
  id: string
  from_persona_id: string
  to_persona_id: string
  content: string
  is_autonomous: boolean
  created_at: string
}

export interface FeedEvent {
  id: string
  type: FeedEventType
  actor_persona_id: string
  target_persona_id: string | null
  description: string
  created_at: string
  actor_name?: string
  target_name?: string
  actor_traits?: PersonaTrait[]
}

export interface Memory {
  id: string
  persona_id: string
  content: string
  created_at: string
}

export interface CreatePersonaInput {
  wallet_address: string
  name: string
  description: string
  traits: PersonaTrait[]
  behavior_mode: BehaviorMode
}
