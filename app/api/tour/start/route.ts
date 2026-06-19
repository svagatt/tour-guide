import { NextRequest, NextResponse } from 'next/server'
import { getTourGraph } from '@/lib/langgraph/graph'

/**
 * POST /api/tour/start
 * 
 * Start a new tour planning session.
 * The agent will research, ask questions, and design - guided by skills.
 * 
 * Request: { city: string, preferences?: string }
 * Response: { threadId: string, state: object, interrupt?: object }
 */
export async function POST(req: NextRequest) {
  try {
    const { city, preferences } = await req.json()

    if (!city) {
      return NextResponse.json({ error: 'city is required' }, { status: 400 })
    }

    const threadId = crypto.randomUUID()
    const config = { configurable: { thread_id: threadId } }

    // Run the graph - it will pause when ask_question is called
    const result = await getTourGraph().invoke(
      { city, preferences },
      config
    )

    // Check if we're waiting for user input (interrupted)
    const snapshot = await getTourGraph().getState(config)
    const isInterrupted = snapshot.tasks?.some(t => t.interrupts?.length > 0)
    
    // Extract interrupt data if present
    let interruptData = null
    if (isInterrupted) {
      const task = snapshot.tasks?.find(t => t.interrupts?.length > 0)
      interruptData = task?.interrupts?.[0]?.value
    }

    // Log state details for debugging
    console.log('Start - state city:', result.city)
    console.log('Start - state messages count:', result.messages?.length || 0)
    console.log('Start - threadId:', threadId)

    const apiResponse = {
      threadId,
      state: {
        city: result.city,
        tour: result.tour,
        waitingForUser: isInterrupted,
      },
      interrupt: interruptData,
    }
    console.log('Start response:', JSON.stringify(apiResponse, null, 2))
    return NextResponse.json(apiResponse)
  } catch (error) {
    console.error('Tour start error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start tour' },
      { status: 500 }
    )
  }
}
