import { Annotation, messagesStateReducer } from '@langchain/langgraph'
import { BaseMessage } from '@langchain/core/messages'
import { Tour } from '@/utils/types'

/**
 * State for our tour planning agent.
 * 
 * Uses a message-based pattern where:
 * - Messages track the conversation between agent and tools
 * - City and preferences are the initial inputs
 * - Tour is the final output
 */
export const TourState = Annotation.Root({
  // Conversation history (agent decisions + tool results)
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),

  // Input: the city to plan a tour for
  city: Annotation<string>,

  // Input: optional user preferences
  preferences: Annotation<string | undefined>,

  // Output: the final designed tour (set when complete)
  tour: Annotation<Tour | undefined>,

  // Tracks if we're waiting for user input
  waitingForUser: Annotation<boolean>({
    default: () => false,
    reducer: (_, update) => update,
  }),
})

export type TourStateType = typeof TourState.State
