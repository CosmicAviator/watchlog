'use client'

import { Profile, Friend } from '@/lib/types'
import { createClient } from '@/lib/supabase-browser'
import { useState } from 'react'
import Link from 'next/link'

interface FriendCardProps {
    friend: Profile
    friendshipId: string
    onUnfriend: () => void
}

export default function FriendCard({ friend, friendshipId, onUnfriend }: FriendCardProps) {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const supabase = createClient()

    async function handleUnfriend() {
        setLoading(true)

        try {
            const { error } = await supabase
                .from('friends')
                .delete()
                .eq('id', friendshipId)

            if (error) throw error
            onUnfriend()
        } catch (err) {
            console.error('Error unfriending:', err)
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    const displayName = friend.display_name || friend.username || 'Unknown User'

    return (
        <div className="flex items-center justify-between p-4 bg-console-dark rounded-lg border border-grid-line hover:border-phosphor-gold/30 transition-colors">
            <Link
                href={`/friends/${friend.id}`}
                className="flex items-center gap-3 flex-1"
            >
                {/* Avatar placeholder */}
                <div className="w-12 h-12 rounded-full bg-phosphor-gold/20 flex items-center justify-center text-phosphor-gold font-bold text-lg">
                    {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-data-white font-medium hover:text-phosphor-gold transition-colors">
                        {displayName}
                    </p>
                    {friend.username && (
                        <p className="text-telemetry-gray text-xs">@{friend.username}</p>
                    )}
                </div>
            </Link>

            <div className="flex items-center gap-2">
                <Link
                    href={`/friends/${friend.id}`}
                    className="btn-ghost text-sm px-3 py-1"
                >
                    View Collection →
                </Link>

                {showConfirm ? (
                    <div className="flex gap-1">
                        <button
                            onClick={handleUnfriend}
                            disabled={loading}
                            className="btn-ghost text-xs px-2 py-1 text-alert-red border-alert-red"
                        >
                            {loading ? '...' : 'Confirm'}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="btn-ghost text-xs px-2 py-1"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="text-telemetry-gray hover:text-alert-red text-sm"
                        title="Unfriend"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}
