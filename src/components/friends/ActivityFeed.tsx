'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Entry, Profile } from '@/lib/types'

interface ActivityFeedProps {
    currentUser: any
}

interface FeedItem extends Entry {
    profile: Profile
}

export default function ActivityFeed({ currentUser }: ActivityFeedProps) {
    const [feed, setFeed] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadFeed()
    }, [currentUser])

    async function loadFeed() {
        if (!currentUser) return

        try {
            // 1. Get Friend IDs
            const { data: friends } = await supabase
                .from('friends')
                .select('*')
                .eq('status', 'accepted')
                .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)

            if (!friends || friends.length === 0) {
                setFeed([])
                setLoading(false)
                return
            }

            const friendIds = friends.map(f => 
                f.user_id === currentUser.id ? f.friend_id : f.user_id
            )

            // 2. Get Entries from Friends (Last 50)
            const { data: entries } = await supabase
                .from('entries')
                .select('*')
                .in('user_id', friendIds)
                .order('date_finished', { ascending: false }) // Most recent watch date
                .limit(50)

            if (!entries || entries.length === 0) {
                setFeed([])
                setLoading(false)
                return
            }

            // 3. Get Profiles for these entries
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', friendIds)

            // 4. Combine
            const feedItems = entries.map(entry => ({
                ...entry,
                profile: profiles?.find(p => p.id === entry.user_id) || {} as Profile
            }))

            setFeed(feedItems)

        } catch (error) {
            console.error('Feed error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="orbital-loader mx-auto" />

    if (feed.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-grid-line rounded-lg">
                <div className="text-4xl mb-3">📡</div>
                <div className="font-mono text-xs text-telemetry-gray uppercase tracking-widest mb-2">
                    No Signal Detected
                </div>
                <p className="text-sm text-telemetry-gray">
                    Your squadron hasn't logged any missions yet.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {feed.map(item => (
                <div key={item.id} className="panel p-4 flex gap-4 transition-colors hover:border-phosphor-gold/50">
                    {/* Poster */}
                    <div className="flex-shrink-0 w-16">
                        {item.poster_url ? (
                            <img src={item.poster_url} className="w-full rounded shadow-lg aspect-[2/3] object-cover" />
                        ) : (
                            <div className="w-full aspect-[2/3] bg-grid-line rounded flex items-center justify-center text-xs">?</div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-phosphor-gold text-sm">
                                {item.profile.display_name || item.profile.username || 'Unknown Pilot'}
                            </span>
                            <span className="text-xs text-telemetry-gray">
                                observed
                            </span>
                        </div>
                        
                        <h3 className="font-display font-bold text-lg text-data-white truncate">
                            {item.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs font-mono text-telemetry-gray">
                            <span className="flex items-center gap-1">
                                <span className={item.score && item.score >= 4 ? "text-status-green" : "text-phosphor-gold"}>
                                    {'★'.repeat(Math.round(item.score || 0))}
                                </span>
                                {item.score}/5
                            </span>
                            <span>{item.date_finished}</span>
                            {item.platform && (
                                <span className="px-1.5 py-0.5 bg-void-black border border-grid-line rounded">
                                    {item.platform}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
