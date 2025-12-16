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

interface DashboardProps {
    user: User
    entries: Entry[]
    profile: Profile | null
}

export default function Dashboard({ user, entries: initialEntries, profile }: DashboardProps) {
    const [entries, setEntries] = useState<Entry[]>(initialEntries)
    const [filter, setFilter] = useState('All')
    const [sortBy, setSortBy] = useState('newest')
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [showStats, setShowStats] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/')
    }

    async function handleAddEntry(newEntry: Omit<Entry, 'id' | 'user_id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('entries')
            .insert({ ...newEntry, user_id: user.id })
            .select()
            .single()

        if (!error && data) {
            setEntries([data, ...entries])
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
        }
    }

    async function handleDeleteEntry(id: string) {
        const { error } = await supabase
            .from('entries')
            .delete()
            .eq('id', id)

        if (!error) {
            setEntries(entries.filter(e => e.id !== id))
        }
    }

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
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-phosphor-gold rounded-sm shadow-[0_0_10px_rgba(201,162,39,0.5)]" />
                        <div>
                            <h1 className="text-xl font-bold font-display">WATCHLOG</h1>
                            <p className="font-mono text-[10px] text-telemetry-gray uppercase tracking-[0.2em]">
                                Flight Log System
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
                            <span className="text-telemetry-gray">{profile?.display_name || profile?.username || 'PILOT'}</span>
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
                {/* Left Column: Form */}
                <div className="space-y-6">
                    <MissionForm onSubmit={handleAddEntry} />
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
