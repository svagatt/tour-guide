import { Coordinates } from "./types"
import { readFile, readdir } from 'fs/promises'
import path from 'path'

export interface SkillMetadata {
  name: string
  description: string
}

/**
 * Parse YAML frontmatter from skill content
 */
function parseFrontmatter(content: string): { name?: string; description?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  
  const yaml = match[1]
  const result: Record<string, string> = {}
  
  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim()
      result[key] = value
    }
  }
  
  return result
}

/**
 * Get metadata for all available skills (name + description only)
 * This is what the agent sees upfront for progressive disclosure.
 */
export async function getSkillsMetadata(): Promise<SkillMetadata[]> {
  const skillsDir = path.join(process.cwd(), 'skills')
  const dirs = await readdir(skillsDir, { withFileTypes: true })
  
  const skills: SkillMetadata[] = []
  
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue
    
    try {
      const content = await readFile(path.join(skillsDir, dir.name, 'SKILL.md'), 'utf-8')
      const meta = parseFrontmatter(content)
      
      if (meta.name && meta.description) {
        skills.push({ name: meta.name, description: meta.description })
      }
    } catch {
      // Skip if no SKILL.md
    }
  }
  
  return skills
}

/**
 * Load full skill instructions (for when agent decides to use a skill)
 */
export async function loadSkill(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'skills', `${name}`, 'SKILL.md')
  return readFile(filePath, 'utf-8')
}

export async function getCoordinates(address: string, city: string): Promise<Coordinates | null> {
  const query = encodeURIComponent(`${address}, ${city}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TourGuideApp/1.0 (contact@example.com)',
      },
    })
    const data = await res.json()
    if (!data.length) return null
    return { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) }
  } catch {
    return null
  }
}