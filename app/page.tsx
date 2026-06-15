'use client'

import { useState } from 'react'
import { ResearchResult, Tour } from '@/utils/types'
import ResearchResults from '@/components/ResearchResults'
import TourDisplay from '@/components/TourDisplay'

export default function Home() {
  const [city, setCity] = useState('')
  const [researchLoading, setResearchLoading] = useState(false)
  const [research, setResearch] = useState<ResearchResult | null>(null)
  const [researchError, setResearchError] = useState('')
  const [tourLoading, setTourLoading] = useState(false)
  const [tour, setTour] = useState<Tour | null>(null)
  const [tourError, setTourError] = useState('')
  const [activeTab, setActiveTab] = useState<'input' | 'research' | 'tour'>('input')

  const handleResearch = async () => {
    if (!city.trim()) {
      setResearchError('Please enter a city name')
      return
    }

    setResearchLoading(true)
    setResearchError('')
    setResearch(null)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim() }),
      })

      if (!res.ok) {
        throw new Error(`Research failed: ${res.statusText}`)
      }

      const data = await res.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setResearch(data)
      setActiveTab('research')
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setResearchLoading(false)
    }
  }

  const handleDesignTour = async () => {
    if (!research) return

    setTourLoading(true)
    setTourError('')
    setTour(null)

    try {
      const res = await fetch('/api/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(research),
      })

      if (!res.ok) {
        throw new Error(`Design failed: ${res.statusText}`)
      }

      const data = await res.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setTour(data)
      setActiveTab('tour')
    } catch (err) {
      setTourError(err instanceof Error ? err.message : 'Design failed')
    } finally {
      setTourLoading(false)
    }
  }

  const handleReset = () => {
    setCity('')
    setResearch(null)
    setTour(null)
    setResearchError('')
    setTourError('')
    setActiveTab('input')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Self Guided Tours</h1>
          <p className="text-gray-600">Self guided walking tours for small towns where you don't have to worry about missing the best parts ;)</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'input'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ready for a tour?
          </button>
          {research && (
            <button
              onClick={() => setActiveTab('research')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'research'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Research ({research.candidates?.length || 0})
            </button>
          )}
          {tour && (
            <button
              onClick={() => setActiveTab('tour')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'tour'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tour
            </button>
          )}
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Name
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                placeholder="Marsala / La Gi?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {researchError && <p className="text-red-600 text-sm mt-2">{researchError}</p>}

              <button
                onClick={handleResearch}
                disabled={researchLoading}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
              >
                {researchLoading ? 'Researching...' : 'Research City'}
              </button>
            </div>
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && research && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{research.city}</h2>
                <p className="text-gray-600">{research.candidates?.length || 0} candidate locations found</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleDesignTour}
                  disabled={tourLoading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {tourLoading ? 'Designing...' : 'Design Tour'}
                </button>
              </div>
            </div>

            <ResearchResults candidates={research.candidates || []} />
          </div>
        )}

        {/* Tour Tab */}
        {activeTab === 'tour' && tour && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{tour.title}</h2>
                <p className="text-gray-600 mb-4">{tour.description}</p>
                <p className="text-sm text-gray-500">{tour.stops?.length || 0} stops</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Reset
              </button>
            </div>

            <TourDisplay tour={tour} />
          </div>
        )}

        {/* Error States */}
        {tourError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{tourError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
