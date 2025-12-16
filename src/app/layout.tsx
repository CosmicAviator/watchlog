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
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                var savedTheme = localStorage.getItem('watchlog-theme');
                                var theme = savedTheme || 'cosmos';
                                document.documentElement.setAttribute('data-theme', theme);
                            } catch (e) {}
                        })()
                    `
                }} />
            </head>
            <body>{children}</body>
        </html>
    )
}
