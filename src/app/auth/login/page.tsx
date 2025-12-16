'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-10 bg-phosphor-gold rounded-sm shadow-[0_0_10px_rgba(201,162,39,0.5)]" />
                    <div>
                        <h1 className="text-2xl font-bold font-display">WATCHLOG</h1>
                        <p className="font-mono text-[10px] text-telemetry-gray uppercase tracking-[0.2em]">
                            Mission Control Access
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="panel">
                    <div className="panel-header flex items-center gap-2">
                        <div className="status-dot" style={{ background: 'var(--phosphor-gold)' }} />
                        Crew Login
                    </div>
                    <form onSubmit={handleLogin} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-alert-red/20 border border-alert-red text-alert-red p-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                                Crew ID (Email)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="pilot@cosmos.space"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                                Access Code
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="orbital-loader" style={{ width: 16, height: 16 }} />
                                    Authenticating...
                                </>
                            ) : (
                                <>▶ ACCESS MISSION CONTROL</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sign up link */}
                <p className="text-center mt-6 text-sm text-telemetry-gray">
                    New to the crew?{' '}
                    <Link href="/auth/signup" className="text-phosphor-gold hover:underline">
                        Create Account
                    </Link>
                </p>

                {/* Back to home */}
                <p className="text-center mt-4">
                    <Link href="/" className="text-xs text-telemetry-gray hover:text-data-white">
                        ← Return to Base
                    </Link>
                </p>
            </div>
        </div>
    )
}
