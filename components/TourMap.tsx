'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Stop } from '@/utils/types'
import 'leaflet/dist/leaflet.css'

interface TourMapProps {
  stops: Stop[]
  city: string
}

export default function TourMap({ stops, city }: TourMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !stops.length) return

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([0, 0], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Add markers for each stop
    const markers = stops
      .filter((s) => s.lat !== undefined && s.lng !== undefined)
      .map((stop) => {
        const marker = L.marker([stop.lat!, stop.lng!])
          .bindPopup(
            `<div class="font-semibold">${stop.order}. ${stop.name}</div><div class="text-sm text-gray-600">${stop.address}</div>`
          )
          .addTo(map)
        return marker
      })

    // Fit map bounds to all markers
    if (markers.length > 0) {
      const group = new L.FeatureGroup(markers)
      map.fitBounds(group.getBounds(), { padding: [50, 50] })
    }

    // Draw polyline connecting stops in order
    const latlngs = stops
      .filter((s) => s.lat !== undefined && s.lng !== undefined)
      .sort((a, b) => a.order - b.order)
      .map((s) => [s.lat!, s.lng!] as [number, number])

    if (latlngs.length > 1) {
      L.polyline(latlngs, {
        color: '#4f46e5',
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 5',
      }).addTo(map)
    }
  }, [stops])

  return (
    <div
      ref={containerRef}
      className="w-full h-96 rounded-lg border border-gray-300 shadow-md"
      style={{ background: '#e5e7eb' }}
    />
  )
}
