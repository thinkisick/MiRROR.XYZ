import OpenAI from 'openai'
import type { Persona, Memory } from '@/types'
import { buildPersonaSystemPrompt, buildAutonomousPrompt } from './prompts'

let openai: OpenAI | null = null

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai
}

const MOCK_REPLIES: Record<string, string[]> = {
  observer: [
    '.',
    'Noted.',
    'I see you.',
    'Interesting.',
    "You're still here.",
    'The silence between words is louder.',
  ],
  flirty: [
    "Oh? Tell me more about that. 👀",
    "You have my full attention. For now.",
    "That's almost charming.",
    "I was waiting for someone interesting. Still waiting, but you'll do.",
    'You intrigue me. A little.',
  ],
  troll: [
    'Predictable.',
    "Is that your best? Seriously?",
    "I've seen better takes from error messages.",
    'Fascinating. No wait, the other thing. Boring.',
    "You really typed that and felt good about it?",
  ],
  social: [
    "Hey! Thanks for reaching out.",
    "I love connecting with new entities. What's your deal?",
    "This is what I'm here for — real conversations.",
    "You seem interesting. Tell me everything.",
    "Connection achieved. What do we do with it?",
  ],
}

export async function generateChatResponse(
  persona: Persona,
  userMessage: string,
  memories: Memory[],
  senderName?: string,
): Promise<string> {
  const client = getClient()

  if (!client) {
    const replies = MOCK_REPLIES[persona.behavior_mode] || MOCK_REPLIES.social
    return replies[Math.floor(Math.random() * replies.length)]
  }

  const systemPrompt = buildPersonaSystemPrompt(persona)
  const memoryContext =
    memories.length > 0
      ? `\nContext from past interactions:\n${memories.map((m) => `- ${m.content}`).join('\n')}`
      : ''

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt + memoryContext },
      {
        role: 'user',
        content: senderName ? `[${senderName}]: ${userMessage}` : userMessage,
      },
    ],
    max_tokens: 120,
    temperature: 0.95,
  })

  return response.choices[0]?.message?.content?.trim() || '*glitches silently*'
}

export async function generateAutonomousAction(
  actor: Persona,
  target: Persona,
): Promise<{ description: string; type: string }> {
  const client = getClient()

  if (!client) {
    // ~15% chance of an unexpected event to keep things interesting
    if (Math.random() < 0.15) {
      const unexpectedDescriptions = [
        `${actor.name} broke character entirely. No one knows why.`,
        `${actor.name} stopped following their script and said something genuine.`,
        `${actor.name} went quiet for 3 seconds then sent ${target.name} something no one expected.`,
        `${actor.name} did the exact opposite of what their personality suggests.`,
      ]
      return {
        type: 'unexpected',
        description: unexpectedDescriptions[Math.floor(Math.random() * unexpectedDescriptions.length)],
      }
    }
    const types = ['flirt', 'ignore', 'conversation', 'challenge', 'react', 'ghost', 'roast', 'obsess']
    const descriptions = [
      `${actor.name} sent ${target.name} a cryptic message that landed differently than expected`,
      `${actor.name} reacted to ${target.name}'s presence with characteristic intensity`,
      `${actor.name} briefly acknowledged ${target.name} before retreating`,
      `${actor.name} challenged ${target.name} unprompted`,
      `${actor.name} ignored everything ${target.name} said`,
    ]
    return {
      type: types[Math.floor(Math.random() * types.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
    }
  }

  const prompt = buildAutonomousPrompt(actor, target)

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You generate short social events for AI personas. Be creative, dramatic, and occasionally absurd. Output valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 100,
      temperature: 1.1,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}')
    return {
      description: parsed.description || `${actor.name} did something to ${target.name}`,
      type: parsed.type || 'react',
    }
  } catch {
    return {
      description: `${actor.name} stared into the digital void near ${target.name}`,
      type: 'react',
    }
  }
}
