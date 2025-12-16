'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Profile, Entry } from '@/lib/types'

export default function FriendProfilePage() {
    const params = useParams()
    const userId = params.userId as string
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [friend, setFriend] = useState<Profile | null>(null)
    const [entries, setEntries] = useState<Entry[]>([])
    const [loading, setLoading] = useState(true)
    const [isFriend, setIsFriend] = useState(false)
    const [filter, setFilter] = useState('all')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAuthAndLoad()
    }, [userId])

    async function checkAuthAndLoad() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/auth/login')
            return
        }
        setCurrentUser(user)

        // Check if they are friends
        const { data: friendship } = await supabase
            .from('friends')
            .select('id')
            .eq('status', 'accepted')
            .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
            .single()

        if (!friendship) {
            // Not friends, redirect
            router.push('/friends')
            return
        }

        setIsFriend(true)
        await loadFriendData()
    }

    async function loadFriendData() {
        setLoading(true)

        try {
            // Load friend's profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (profile) {
                setFriend(profile)
            }

            // Load friend's entries
            const { data: friendEntries } = await supabase
                .from('entries')
                .select('*')
                .eq('user_id', userId)
                .order('date_finished', { ascending: false })

            if (friendEntries) {
                setEntries(friendEntries)
            }
        } catch (err) {
            console.error('Error loading friend data:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredEntries = entries.filter(entry => {
        if (filter === 'all') return true
        return entry.category.toLowerCase() === filter
    })

    const stats = {
        total: entries.length,
        movies: entries.filter(e => e.category === 'Movie').length,
        series: entries.filter(e => e.category === 'Series').length,
        anime: entries.filter(e => e.category === 'Anime').length,
        avgRating: entries.length > 0
            ? (entries.reduce((sum, e) => sum + (e.score || 0), 0) / entries.filter(e => e.score).length).toFixed(1)
            : '0'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="orbital-loader" />
            </div>
        )
    }

    if (!friend || !isFriend) {
        return null
    }

    const displayName = friend.display_name || friend.username || 'Unknown User'

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <header className="mb-8">
                <Link href="/friends" className="text-telemetry-gray hover:text-data-white mb-4 inline-block">
                    ← Back to Friends
                </Link>

                <div className="flex items-center gap-4 mt-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-phosphor-gold/20 flex items-center justify-center text-phosphor-gold font-bold text-2xl">
                        {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold font-display">{displayName}'s Collection</h1>
                        {friend.username && (
                            <p className="font-mono text-[10px] text-telemetry-gray uppercase tracking-[0.2em]">
                                @{friend.username}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="panel mb-6">
                <div className="panel-header">Friend's Statistics</div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="stat-box">
                        <div className="stat-label">Total</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Movies</div>
                        <div className="stat-value">{stats.movies}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Series</div>
                        <div className="stat-value">{stats.series}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Anime</div>
                        <div className="stat-value">{stats.anime}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Avg Rating</div>
                        <div className="stat-value-gold">{stats.avgRating}</div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {['all', 'movie', 'series', 'anime'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`btn-ghost text-sm px-4 py-2 ${filter === cat ? 'border-phosphor-gold text-phosphor-gold' : ''
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Entries Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredEntries.map(entry => (
                    <div
                        key={entry.id}
                        className="mission-card group"
                    >
                        {/* Poster */}
                        <div className="aspect-[2/3] bg-console-dark rounded-lg overflow-hidden mb-3">
                            {entry.poster_url ? (
                                <img
                                    src={entry.poster_url}
                                    alt={entry.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-telemetry-gray">
                                    No Poster
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div>
                            <h3 className="card-title text-sm font-medium text-data-white line-clamp-2">
                                {entry.title}
                            </h3>
                            <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-telemetry-gray">{entry.category}</span>
                                {entry.score && (
                                    <span className="text-phosphor-gold">★ {entry.score}</span>
                                )}
                            </div>
                            {entry.date_finished && (
                                <p className="text-[10px] text-telemetry-gray mt-1">
                                    {new Date(entry.date_finished).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredEntries.length === 0 && (
                <div className="text-center py-12 text-telemetry-gray">
                    No entries found in this category
                </div>
            )}
        </div>
    )
}
