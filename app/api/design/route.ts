import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { getCoordinates, loadSkill } from '@/utils/utils'
import { Stop, Tour } from '@/utils/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const researchResult = await req.json()

  const skill = await loadSkill('tour-designer')

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    system: skill,
    prompt: `Design a walking tour from these research results:\n\n${JSON.stringify(researchResult, null, 2)}`,
  })

  let tour: Tour
  try {
    const json = text.match(/```json\n?([\s\S]*?)\n?```/)?.[1] ?? text
    tour = JSON.parse(json.trim())
  } catch {
    return NextResponse.json({ error: 'Failed to parse tour', raw: text }, { status: 500 })
  }

  const geocoded: Stop[] = []
  for (const stop of tour.stops) {
    const coords = await getCoordinates(stop.address, tour.city)
    geocoded.push({ ...stop, lat: coords?.lat, lng: coords?.lng })
    await new Promise(r => setTimeout(r, 1100))
  }

  return NextResponse.json({ ...tour, stops: geocoded })
}