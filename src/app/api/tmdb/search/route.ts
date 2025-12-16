import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const type = searchParams.get('type') || 'movie'

    if (!query) {
        return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    if (!TMDB_API_KEY) {
        console.error('TMDB_API_KEY not configured')
        return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
    }

    try {
        const endpoint = type === 'tv' ? 'search/tv' : 'search/movie'
        const url = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
        
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.status_message || 'TMDB API error')
        }

        const results = data.results.slice(0, 5).map((item: any) => ({
            id: item.id,
            title: type === 'tv' ? item.name : item.title,
            year: (type === 'tv' ? item.first_air_date : item.release_date)?.split('-')[0] || '',
            poster_url: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
            overview: item.overview?.substring(0, 150) + '...',
        }))

        return NextResponse.json({ results })
    } catch (error: any) {
        console.error('TMDB search error:', error)
        return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 })
    }
}
