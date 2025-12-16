'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Profile, Friend } from '@/lib/types'

interface AddFriendModalProps {
    isOpen: boolean
    onClose: () => void
    currentUserId: string
    onRequestSent: () => void
}

export default function AddFriendModal({ isOpen, onClose, currentUserId, onRequestSent }: AddFriendModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<Profile[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('')
            setResults([])
            setError(null)
            setSuccess(null)
        }
    }, [isOpen])

    async function handleSearch() {
        if (searchQuery.length < 2) return

        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase
                .rpc('search_users', { search_query: searchQuery })

            if (error) throw error

            // Filter out current user
            const filtered = (data || []).filter((u: Profile) => u.id !== currentUserId)
            setResults(filtered)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function sendFriendRequest(friendId: string) {
        setSending(friendId)
        setError(null)

        try {
            // Check if request already exists
            const { data: existing } = await supabase
                .from('friends')
                .select('id, status')
                .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
                .single()

            if (existing) {
                if (existing.status === 'accepted') {
                    setError('Already friends!')
                } else if (existing.status === 'pending') {
                    setError('Friend request already pending')
                }
                setSending(null)
                return
            }

            const { error } = await supabase
                .from('friends')
                .insert({
                    user_id: currentUserId,
                    friend_id: friendId,
                    status: 'pending'
                })

            if (error) throw error

            setSuccess('Friend request sent!')
            onRequestSent()

            // Remove from results
            setResults(prev => prev.filter(u => u.id !== friendId))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSending(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="panel w-full max-w-md">
                <div className="panel-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="status-dot" style={{ background: 'var(--observatory-teal)' }} />
                        Add Friend
                    </div>
                    <button
                        onClick={onClose}
                        className="text-telemetry-gray hover:text-data-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Search Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by username or email..."
                            className="input-field flex-1"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading || searchQuery.length < 2}
                            className="btn-primary px-4"
                        >
                            {loading ? '...' : '🔍'}
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="bg-alert-red/20 border border-alert-red text-alert-red p-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-status-green/20 border border-status-green text-status-green p-3 rounded text-sm">
                            {success}
                        </div>
                    )}

                    {/* Results */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {results.length === 0 && searchQuery.length >= 2 && !loading && (
                            <p className="text-telemetry-gray text-sm text-center py-4">
                                No users found
                            </p>
                        )}

                        {results.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-void-black/50 rounded border border-grid-line"
                            >
                                <div>
                                    <p className="text-data-white font-medium">
                                        {user.display_name || user.username || 'Unknown'}
                                    </p>
                                    {user.username && (
                                        <p className="text-telemetry-gray text-xs">
                                            @{user.username}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => sendFriendRequest(user.id)}
                                    disabled={sending === user.id}
                                    className="btn-ghost text-sm px-3 py-1"
                                >
                                    {sending === user.id ? 'Sending...' : '+ Add'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
