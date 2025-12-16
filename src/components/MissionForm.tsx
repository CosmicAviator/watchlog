'use client'

import { useState } from 'react'
import type { Entry, ThemeContent } from '@/lib/types'

interface MissionFormProps {
    onSubmit: (entry: Omit<Entry, 'id' | 'user_id' | 'created_at'>) => void
    themeContent: ThemeContent
}

interface TMDBResult {
    id: number
    title: string
    year: string
    poster_url: string | null
}

export default function MissionForm({ onSubmit, themeContent }: MissionFormProps) {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('Movie')
    const [platform, setPlatform] = useState('')
    const [score, setScore] = useState(0)
    const [dateFinished, setDateFinished] = useState(new Date().toISOString().split('T')[0])
    const [posterUrl, setPosterUrl] = useState('')
    const [loading, setLoading] = useState(false)
    
    // TMDB state
    const [searchResults, setSearchResults] = useState<TMDBResult[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedTmdbId, setSelectedTmdbId] = useState<number | null>(null)
    const [showResults, setShowResults] = useState(false)

    // Auto-search TMDB when title changes
    async function searchTMDB(query: string) {
        if (!query || query.length < 2) {
            setSearchResults([])
            return
        }

        setSearching(true)
        try {
            const type = category === 'Series' || category === 'Anime' ? 'tv' : 'movie'
            const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=${type}`)
            const data = await response.json()
            
            if (data.results) {
                setSearchResults(data.results)
                setShowResults(true)
            }
        } catch (error) {
            console.error('TMDB search failed:', error)
        }
        setSearching(false)
    }

    function selectResult(result: TMDBResult) {
        setTitle(result.title)
        if (result.poster_url) {
            setPosterUrl(result.poster_url)
        }
        setSelectedTmdbId(result.id)
        setShowResults(false)
        setSearchResults([])
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)

        onSubmit({
            title,
            category,
            platform: platform || null,
            score,
            date_finished: dateFinished,
            poster_url: posterUrl || null,
            custom_poster: null,
            tmdb_id: selectedTmdbId,
        })

        // Reset form
        setTitle('')
        setPlatform('')
        setScore(0)
        setPosterUrl('')
        setSelectedTmdbId(null)
        setSearchResults([])
        setLoading(false)
    }

    return (
        <div className="panel sticky top-[140px]">
            <div className="panel-header flex items-center gap-2">
                <div className="status-dot" style={{ background: 'var(--phosphor-gold)' }} />
                {themeContent.newEntry}
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Title with TMDB search */}
                <div className="relative">
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        Title
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value)
                                searchTMDB(e.target.value)
                            }}
                            onFocus={() => searchResults.length > 0 && setShowResults(true)}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)}
                            className="input-field pr-8"
                            placeholder="Search TMDB..."
                            required
                        />
                        {searching && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <div className="orbital-loader" style={{ width: 16, height: 16 }} />
                            </div>
                        )}
                    </div>
                    
                    {/* TMDB Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-console-dark border border-grid-line rounded-lg overflow-hidden shadow-lg max-h-64 overflow-y-auto">
                            {searchResults.map(result => (
                                <button
                                    key={result.id}
                                    type="button"
                                    onClick={() => selectResult(result)}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-phosphor-gold-dim text-left transition-colors"
                                >
                                    {result.poster_url ? (
                                        <img 
                                            src={result.poster_url} 
                                            alt={result.title}
                                            className="w-10 h-14 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-14 bg-grid-line rounded flex items-center justify-center text-xs text-telemetry-gray">
                                            ?
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-data-white truncate">{result.title}</div>
                                        <div className="text-xs text-telemetry-gray">{result.year}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Show selected poster preview */}
                {posterUrl && (
                    <div className="flex items-center gap-3 p-2 bg-void-black rounded border border-grid-line">
                        <img 
                            src={posterUrl} 
                            alt="Poster preview"
                            className="w-12 h-18 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-status-green font-mono">POSTER FOUND</div>
                            <button 
                                type="button"
                                onClick={() => setPosterUrl('')}
                                className="text-xs text-telemetry-gray hover:text-alert-red"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                {/* Category */}
                <div>
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        {themeContent.categoryLabel}
                    </label>
                    <div className="flex gap-2">
                        {['Movie', 'Series', 'Anime'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                    setCategory(cat)
                                    // Re-search if title exists (might need TV vs movie endpoint)
                                    if (title.length >= 2) searchTMDB(title)
                                }}
                                className={`btn-ghost flex-1 text-xs ${category === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Platform */}
                <div>
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        {themeContent.platformLabel}
                    </label>
                    <input
                        type="text"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="input-field"
                        placeholder="Netflix, Cinema, Disney+..."
                    />
                </div>

                {/* Rating */}
                <div>
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        {themeContent.ratingLabel}: <span className="text-phosphor-gold font-bold">{score}</span>/5
                    </label>
                    <input
                        type="range"
                        value={score}
                        onChange={(e) => setScore(parseFloat(e.target.value))}
                        min="0"
                        max="5"
                        step="0.5"
                        className="w-full accent-phosphor-gold"
                    />
                    <div className="h-1 bg-grid-line rounded mt-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-phosphor-gold to-[#d4b84a] rounded"
                            style={{ width: `${(score / 5) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Date */}
                <div>
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        {themeContent.dateLabel}
                    </label>
                    <input
                        type="date"
                        value={dateFinished}
                        onChange={(e) => setDateFinished(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Custom Poster URL (collapsed by default since TMDB works) */}
                <details className="text-xs">
                    <summary className="font-mono text-telemetry-gray uppercase tracking-wider cursor-pointer hover:text-phosphor-gold">
                        Custom Poster URL (optional)
                    </summary>
                    <input
                        type="url"
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                        className="input-field mt-2"
                        placeholder="https://..."
                    />
                </details>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="orbital-loader" style={{ width: 16, height: 16 }} />
                            Logging...
                        </>
                    ) : (
                        <>
                            <span className="font-sans font-bold text-base">{themeContent.submitIcon}</span>
                            {themeContent.submitText}
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
