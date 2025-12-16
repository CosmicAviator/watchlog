'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import type { Entry, Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import MissionCard from './MissionCard'
import MissionForm from './MissionForm'
import StatsDashboard from './StatsDashboard'
import EditModal from './EditModal'
import ThemeSelector from './ThemeSelector'

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [entries, setEntries] = useState<Entry[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentTheme, setCurrentTheme] = useState('cosmos')

    const [filter, setFilter] = useState('All')
    const [sortBy, setSortBy] = useState('newest')
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [showStats, setShowStats] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const initDashboard = async () => {
            console.log("Initializing dashboard...")
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (authError || !user) {
                console.log("No user found, redirecting...")
                router.push('/auth/login')
                return
            }

            setUser(user)

            // Fetch entries
            const { data: userEntries, error: entriesError } = await supabase
                .from('entries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            
            if (entriesError) console.error("Error fetching entries:", entriesError)
            if (userEntries) setEntries(userEntries)

            // Fetch profile
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            
            if (userProfile) {
                setProfile(userProfile)
                if (userProfile.theme_id) {
                    setCurrentTheme(userProfile.theme_id)
                    document.documentElement.setAttribute('data-theme', userProfile.theme_id)
                }
            }
            
            setLoading(false)
        }

        initDashboard()
    }, [router, supabase])

    const handleThemeChange = (newTheme: string) => {
        setCurrentTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/')
    }

    async function handleAddEntry(newEntry: Omit<Entry, 'id' | 'user_id' | 'created_at'>) {
        if (!user) return
        setError(null)

        try {
            const { data, error } = await supabase
                .from('entries')
                .insert({ ...newEntry, user_id: user.id })
                .select()
                .single()

            if (error) {
                console.error("Insert error:", error)
                setError("FAILED TO ADD: " + error.message + " (" + error.code + ")")
            } else if (data) {
                setEntries([data, ...entries])
            }
        } catch (err: any) {
            console.error("Unexpected error:", err)
            setError(err.message || "Failed to add entry")
        }
    }

    async function handleUpdateEntry(id: string, updates: Partial<Entry>) {
        const { error } = await supabase
            .from('entries')
            .update(updates)
            .eq('id', id)

        if (!error) {
            setEntries(entries.map(e => e.id === id ? { ...e, ...updates } : e))
            setEditingEntry(null)
        } else {
            setError(error.message)
        }
    }

    async function handleDeleteEntry(id: string) {
        if (!confirm("Are you sure you want to delete this mission log?")) return

        const { error } = await supabase
            .from('entries')
            .delete()
            .eq('id', id)

        if (!error) {
            setEntries(entries.filter(e => e.id !== id))
        } else {
            setError(error.message)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="orbital-loader" />
                    <p className="font-mono text-xs text-telemetry-gray uppercase tracking-widest">
                        Initializing Mission Control...
                    </p>
                </div>
            </div>
        )
    }

    if (!user) return null

    // Filter and sort
    const filteredEntries = entries
        .filter(e => filter === 'All' || e.category === filter)
        .sort((a, b) => {
            switch (sortBy) {
                case 'oldest': return new Date(a.date_finished || 0).getTime() - new Date(b.date_finished || 0).getTime()
                case 'rating-high': return (b.score || 0) - (a.score || 0)
                case 'rating-low': return (a.score || 0) - (b.score || 0)
                case 'title-az': return a.title.localeCompare(b.title)
                case 'title-za': return b.title.localeCompare(a.title)
                default: return new Date(b.date_finished || 0).getTime() - new Date(a.date_finished || 0).getTime()
            }
        })

    // Stats
    const totalEntries = entries.length
    const avgRating = entries.length > 0
        ? (entries.reduce((sum, e) => sum + (e.score || 0), 0) / entries.length).toFixed(1)
        : '0.0'

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-grid-line bg-void-black/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo & Theme Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-phosphor-gold rounded-sm shadow-[0_0_10px_rgba(201,162,39,0.5)]" />
                        <div>
                            <h1 className="text-xl font-bold font-display">WATCHLOG</h1>
                            <p className="font-mono text-[10px] text-telemetry-gray uppercase tracking-[0.2em]">
                                System: {currentTheme}
                            </p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="hidden md:flex items-center gap-4 font-mono text-xs">
                        <div className="flex items-center gap-2 panel px-3 py-1.5">
                            <span className="text-telemetry-gray">TOTAL:</span>
                            <span className="text-phosphor-gold font-bold">{totalEntries}</span>
                        </div>
                        <div className="flex items-center gap-2 panel px-3 py-1.5">
                            <span className="text-telemetry-gray">AVG:</span>
                            <span className="text-status-green font-bold">{avgRating}</span>
                        </div>
                        <div className="flex items-center gap-2 panel px-3 py-1.5">
                            <div className="status-dot" />
                            <span className="text-telemetry-gray">{profile?.display_name || profile?.username || user.email?.split('@')[0] || 'PILOT'}</span>
                        </div>
                        <Link href="/friends" className="btn-ghost text-xs">
                            👥 FRIENDS
                        </Link>
                        <button onClick={handleLogout} className="btn-ghost text-xs">
                            LOGOUT
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="max-w-7xl mx-auto px-6 py-3 bg-console-dark/50 flex flex-wrap items-center gap-4">
                    <span className="font-mono text-[10px] text-telemetry-gray uppercase tracking-widest">
                        Filter:
                    </span>
                    {['All', 'Movie', 'Series', 'Anime'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`btn-ghost text-xs ${filter === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}

                    <span className="font-mono text-[10px] text-telemetry-gray uppercase tracking-widest ml-4">
                        Sort:
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="btn-ghost text-xs bg-transparent"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="rating-high">Rating ↓</option>
                        <option value="rating-low">Rating ↑</option>
                        <option value="title-az">Title A-Z</option>
                        <option value="title-za">Title Z-A</option>
                    </select>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* Left Column: Form & Settings */}
                <div className="space-y-6">
                    {error && (
                        <div className="bg-alert-red/20 border border-alert-red text-alert-red p-3 rounded text-sm break-words">
                            ERROR: {error}
                        </div>
                    )}
                    
                    <MissionForm onSubmit={handleAddEntry} />
                    
                    <ThemeSelector 
                        currentTheme={currentTheme}
                        onThemeChange={handleThemeChange}
                        user_id={user.id}
                    />
                </div>

                {/* Right Column: Stats + Grid */}
                <div className="space-y-6">
                    {/* Stats Dashboard */}
                    <StatsDashboard
                        entries={entries}
                        show={showStats}
                        onToggle={() => setShowStats(!showStats)}
                    />

                    {/* Mission Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredEntries.map(entry => (
                            <MissionCard
                                key={entry.id}
                                entry={entry}
                                onClick={() => setEditingEntry(entry)}
                                onDelete={() => handleDeleteEntry(entry.id)}
                            />
                        ))}
                        {filteredEntries.length === 0 && (
                            <div className="col-span-full text-center py-16">
                                <div className="text-4xl mb-4">🛸</div>
                                <p className="font-mono text-sm text-telemetry-gray uppercase tracking-widest">
                                    No missions in sector: {filter}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {editingEntry && (
                <EditModal
                    entry={editingEntry}
                    onSave={(updates) => handleUpdateEntry(editingEntry.id, updates)}
                    onClose={() => setEditingEntry(null)}
                />
            )}
        </div>
    )
}
