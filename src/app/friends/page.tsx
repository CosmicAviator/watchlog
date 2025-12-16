'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Profile, Friend } from '@/lib/types'
import { THEME_CONTENT } from '@/lib/constants'
import AddFriendModal from '@/components/friends/AddFriendModal'
import FriendRequestCard from '@/components/friends/FriendRequestCard'
import FriendCard from '@/components/friends/FriendCard'

interface FriendWithProfile {
    id: string
    user_id: string
    friend_id: string
    status: string
    created_at: string
    profile: Profile
}

export default function FriendsPage() {
    const [user, setUser] = useState<any>(null)
    const [friends, setFriends] = useState<FriendWithProfile[]>([])
    const [incomingRequests, setIncomingRequests] = useState<(Friend & { sender: Profile })[]>([])
    const [outgoingRequests, setOutgoingRequests] = useState<(Friend & { recipient: Profile })[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [currentTheme, setCurrentTheme] = useState('cosmos') // Default
    const router = useRouter()
    const supabase = createClient()

    // Derived theme content
    const themeContent = THEME_CONTENT[currentTheme] || THEME_CONTENT['cosmos']

    useEffect(() => {
        // Load theme immediately
        const savedTheme = localStorage.getItem('watchlog-theme') || 'cosmos'
        setCurrentTheme(savedTheme)
        checkAuth()
    }, [])

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/auth/login')
            return
        }
        setUser(user)
        await loadFriendsData(user.id)
    }

    async function loadFriendsData(userId: string) {
        setLoading(true)

        try {
            // Load accepted friends
            const { data: friendships } = await supabase
                .from('friends')
                .select('*')
                .eq('status', 'accepted')
                .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

            if (friendships) {
                // Get friend profiles
                const friendIds = friendships.map(f =>
                    f.user_id === userId ? f.friend_id : f.user_id
                )

                if (friendIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', friendIds)

                    const friendsWithProfiles = friendships.map(f => {
                        const friendId = f.user_id === userId ? f.friend_id : f.user_id
                        return {
                            ...f,
                            profile: profiles?.find(p => p.id === friendId) || {} as Profile
                        }
                    })
                    setFriends(friendsWithProfiles)
                }
            }

            // Load incoming requests (where I am the friend_id)
            const { data: incoming } = await supabase
                .from('friends')
                .select('*')
                .eq('friend_id', userId)
                .eq('status', 'pending')

            if (incoming) {
                const senderIds = incoming.map(r => r.user_id)
                if (senderIds.length > 0) {
                    const { data: senderProfiles } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', senderIds)

                    const requestsWithSenders = incoming.map(r => ({
                        ...r,
                        sender: senderProfiles?.find(p => p.id === r.user_id) || {} as Profile
                    }))
                    setIncomingRequests(requestsWithSenders as any)
                }
            }

            // Load outgoing requests (where I am the user_id)
            const { data: outgoing } = await supabase
                .from('friends')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'pending')

            if (outgoing) {
                const recipientIds = outgoing.map(r => r.friend_id)
                if (recipientIds.length > 0) {
                    const { data: recipientProfiles } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', recipientIds)

                    const requestsWithRecipients = outgoing.map(r => ({
                        ...r,
                        recipient: recipientProfiles?.find(p => p.id === r.friend_id) || {} as Profile
                    }))
                    setOutgoingRequests(requestsWithRecipients as any)
                }
            }
        } catch (err) {
            console.error('Error loading friends:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="orbital-loader" />
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-telemetry-gray hover:text-data-white">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-10 bg-observatory-teal rounded-sm shadow-[0_0_10px_rgba(42,157,143,0.5)]" />
                        <div>
                            {/* DYNAMIC TEXT HERE */}
                            <h1 className="text-2xl font-bold font-display uppercase">{themeContent.friendsHeader}</h1>
                            <p className="font-mono text-[10px] text-telemetry-gray uppercase tracking-[0.2em]">
                                {currentTheme === 'art-deco' ? 'Society Members' : 'Friend Management'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary"
                    >
                        {themeContent.addFriend}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Incoming Requests */}
                <div className="panel">
                    <div className="panel-header flex items-center gap-2">
                        <div className="status-dot" style={{ background: 'var(--alert-red)' }} />
                        Incoming Requests
                        {incomingRequests.length > 0 && (
                            <span className="ml-auto bg-alert-red text-void-black text-xs px-2 py-0.5 rounded-full">
                                {incomingRequests.length}
                            </span>
                        )}
                    </div>
                    <div className="p-4 space-y-3">
                        {incomingRequests.length === 0 ? (
                            <p className="text-telemetry-gray text-sm text-center py-4">
                                No pending requests
                            </p>
                        ) : (
                            incomingRequests.map(request => (
                                <FriendRequestCard
                                    key={request.id}
                                    request={request}
                                    onRespond={() => loadFriendsData(user.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Friends List */}
                <div className="panel lg:col-span-2">
                    <div className="panel-header flex items-center gap-2">
                        <div className="status-dot" style={{ background: 'var(--status-green)' }} />
                        {themeContent.friendsHeader}
                        <span className="ml-auto text-telemetry-gray text-xs">
                            {friends.length} found
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        {friends.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-telemetry-gray mb-4">
                                    No friends yet.
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn-primary"
                                >
                                    {themeContent.addFriend}
                                </button>
                            </div>
                        ) : (
                            friends.map(friend => (
                                <FriendCard
                                    key={friend.id}
                                    friend={friend.profile}
                                    friendshipId={friend.id}
                                    onUnfriend={() => loadFriendsData(user.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Outgoing Requests */}
            {outgoingRequests.length > 0 && (
                <div className="panel mt-6">
                    <div className="panel-header flex items-center gap-2">
                        <div className="status-dot" style={{ background: 'var(--phosphor-gold)' }} />
                        Pending Sent Requests
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {outgoingRequests.map(request => (
                                <div
                                    key={request.id}
                                    className="flex items-center gap-2 bg-void-black/50 px-3 py-2 rounded border border-grid-line"
                                >
                                    <span className="text-data-white text-sm">
                                        {request.recipient.display_name || request.recipient.username}
                                    </span>
                                    <span className="text-phosphor-gold text-xs">Pending...</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Friend Modal */}
            {user && (
                <AddFriendModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    currentUserId={user.id}
                    onRequestSent={() => loadFriendsData(user.id)}
                />
            )}
        </div>
    )
}
