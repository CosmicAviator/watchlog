/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'void-black': '#0a0a0f',
                'console-dark': '#13131a',
                'grid-line': '#252532',
                'telemetry-gray': '#7a7a8c',
                'data-white': '#e8e4dc',
                'phosphor-gold': '#c9a227',
                'observatory-teal': '#4a9a8c',
                'status-green': '#5d8a66',
                'alert-red': '#c45c5c',
            },
            fontFamily: {
                display: ['Space Grotesk', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
