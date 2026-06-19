import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { TourStateType } from './state'
import { allTools } from './tools'
import { getSkillsMetadata, SkillMetadata } from '@/utils/utils'

let _agentLLM: ChatAnthropic | null = null
function getAgentLLM(): ChatAnthropic {
  if (!_agentLLM) {
    _agentLLM = new ChatAnthropic({ model: 'claude-sonnet-4-5' })
  }
  return _agentLLM
}

/**
 * Build system prompt with skill metadata (progressive disclosure)
 * 
 * The agent sees skill names and descriptions upfront.
 * It loads full instructions on-demand using load_skill.
 */
function buildSystemPrompt(skills: SkillMetadata[]): string {
  const skillList = skills.map(s => `- ${s.name}: ${s.description}`).join('\n')
  
  return `You are a tour planning assistant. Help users plan walking tours of cities.

## Available Skills
These are specialized instruction sets you can load when needed:
${skillList}

Use load_skill to get full instructions for a skill when you need them.

## Tools
- load_skill: Load skill instructions into context
- ask_human: Interact with user (type="question" to ask, type="tour" to submit final tour)
- geocode: Convert addresses to map coordinates

## Guidelines
- Load skills when you need their expertise
- Use ask_human type="question" to get user confirmation
- Geocode all addresses before submitting the tour
- Use ask_human type="tour" to deliver the final tour with all coordinates`
}

// Cache skill metadata to avoid re-reading on every call
let _skillsMetadata: SkillMetadata[] | null = null
async function getSkillsMetadataCached(): Promise<SkillMetadata[]> {
  if (!_skillsMetadata) {
    _skillsMetadata = await getSkillsMetadata()
  }
  return _skillsMetadata
}

/**
 * Agent Node
 * 
 * The agent looks at the current state and decides what to do next.
 * It either calls a tool or finishes with a response.
 */
export async function agentNode(state: TourStateType) {
  const llm = getAgentLLM().bindTools(allTools)

  // Build system prompt with available skills
  const skills = await getSkillsMetadataCached()
  const systemPrompt = buildSystemPrompt(skills)

  // Build messages for the agent
  const messages = [
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]

  // If this is the first message, add the user's request
  if (state.messages.length === 0) {
    const userRequest = state.preferences
      ? `Plan a walking tour of ${state.city}. Preferences: ${state.preferences}`
      : `Plan a walking tour of ${state.city}.`
    
    messages.push(new HumanMessage(userRequest))
  }

  const response = await llm.invoke(messages)

  // Log what the agent decided to do
  const hasToolCalls = 'tool_calls' in response && Array.isArray(response.tool_calls) && response.tool_calls.length > 0
  console.log('Agent response:', {
    hasToolCalls,
    toolCalls: hasToolCalls ? response.tool_calls?.map((t: { name: string }) => t.name) : [],
    contentPreview: typeof response.content === 'string' ? response.content.slice(0, 200) : 'non-string content'
  })

  return { messages: [response] }
}

/**
 * Tools Node
 * 
 * Executes whatever tool the agent decided to call.
 * Uses LangGraph's built-in ToolNode for clean execution.
 */
export const toolsNode = new ToolNode(allTools)

/**
 * Router function
 * 
 * Decides what happens after the agent runs:
 * - If agent called a tool → go to tools node
 * - If agent is done (no tool calls) → end
 */
export function shouldContinue(state: TourStateType): 'tools' | 'end' {
  const lastMessage = state.messages[state.messages.length - 1]

  // Check if the agent wants to call a tool
  if (
    lastMessage &&
    'tool_calls' in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return 'tools'
  }

  return 'end'
}

/**
 * Extract the final tour from the conversation
 * 
 * Looks for ask_human tool result with type="tour".
 */
export function finalizeNode(state: TourStateType) {
  // Search backwards for ask_human tool result with tour data
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const msg = state.messages[i]
    
    // Check if it's a tool message from ask_human
    if ('name' in msg && msg.name === 'ask_human') {
      const content = typeof msg.content === 'string' ? msg.content : ''
      try {
        const result = JSON.parse(content)
        if (result.type === 'tour' && result.tour) {
          return { tour: result.tour }
        }
      } catch {
        // Not valid JSON
      }
    }
  }
  return {}
}
