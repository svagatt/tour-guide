import { Candidate } from '@/utils/types'

interface ResearchResultsProps {
  candidates: Candidate[]
}

export default function ResearchResults({ candidates }: ResearchResultsProps) {
  const categories = {
    historical: '🏛️',
    food: '🍽️',
    architecture: '🏗️',
    hidden_gem: '💎',
    viewpoint: '🌅',
    cultural: '🎭',
  } as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((candidate, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 flex-1 pr-2">{candidate.name}</h3>
            <span className="text-xl flex-shrink-0">
              {categories[(candidate.category as keyof typeof categories) || 'hidden_gem']}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{candidate.address}</p>
          <p className="text-sm text-gray-700 mb-3">{candidate.why_interesting}</p>
          {candidate.sources && candidate.sources.length > 0 && (
            <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
              <p className="font-medium mb-1">Sources:</p>
              <ul className="space-y-1">
                {candidate.sources.slice(0, 2).map((source, i) => (
                  <li key={i} className="truncate text-blue-600 hover:underline">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
