import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'WatchLog | Flight Log System',
    description: 'Personal entertainment archive. Track your movies, series, and anime as completed missions.',
    themeColor: '#0a0a0f',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
