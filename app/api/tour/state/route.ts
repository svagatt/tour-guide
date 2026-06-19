import { NextRequest, NextResponse } from 'next/server'
import { getTourGraph } from '@/lib/langgraph/graph'

/**
 * GET /api/tour/state?threadId=xxx
 * 
 * Get the current state of a tour planning session.
 */
export async function GET(req: NextRequest) {
  try {
    const threadId = req.nextUrl.searchParams.get('threadId')

    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
    }

    const config = { configurable: { thread_id: threadId } }
    const snapshot = await getTourGraph().getState(config)

    if (!snapshot || !snapshot.values) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const isInterrupted = snapshot.tasks?.some(t => t.interrupts?.length > 0)

    let interruptData = null
    if (isInterrupted) {
      const task = snapshot.tasks?.find(t => t.interrupts?.length > 0)
      interruptData = task?.interrupts?.[0]?.value
    }

    return NextResponse.json({
      state: {
        city: snapshot.values.city,
        tour: snapshot.values.tour,
        waitingForUser: isInterrupted,
      },
      interrupt: interruptData,
    })
  } catch (error) {
    console.error('Tour state error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get state' },
      { status: 500 }
    )
  }
}
