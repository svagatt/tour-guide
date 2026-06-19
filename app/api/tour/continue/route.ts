import { NextRequest, NextResponse } from 'next/server'
import { getTourGraph } from '@/lib/langgraph/graph'
import { Command } from '@langchain/langgraph'
import { HumanMessage } from '@langchain/core/messages'

/**
 * POST /api/tour/continue
 * 
 * Continue a tour planning session with user input.
 * Called after the agent asks a question via ask_question tool.
 * 
 * Request: { threadId: string, response: string }
 * Response: { state: object, interrupt?: object }
 */
export async function POST(req: NextRequest) {
  try {
    const { threadId, response } = await req.json()

    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
    }

    if (response === undefined) {
      return NextResponse.json({ error: 'response is required' }, { status: 400 })
    }

    const config = { configurable: { thread_id: threadId } }

    // Resume the graph with the user's response
    console.log('Continue - threadId:', threadId)
    console.log('Continue - response:', response)
    await getTourGraph().invoke(
      new Command({ resume: response }),
      config
    )

    // Get state after resume to check what happened
    let snapshot = await getTourGraph().getState(config)
    const stateAfterResume = snapshot.values || {}
    console.log('After resume - city:', stateAfterResume.city)
    console.log('After resume - messages count:', stateAfterResume.messages?.length || 0)
    console.log('After resume - has tour:', !!stateAfterResume.tour)
    console.log('After resume - snapshot.next:', snapshot.next)

    if (!!stateAfterResume.tour && (!snapshot.next || snapshot.next.length === 0)) {
      console.log('No tour found, re-invoking to continue flow...')
      
      // Add user's response as a human message and invoke again
  
      await getTourGraph().updateState(config, {
        messages: [new HumanMessage(response)]
      })
      
      await getTourGraph().invoke(null, config)
      snapshot = await getTourGraph().getState(config)
      console.log('After re-invoke - has tour:', !!snapshot.values?.tour)
    }

    // Get final state
    const finalState = snapshot.values || {}
    
    // Check if we're waiting for more user input
    const isInterrupted = snapshot.tasks?.some(t => t.interrupts?.length > 0)

    let interruptData = null
    if (isInterrupted) {
      const task = snapshot.tasks?.find(t => t.interrupts?.length > 0)
      interruptData = task?.interrupts?.[0]?.value
    }

    const apiResponse = {
      state: {
        city: finalState.city,
        tour: finalState.tour,
        waitingForUser: isInterrupted,
      },
      interrupt: interruptData,
    }
    console.log('Continue response:', JSON.stringify(apiResponse, null, 2))
    return NextResponse.json(apiResponse)
  } catch (error) {
    console.error('Tour continue error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to continue tour' },
      { status: 500 }
    )
  }
}
