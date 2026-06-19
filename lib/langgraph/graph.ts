import { StateGraph, MemorySaver } from '@langchain/langgraph'
import { TourState } from './state'
import { agentNode, toolsNode, shouldContinue, finalizeNode } from './nodes'

/**
 * 
 * Agent Graph:
 * 
 *   START
 *     │
 *     ▼
 *   Agent Node
 *     │
 *     ├─── Tools Node ───▶ ───┐
 *     │                       │
 *     │◀──────────────────────┘
 *     │
 *     └─── Finalize Node ───▶ END
 * 
 */
export function buildTourGraph() {
  const graph = new StateGraph(TourState)
    .addNode('agent', agentNode)
    .addNode('tools', toolsNode)
    .addNode('finalize', finalizeNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue, {
      tools: 'tools',
      end: 'finalize',
    })
    .addEdge('tools', 'agent')
    .addEdge('finalize', '__end__')

  // Compile with checkpointer for session persistence
  const memory = new MemorySaver()
  return graph.compile({ checkpointer: memory })
}

// Store in globalThis to survive Next.js hot reloads in development
const globalForGraph = globalThis as unknown as {
  tourGraph: ReturnType<typeof buildTourGraph> | undefined
}

export function getTourGraph() {
  if (!globalForGraph.tourGraph) {
    console.log('Creating new tour graph instance')
    globalForGraph.tourGraph = buildTourGraph()
  }
  return globalForGraph.tourGraph
}
