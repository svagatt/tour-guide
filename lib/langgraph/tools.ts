import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { loadSkill, getCoordinates } from '@/utils/utils'
import { interrupt } from '@langchain/langgraph'

/**
 * load_skill tool
 * 
 * Loads skill instructions into context. The agent then follows
 * these instructions using its own capabilities (web search, etc).
 * 
 * This is context injection, not delegation to a sub-agent.
 */
export const loadSkillTool = tool(
  async ({ skillName, task }) => {
    try {
      const skillContent = await loadSkill(skillName)
      return `## Skill: ${skillName}\n\nFollow these instructions to complete the task:\n\n${skillContent}\n\n---\n\nTask: ${task}`
    } catch {
      return `Error: Skill '${skillName}' not found. Check available skills in the system prompt.`
    }
  },
  {
    name: 'load_skill',
    description: 'Load skill instructions into context. After loading, follow the instructions to complete the task using web search and other tools.',
    schema: z.object({
      skillName: z.string().describe('Name of the skill to load (see available skills in system prompt)'),
      task: z.string().describe('What you need to accomplish with this skill'),
    }),
  }
)

/**
 * ask_human tool
 * 
 * Unified tool for human interaction:
 * - type "question": Ask user something and wait for response (triggers interrupt)
 * - type "tour": Submit the final tour with structured data
 */
export const askHumanTool = tool(
  async (input) => {
    if (input.type === 'question') {
      // Parse options from JSON string if provided
      let options: string[] | undefined
      if (input.optionsJson) {
        try {
          options = JSON.parse(input.optionsJson)
        } catch {
          options = undefined
        }
      }
      // Trigger interrupt for user input
      const userResponse = interrupt({
        type: 'question',
        question: input.question,
        options,
        context: input.context,
      })
      return typeof userResponse === 'string' 
        ? userResponse 
        : JSON.stringify(userResponse)
    } else if (input.type === 'tour') {
      // Parse stops from JSON string
      let stops = []
      if (input.stopsJson) {
        try {
          stops = JSON.parse(input.stopsJson)
        } catch {
          return JSON.stringify({ error: 'Invalid stopsJson format' })
        }
      }
      // Return structured tour data
      return JSON.stringify({
        type: 'tour',
        tour: {
          city: input.city,
          title: input.title,
          description: input.tourDescription,
          stops,
        }
      })
    }
    return 'Invalid type'
  },
  {
    name: 'ask_human',
    description: 'Interact with the user. Use type="question" to ask something, type="tour" to submit the final tour.',
    schema: z.object({
      type: z.string().describe('Type of interaction: "question" or "tour"'),
      // Question fields (used when type="question")
      question: z.string().optional().describe('The question to ask (for type=question)'),
      optionsJson: z.string().optional().describe('Optional choices as JSON array of strings (for type=question)'),
      context: z.string().optional().describe('Additional context (for type=question)'),
      // Tour fields (used when type="tour")
      city: z.string().optional().describe('City name (for type=tour)'),
      title: z.string().optional().describe('Tour title (for type=tour)'),
      tourDescription: z.string().optional().describe('Tour description (for type=tour)'),
      stopsJson: z.string().optional().describe('Tour stops as JSON string array. Each stop: {order: number, name: string, address: string, category: "historical"|"food"|"architecture"|"hidden_gem"|"viewpoint"|"cultural", description: string, lat: number, lng: number}'),
    }),
  }
)

/**
 * geocode tool
 * 
 * Converts an address to lat/lng coordinates.
 */
export const geocodeTool = tool(
  async ({ address, city }) => {
    const coords = await getCoordinates(address, city)
    
    if (!coords) {
      return JSON.stringify({ error: 'Could not geocode address', address, city })
    }

    // Rate limit for Nominatim API
    await new Promise(r => setTimeout(r, 1100))

    return JSON.stringify({ address, city, lat: coords.lat, lng: coords.lng })
  },
  {
    name: 'geocode',
    description: 'Convert an address to latitude/longitude coordinates for mapping.',
    schema: z.object({
      address: z.string().describe('The street address to geocode'),
      city: z.string().describe('The city name for context'),
    }),
  }
)

/**
 * All available tools
 */
export const allTools = [loadSkillTool, askHumanTool, geocodeTool]
