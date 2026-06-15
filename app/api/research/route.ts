import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { loadSkill } from '@/utils/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { city } = await req.json()
  if (!city) return NextResponse.json({ error: 'city is required' }, { status: 400 })

  const skill = await loadSkill('researcher')

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    system: skill,
    prompt: `Research walking tour stops for ${city}. Use your knowledge to find interesting places. Return the results as JSON.`,
  })

  try {
    const json = text.match(/```json\n?([\s\S]*?)\n?```/)?.[1] ?? text
    const parsed = JSON.parse(json.trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Failed to parse research results', raw: text }, { status: 500 })
  }
}