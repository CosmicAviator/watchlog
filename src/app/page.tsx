import Link from 'next/link'

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            {/* Star background effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center max-w-2xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-2 h-16 bg-phosphor-gold rounded-sm shadow-[0_0_20px_rgba(201,162,39,0.5)]" />
                    <div>
                        <h1 className="text-5xl font-bold tracking-tight font-display">
                            WATCHLOG
                        </h1>
                        <p className="font-mono text-xs text-telemetry-gray uppercase tracking-[0.3em] mt-1">
                            Flight Log System v2.0
                        </p>
                    </div>
                </div>

                {/* Tagline */}
                <p className="text-lg text-telemetry-gray mb-12 font-mono">
                    Every film is a flight. Every series is a mission. Log them all.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/auth/login"
                        className="btn-primary text-center"
                    >
                        ▶ COMMENCE MISSION
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="btn-ghost text-center"
                    >
                        CREATE ACCOUNT
                    </Link>
                </div>

                {/* Features */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="panel p-6">
                        <div className="text-3xl mb-2">🎬</div>
                        <h3 className="font-display text-sm font-semibold mb-1">Log Movies</h3>
                        <p className="text-xs text-telemetry-gray">Track every film you watch</p>
                    </div>
                    <div className="panel p-6">
                        <div className="text-3xl mb-2">📺</div>
                        <h3 className="font-display text-sm font-semibold mb-1">Track Series</h3>
                        <p className="text-xs text-telemetry-gray">Never lose your progress</p>
                    </div>
                    <div className="panel p-6">
                        <div className="text-3xl mb-2">📊</div>
                        <h3 className="font-display text-sm font-semibold mb-1">See Stats</h3>
                        <p className="text-xs text-telemetry-gray">Visualize your journey</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
