'use client'

import { useState } from 'react'
import { Tour } from '@/utils/types'
import TourDisplay from '@/components/TourDisplay'

/**
 * Interrupt data from the agent's ask_question tool
 */
interface InterruptData {
  type: 'question'
  question: string
  options?: string[]
  context?: string
}

export default function Home() {
  // Input state
  const [city, setCity] = useState('')

  // Session state
  const [threadId, setThreadId] = useState<string | null>(null)
  const [tour, setTour] = useState<Tour | null>(null)
  const [interrupt, setInterrupt] = useState<InterruptData | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userResponse, setUserResponse] = useState('')

  /**
   * Start a new tour planning session
   */
  const handleStart = async () => {
    if (!city.trim()) {
      setError('Please enter a city name')
      return
    }

    setLoading(true)
    setError('')
    setTour(null)
    setInterrupt(null)

    try {
      const res = await fetch('/api/tour/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim() }),
      })

      const data = await res.json()
      console.log('Start response:', data)
      if (!res.ok) throw new Error(data.error || 'Failed to start')

      setThreadId(data.threadId)
      setTour(data.state?.tour || null)
      setInterrupt(data.interrupt || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send response to the agent's question
   */
  const handleRespond = async (response?: string) => {
    if (!threadId) return

    const responseText = response || userResponse.trim()
    if (!responseText) {
      setError('Please enter a response')
      return
    }

    setLoading(true)
    setError('')
    setUserResponse('')

    try {
      const res = await fetch('/api/tour/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, response: responseText }),
      })

      const data = await res.json()
      console.log('Continue response:', data)
      if (!res.ok) throw new Error(data.error || 'Failed to continue')

      setTour(data.state?.tour || null)
      setInterrupt(data.interrupt || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset and start over
   */
  const handleReset = () => {
    setCity('')
    setThreadId(null)
    setTour(null)
    setInterrupt(null)
    setUserResponse('')
    setError('')
  }

  // Determine what to show
  const showInput = !threadId
  const showQuestion = threadId && interrupt && !tour
  const showTour = tour

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Self Guided Tours</h1>
          <p className="text-gray-600">
            An AI agent plans your perfect walking tour
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Initial Input */}
        {showInput && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="max-w-md">
              <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-2">
                City Name
              </label>
              <input
                id="city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="Marsala, Sicily"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />

              <button
                onClick={handleStart}
                disabled={loading}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
              >
                {loading ? 'Agent is working...' : 'Plan My Tour'}
              </button>
            </div>
          </div>
        )}

        {/* Agent Question */}
        {showQuestion && interrupt && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Agent Question</h2>
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700"
              >
                Start Over
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-800 text-lg mb-4">{interrupt.question}</p>

              {/* Show context if provided (e.g., list of candidates) */}
              {interrupt.context && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {interrupt.context}
                  </pre>
                </div>
              )}

              {/* Quick options if provided */}
              {interrupt.options && interrupt.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {interrupt.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRespond(option)}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Free-form response */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRespond()}
                  placeholder="Type your response..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleRespond()}
                  disabled={loading || !userResponse.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {loading ? 'Working...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state OR waiting state (no question/tour yet) */}
        {threadId && !interrupt && !tour && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {loading ? (
              <div className="animate-pulse">
                <p className="text-gray-600 text-lg">Agent is working...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-lg">Agent finished but no response received.</p>
                <p className="text-gray-400 text-sm mt-2">This might be a bug - check the console.</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}

        {/* Final Tour */}
        {showTour && tour && (
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
                Plan Another Tour
              </button>
            </div>

            <TourDisplay tour={tour} />
          </div>
        )}
      </div>
    </div>
  )
}
