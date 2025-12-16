'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface ThemeSelectorProps {
    currentTheme: string
    onThemeChange: (newTheme: string) => void
    user_id: string
}

const THEMES = [
    { id: 'cosmos', name: 'Cosmos', color: '#c9a227' },
    { id: 'art_deco', name: 'Art Deco', color: '#d4af37' },
    { id: 'sakura', name: 'Sakura', color: '#ff69b4' },
    { id: 'neural', name: 'Neural', color: '#00f3ff' },
]

export default function ThemeSelector({ currentTheme, onThemeChange, user_id }: ThemeSelectorProps) {
    const [updating, setUpdating] = useState(false)
    const supabase = createClient()

    async function handleThemeSelect(themeId: string) {
        if (themeId === currentTheme || updating) return

        setUpdating(true)
        
        // Optimistic update
        onThemeChange(themeId)

        // Persist to DB
        const { error } = await supabase
            .from('profiles')
            .update({ theme_id: themeId })
            .eq('id', user_id)

        if (error) {
            console.error('Error updating theme:', error)
        }

        setUpdating(false)
    }

    return (
        <div className="panel p-4">
            <h3 className="panel-header mb-3" style={{ border: 'none', padding: 0 }}>
                Visual Interface System
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {THEMES.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`
                            relative overflow-hidden p-3 rounded border text-left transition-all
                            ${currentTheme === theme.id 
                                ? 'border-[var(--phosphor-gold)] bg-[var(--phosphor-gold-dim)]' 
                                : 'border-[var(--grid-line)] hover:border-[var(--telemetry-gray)]'
                            }
                        `}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} 
                            />
                            <span className={`text-xs font-mono uppercase ${currentTheme === theme.id ? 'text-[var(--phosphor-gold)]' : 'text-[var(--telemetry-gray)]'}`}>
                                {theme.name}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
