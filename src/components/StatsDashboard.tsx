'use client'

import type { Entry } from '@/lib/types'

interface StatsDashboardProps {
    entries: Entry[]
    show: boolean
    onToggle: () => void
}

export default function StatsDashboard({ entries, show, onToggle }: StatsDashboardProps) {
    if (!entries.length) return null

    // Calculate stats
    const total = entries.length
    const avg = (entries.reduce((s, e) => s + (e.score || 0), 0) / total).toFixed(1)
    const movies = entries.filter(e => e.category === 'Movie').length
    const series = entries.filter(e => e.category === 'Series').length
    const anime = entries.filter(e => e.category === 'Anime').length

    const fiveStars = entries.filter(e => e.score === 5).length
    const fourStars = entries.filter(e => (e.score || 0) >= 4 && (e.score || 0) < 5).length
    const threeStars = entries.filter(e => (e.score || 0) >= 3 && (e.score || 0) < 4).length
    const lowStars = entries.filter(e => (e.score || 0) < 3).length

    const topRated = [...entries].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3)

    // Platform stats
    const platforms: Record<string, number> = {}
    entries.forEach(e => {
        const p = e.platform || 'Unknown'
        platforms[p] = (platforms[p] || 0) + 1
    })
    const topPlatform = Object.entries(platforms).sort((a, b) => b[1] - a[1])[0]

    return (
        <div className="panel">
            <div className="panel-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span>📊</span>
                    Mission Statistics
                </div>
                <button onClick={onToggle} className="text-telemetry-gray hover:text-data-white">
                    {show ? '▼' : '▶'}
                </button>
            </div>

            {show && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {/* Total */}
                    <div className="bg-void-black border border-grid-line rounded-md p-3">
                        <div className="font-mono text-[9px] text-telemetry-gray uppercase mb-1">Total</div>
                        <div className="font-display text-2xl font-bold text-phosphor-gold">{total}</div>
                        <div className="font-mono text-[9px] text-telemetry-gray">missions</div>
                    </div>

                    {/* Average */}
                    <div className="bg-void-black border border-grid-line rounded-md p-3">
                        <div className="font-mono text-[9px] text-telemetry-gray uppercase mb-1">Average</div>
                        <div className="font-display text-2xl font-bold text-phosphor-gold">{avg}</div>
                        <div className="h-1 bg-grid-line rounded mt-2">
                            <div className="h-full bg-phosphor-gold rounded" style={{ width: `${(parseFloat(avg) / 5) * 100}%` }} />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-void-black border border-grid-line rounded-md p-3">
                        <div className="font-mono text-[9px] text-telemetry-gray uppercase mb-1">By Category</div>
                        <div className="flex gap-2 mt-1">
                            <div className="text-center">
                                <div className="text-lg">🎬</div>
                                <div className="font-mono text-[10px] text-telemetry-gray">{movies}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg">📺</div>
                                <div className="font-mono text-[10px] text-telemetry-gray">{series}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg">⛩️</div>
                                <div className="font-mono text-[10px] text-telemetry-gray">{anime}</div>
                            </div>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="bg-void-black border border-grid-line rounded-md p-3">
                        <div className="font-mono text-[9px] text-telemetry-gray uppercase mb-2">Ratings</div>
                        <div className="space-y-1 text-[10px]">
                            <div className="flex items-center gap-1">
                                <span>★5</span>
                                <div className="flex-1 h-1 bg-grid-line rounded">
                                    <div className="h-full bg-phosphor-gold rounded" style={{ width: `${(fiveStars / total) * 100}%` }} />
                                </div>
                                <span className="text-phosphor-gold w-4">{fiveStars}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>★4</span>
                                <div className="flex-1 h-1 bg-grid-line rounded">
                                    <div className="h-full bg-observatory-teal rounded" style={{ width: `${(fourStars / total) * 100}%` }} />
                                </div>
                                <span className="text-observatory-teal w-4">{fourStars}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>★3</span>
                                <div className="flex-1 h-1 bg-grid-line rounded">
                                    <div className="h-full bg-status-green rounded" style={{ width: `${(threeStars / total) * 100}%` }} />
                                </div>
                                <span className="text-status-green w-4">{threeStars}</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Rated */}
                    <div className="bg-void-black border border-grid-line rounded-md p-3">
                        <div className="font-mono text-[9px] text-telemetry-gray uppercase mb-2">Top Rated</div>
                        {topRated.map((e, i) => (
                            <div key={e.id} className="flex items-center gap-1 text-[10px] py-0.5 border-b border-grid-line last:border-0">
                                <span className="font-bold text-phosphor-gold w-4">#{i + 1}</span>
                                <span className="flex-1 truncate">{e.title}</span>
                                <span className="text-phosphor-gold">★{e.score}</span>
                            </div>
                        ))}
                    </div>

                    {/* Top Platform */}
                    <div className="bg-void-black border border-grid-line rounded-md p-3">
                        <div className="font-mono text-[9px] text-telemetry-gray uppercase mb-1">Top Platform</div>
                        <div className="font-display text-sm font-semibold text-phosphor-gold truncate">
                            {topPlatform ? topPlatform[0] : 'N/A'}
                        </div>
                        <div className="font-mono text-[9px] text-telemetry-gray">
                            {topPlatform ? `${topPlatform[1]} missions` : ''}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
