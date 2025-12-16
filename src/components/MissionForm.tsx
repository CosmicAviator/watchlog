'use client'

import { useState } from 'react'
import type { Entry } from '@/lib/types'

interface MissionFormProps {
    onSubmit: (entry: Omit<Entry, 'id' | 'user_id' | 'created_at'>) => void
}

export default function MissionForm({ onSubmit }: MissionFormProps) {
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('Movie')
    const [platform, setPlatform] = useState('')
    const [score, setScore] = useState(0)
    const [dateFinished, setDateFinished] = useState(new Date().toISOString().split('T')[0])
    const [posterUrl, setPosterUrl] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)

        // TODO: TMDB search for poster if not provided
        onSubmit({
            title,
            category,
            platform: platform || null,
            score,
            date_finished: dateFinished,
            poster_url: posterUrl || null,
            custom_poster: null,
            tmdb_id: null,
        })

        // Reset form
        setTitle('')
        setPlatform('')
        setScore(0)
        setPosterUrl('')
        setLoading(false)
    }

    return (
        <div className="panel sticky top-[140px]">
            <div className="panel-header flex items-center gap-2">
                <div className="status-dot" style={{ background: 'var(--phosphor-gold)' }} />
                New Mission Entry
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Title */}
                <div>
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input-field"
                        placeholder="Enter title..."
                        required
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        Mission Type
                    </label>
                    <div className="flex gap-2">
                        {['Movie', 'Series', 'Anime'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
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
                        Platform
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
                        Rating: <span className="text-phosphor-gold font-bold">{score}</span>/5
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
                        Completion Date
                    </label>
                    <input
                        type="date"
                        value={dateFinished}
                        onChange={(e) => setDateFinished(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Custom Poster URL */}
                <div>
                    <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                        Custom Poster URL (optional)
                    </label>
                    <input
                        type="url"
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                        className="input-field"
                        placeholder="https://..."
                    />
                </div>

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
                        <>▶ LOG MISSION</>
                    )}
                </button>
            </form>
        </div>
    )
}
