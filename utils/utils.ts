import { Coordinates } from "./types"
import { readFile } from 'fs/promises'
import path from 'path'

export async function loadSkill(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'skills', `${name}`, 'SKILL.md')
  return readFile(filePath, 'utf-8')
}

export async function getCoordinates(address: string, city: string): Promise<Coordinates | null> {
  
  const query = encodeURIComponent(`${address}, ${city}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}