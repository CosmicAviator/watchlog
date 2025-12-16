'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || email.split('@')[0],
                },
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else if (data.user) {
            // Create profile
            await supabase.from('profiles').insert({
                id: data.user.id,
                username: username || email.split('@')[0],
                theme_id: 'cosmos',
            })

            setSuccess(true)
            setTimeout(() => router.push('/dashboard'), 2000)
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
                            Crew Registration
                        </p>
                    </div>
                </div>

                {/* Sign Up Form */}
                <div className="panel">
                    <div className="panel-header flex items-center gap-2">
                        <div className="status-dot" style={{ background: 'var(--observatory-teal)' }} />
                        New Crew Member
                    </div>
                    <form onSubmit={handleSignUp} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-alert-red/20 border border-alert-red text-alert-red p-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-status-green/20 border border-status-green text-status-green p-3 rounded text-sm">
                                Account created! Redirecting to dashboard...
                            </div>
                        )}

                        <div>
                            <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                                Callsign (Username)
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                placeholder="maverick"
                            />
                        </div>

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

                        <div>
                            <label className="block font-mono text-[10px] text-telemetry-gray uppercase tracking-wider mb-2">
                                Confirm Access Code
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="orbital-loader" style={{ width: 16, height: 16 }} />
                                    Creating Account...
                                </>
                            ) : success ? (
                                <>✓ Account Created</>
                            ) : (
                                <>▶ JOIN THE CREW</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Login link */}
                <p className="text-center mt-6 text-sm text-telemetry-gray">
                    Already a crew member?{' '}
                    <Link href="/auth/login" className="text-phosphor-gold hover:underline">
                        Login
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
