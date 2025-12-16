'use client'

import { Profile, Friend } from '@/lib/types'
import { createClient } from '@/lib/supabase-browser'
import { useState } from 'react'

interface FriendRequestCardProps {
    request: Friend & { sender: Profile }
    onRespond: () => void
}

export default function FriendRequestCard({ request, onRespond }: FriendRequestCardProps) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    async function handleResponse(status: 'accepted' | 'rejected') {
        setLoading(true)

        try {
            const { error } = await supabase
                .from('friends')
                .update({
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', request.id)

            if (error) throw error
            onRespond()
        } catch (err) {
            console.error('Error responding to request:', err)
        } finally {
            setLoading(false)
        }
    }

    const displayName = request.sender.display_name || request.sender.username || 'Unknown User'

    return (
        <div className="flex items-center justify-between p-4 bg-void-black/50 rounded-lg border border-grid-line">
            <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-observatory-teal/20 flex items-center justify-center text-observatory-teal font-bold">
                    {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-data-white font-medium">{displayName}</p>
                    {request.sender.username && (
                        <p className="text-telemetry-gray text-xs">@{request.sender.username}</p>
                    )}
                    <p className="text-telemetry-gray text-xs mt-1">
                        Sent {new Date(request.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleResponse('accepted')}
                    disabled={loading}
                    className="btn-primary text-sm px-3 py-1"
                >
                    {loading ? '...' : '✓ Accept'}
                </button>
                <button
                    onClick={() => handleResponse('rejected')}
                    disabled={loading}
                    className="btn-ghost text-sm px-3 py-1 text-alert-red border-alert-red/30 hover:border-alert-red"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
