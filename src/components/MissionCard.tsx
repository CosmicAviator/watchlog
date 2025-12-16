'use client'

import type { Entry } from '@/lib/types'

interface MissionCardProps {
    entry: Entry
    onClick: () => void
    onDelete: () => void
}

export default function MissionCard({ entry, onClick, onDelete }: MissionCardProps) {
    const categoryIcons: Record<string, string> = {
        'Movie': '🎬',
        'Series': '📺',
        'Anime': '⛩️',
    }

    const posterUrl = entry.custom_poster || entry.poster_url

    return (
        <div className="mission-card group" onClick={onClick}>
            {/* Poster */}
            <div className="aspect-[2/3] bg-gradient-to-br from-grid-line to-console-dark relative overflow-hidden">
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                        {categoryIcons[entry.category] || '📽️'}
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-void-black/90 px-2 py-1 rounded border border-phosphor-gold/30 group-hover:hidden">
                    <span className="font-display text-sm font-bold text-phosphor-gold">
                        {entry.score || 0}
                    </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-void-black/90 px-2 py-1 rounded font-mono text-[9px] uppercase">
                    {categoryIcons[entry.category]} {entry.category}
                </div>

                {/* Delete Button (on hover) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Remove this mission?')) onDelete()
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-alert-red/90 rounded-full text-white text-xs hidden group-hover:flex items-center justify-center hover:bg-alert-red"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="font-display text-sm font-semibold line-clamp-2 mb-2">
                    {entry.title}
                </h3>
                <div className="flex justify-between font-mono text-[10px] text-telemetry-gray">
                    <span>{entry.platform || 'Unknown'}</span>
                    <span className="text-observatory-teal">
                        {entry.date_finished?.split('T')[0] || 'N/A'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-grid-line font-mono text-[9px] text-status-green uppercase">
                    <div className="status-dot" style={{ width: 4, height: 4 }} />
                    Complete
                </div>
            </div>
        </div>
    )
}
