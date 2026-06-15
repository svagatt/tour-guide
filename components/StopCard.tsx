import { Stop } from '@/utils/types'

interface StopCardProps {
  stop: Stop
  index: number
}

export default function StopCard({ stop, index }: StopCardProps) {
  const categories = {
    historical: '🏛️',
    food: '🍽️',
    architecture: '🏗️',
    hidden_gem: '💎',
    viewpoint: '🌅',
    cultural: '🎭',
  } as const

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border-2 border-indigo-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
          {stop.order}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900">{stop.name}</h3>
            <span className="text-xl">
              {categories[(stop.category as keyof typeof categories) || 'hidden_gem']}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{stop.address}</p>
          <p className="text-gray-700 text-sm leading-relaxed">{stop.description}</p>
          {(stop.lat !== undefined && stop.lng !== undefined) && (
            <p className="text-xs text-gray-500 mt-2">
              📍 {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
