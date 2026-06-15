'use client'

import dynamic from 'next/dynamic'
import { Tour } from '@/utils/types'
import StopCard from './StopCard'

const TourMap = dynamic(() => import('./TourMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />
})

interface TourDisplayProps {
  tour: Tour
}

export default function TourDisplay({ tour }: TourDisplayProps) {
  const sortedStops = [...(tour.stops || [])].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-8">
      {/* Map */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Route</h3>
        <TourMap stops={sortedStops} city={tour.city} />
      </div>

      {/* Stops List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stops</h3>
        <div className="space-y-4">
          {sortedStops.map((stop, idx) => (
            <StopCard key={idx} stop={stop} index={idx} />
          ))}
        </div>
      </div>

      {/* Tour Stats */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{sortedStops.length}</p>
          <p className="text-sm text-gray-600">Stops</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{tour.city}</p>
          <p className="text-sm text-gray-600">City</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">📍</p>
          <p className="text-sm text-gray-600">Mapped</p>
        </div>
      </div>
    </div>
  )
}
