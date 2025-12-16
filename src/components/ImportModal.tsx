'use client'

import { useState } from 'react'

interface ImportModalProps {
    onImport: (entries: any[]) => Promise<void>
    onClose: () => void
}

export default function ImportModal({ onImport, onClose }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0, status: '' })

    const parseCSV = (text: string) => {
        const lines = text.split('\n')
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
        
        // Simple regex to handle quoted commas: "Movie, The", 2020
        const parseLine = (line: string) => {
            const result = []
            let start = 0
            let inQuotes = false
            for (let i = 0; i < line.length; i++) {
                if (line[i] === '"') inQuotes = !inQuotes
                if (line[i] === ',' && !inQuotes) {
                    result.push(line.substring(start, i).trim().replace(/^"|"$/g, '').trim())
                    start = i + 1
                }
            }
            result.push(line.substring(start).trim().replace(/^"|"$/g, '').trim())
            return result
        }

        return lines.slice(1).filter(l => l.trim()).map((line, idx) => {
            const values = parseLine(line)
            
            const nameIdx = headers.indexOf('name')
            const dateIdx = headers.indexOf('watched date')
            const ratingIdx = headers.indexOf('rating')
            
            if (nameIdx === -1) return null // Skip if no name

            return {
                title: values[nameIdx],
                date_finished: values[dateIdx] || new Date().toISOString().split('T')[0],
                score: values[ratingIdx] ? parseFloat(values[ratingIdx]) : 0,
                category: 'Movie',
                platform: 'Letterboxd Import'
            }
        }).filter((item): item is any => item !== null) // Explicit type check fix
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) {
            setFile(f)
            const reader = new FileReader()
            reader.onload = (evt) => {
                const text = evt.target?.result as string
                const data = parseCSV(text)
                setPreview(data.slice(0, 5))
                setProgress({ current: 0, total: data.length, status: 'Ready to import' })
            }
            reader.readAsText(f)
        }
    }

    const startImport = async () => {
        if (!file) return
        setImporting(true)

        const reader = new FileReader()
        reader.onload = async (evt) => {
            const text = evt.target?.result as string
            const allEntries = parseCSV(text)
            
            setProgress({ current: 0, total: allEntries.length, status: 'Starting...' })

            const processedEntries = []
            for (let i = 0; i < allEntries.length; i++) {
                const entry = allEntries[i]
                
                // SAFETY CHECK FOR TYPESCRIPT
                if (!entry) continue 

                setProgress({ current: i + 1, total: allEntries.length, status: `Fetching: ${entry.title}` })
                
                try {
                    const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(entry.title)}&type=movie`)
                    const data = await res.json()
                    
                    if (data.results && data.results.length > 0) {
                        const top = data.results[0]
                        entry.poster_url = top.poster_url
                        entry.tmdb_id = top.id
                        entry.title = top.title 
                        entry.date_finished = entry.date_finished || top.year + '-01-01'
                    }
                } catch (e) {
                    console.log(`Skipping metadata for ${entry.title}`)
                }

                processedEntries.push(entry)
                await new Promise(r => setTimeout(r, 200))
            }

            setProgress({ current: allEntries.length, total: allEntries.length, status: 'Saving to Database...' })
            await onImport(processedEntries)
            onClose()
        }
        reader.readAsText(file)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-console-dark border border-phosphor-gold rounded-lg w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-telemetry-gray hover:text-white">✕</button>
                
                <h2 className="text-xl font-display font-bold text-phosphor-gold mb-4">IMPORT FLIGHT LOGS</h2>
                
                {!importing ? (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-grid-line rounded p-8 text-center hover:border-phosphor-gold transition-colors">
                            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                <div className="text-2xl mb-2">📂</div>
                                <div className="text-sm text-telemetry-gray">Select Letterboxd CSV</div>
                            </label>
                        </div>

                        {file && (
                            <div className="bg-void-black p-3 rounded text-xs">
                                <div className="text-status-green mb-2">Found {progress.total} entries</div>
                                <div className="opacity-50">Preview:</div>
                                {preview.map((p, i) => (
                                    <div key={i} className="truncate text-telemetry-gray">• {p.title}</div>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={startImport} 
                            disabled={!file}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            START IMPORT
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="orbital-loader mx-auto mb-4" />
                        <div className="text-phosphor-gold font-mono text-lg mb-2">
                            {Math.round((progress.current / progress.total) * 100)}%
                        </div>
                        <div className="text-xs text-telemetry-gray font-mono">
                            {progress.status}
                        </div>
                        <div className="mt-4 h-1 bg-grid-line rounded overflow-hidden">
                            <div 
                                className="h-full bg-phosphor-gold transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
