'use client'

import { useState } from 'react'
import type { Entry } from '@/lib/types'

interface EditModalProps {
    entry: Entry
    onSave: (updates: Partial<Entry>) => void
    onClose: () => void
}

export default function EditModal({ entry, onSave, onClose }: EditModalProps) {
    const [title, setTitle] = useState(entry.title)
    const [category, setCategory] = useState(entry.category)
    const [platform, setPlatform] = useState(entry.platform || '')
    const [score, setScore] = useState(entry.score || 0)
    const [dateFinished, setDateFinished] = useState(entry.date_finished?.split('T')[0] || '')
    const [customPoster, setCustomPoster] = useState(entry.custom_poster || '')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        onSave({
            title,
            category,
            platform: platform || null,
            score,
            date_finished: dateFinished || null,
            custom_poster: customPoster || null,
        })

        setLoading(false)
    }

    return (
        <div
            className="fixed inset-0 bg-void-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={onClose}
        >
            <div
                className="panel w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="panel-header flex items-center justify-between">
                    <span>Edit Mission</span>
                    <button onClick={onClose} className="text-telemetry-gray hover:text-data-white">
                        ✕
                    </button>
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
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input-field"
                        >
                            <option value="Movie">Movie</option>
                            <option value="Series">Series</option>
                            <option value="Anime">Anime</option>
                        </select>
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
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                            Date Finished
                        </label>
                        <input
                            type="date"
                            value={dateFinished}
                            onChange={(e) => setDateFinished(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* Custom Poster */}
                    <div>
                        <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                            Custom Poster URL
                        </label>
                        <input
                            type="url"
                            value={customPoster}
                            onChange={(e) => setCustomPoster(e.target.value)}
                            className="input-field"
                            placeholder="https://... (overrides TMDB poster)"
                        />
                        {(customPoster || entry.poster_url) && (
                            <div className="mt-2 flex gap-2 items-end">
                                <div className="w-12 h-18 bg-grid-line rounded overflow-hidden">
                                    <img
                                        src={customPoster || entry.poster_url || ''}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-[10px] text-telemetry-gray font-mono">
                                    {customPoster ? 'Custom poster' : 'TMDB poster'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
