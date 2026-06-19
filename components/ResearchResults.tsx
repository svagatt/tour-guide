import { Candidate } from '@/utils/types'

interface ResearchResultsProps {
  readonly candidates: Candidate[]
  readonly removedNames: string[]
  readonly onToggleCandidate: (name: string) => void
}

export default function ResearchResults({ 
  candidates, 
  removedNames, 
  onToggleCandidate 
}: ResearchResultsProps) {
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
      {candidates.map((candidate) => {
        const isRemoved = removedNames.includes(candidate.name)
        
        return (
          <button
            type="button"
            key={candidate.name}
            className={`rounded-lg p-4 border transition text-left w-full ${
              isRemoved
                ? 'bg-gray-100 border-gray-300 opacity-50'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-md'
            }`}
            onClick={() => onToggleCandidate(candidate.name)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 pr-2">
                <input
                  type="checkbox"
                  checked={!isRemoved}
                  onChange={() => onToggleCandidate(candidate.name)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <h3 className={`font-semibold ${isRemoved ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {candidate.name}
                </h3>
              </div>
              <span className="text-xl flex-shrink-0">
                {categories[(String(candidate.category || '').toLowerCase().replace(' ', '_') as keyof typeof categories)] || '💎'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 ml-6">{candidate.address}</p>
            <p className="text-sm text-gray-700 mb-3 ml-6">{candidate.why_interesting}</p>
            {candidate.sources && candidate.sources.length > 0 && (
              <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 ml-6">
                <p className="font-medium mb-1">Sources:</p>
                <ul className="space-y-1">
                {candidate.sources.slice(0, 2).map((source) => (
                  <li key={source} className="truncate text-blue-600 hover:underline">
                    {source}
                  </li>
                ))}
                </ul>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
