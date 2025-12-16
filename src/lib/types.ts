// Database types for Supabase
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    display_name: string | null
                    avatar_url: string | null
                    theme_id: string
                    created_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    display_name?: string | null
                    avatar_url?: string | null
                    theme_id?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    display_name?: string | null
                    avatar_url?: string | null
                    theme_id?: string
                    created_at?: string
                }
            }
            entries: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    category: string
                    platform: string | null
                    score: number | null
                    date_finished: string | null
                    poster_url: string | null
                    custom_poster: string | null
                    tmdb_id: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    category: string
                    platform?: string | null
                    score?: number | null
                    date_finished?: string | null
                    poster_url?: string | null
                    custom_poster?: string | null
                    tmdb_id?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    category?: string
                    platform?: string | null
                    score?: number | null
                    date_finished?: string | null
                    poster_url?: string | null
                    custom_poster?: string | null
                    tmdb_id?: number | null
                    created_at?: string
                }
            }
            friends: {
                Row: {
                    id: string
                    user_id: string
                    friend_id: string
                    status: 'pending' | 'accepted' | 'rejected'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    friend_id: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    friend_id?: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Functions: {
            search_users: {
                Args: { search_query: string }
                Returns: {
                    id: string
                    username: string | null
                    display_name: string | null
                    avatar_url: string | null
                }[]
            }
        }
    }
}

export type Entry = Database['public']['Tables']['entries']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Friend = Database['public']['Tables']['friends']['Row']

// Extended types for UI
export interface FriendWithProfile extends Friend {
    profile: Profile
}

export interface FriendRequest {
    id: string
    from: Profile
    to: Profile
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
}

