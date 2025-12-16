import type { ThemeContent } from './types'

export const THEME_CONTENT: Record<string, ThemeContent> = {
    'cosmos': {
        appTitle: 'WATCHLOG',
        appSubtitle: 'Flight Log System v1.0',
        newEntry: 'New Mission Entry',
        categoryLabel: 'Mission Type',
        platformLabel: 'Launch Platform',
        ratingLabel: 'Mission Rating',
        dateLabel: 'Completion Date',
        submitText: 'LOG MISSION',
        submitIcon: '>',
        itemStatus: 'COMPLETE',
        statsTitle: 'Mission Statistics',
        filterLabel: 'Sector',
        footerText: 'Every film is a flight. Every series is a mission. Log them all.'
    },
    'art-deco': {
        appTitle: 'THE PICTURE HOUSE',
        appSubtitle: 'Film Registry',
        newEntry: 'New Feature Entry',
        categoryLabel: 'Category',
        platformLabel: 'Venue',
        ratingLabel: 'Rating',
        dateLabel: 'Date Viewed',
        submitText: 'ADD TO COLLECTION',
        submitIcon: '+',
        itemStatus: 'SCREENED',
        statsTitle: 'Collection Statistics',
        filterLabel: 'Filter',
        footerText: 'Where every picture tells a story worth preserving.'
    },
    'sakura': {
        appTitle: 'HANAMI',
        appSubtitle: 'Viewing Record',
        newEntry: 'New Entry',
        categoryLabel: 'Type',
        platformLabel: 'Platform',
        ratingLabel: 'Rating',
        dateLabel: 'Date',
        submitText: 'RECORD',
        submitIcon: '*',
        itemStatus: 'VIEWED',
        statsTitle: 'Collection',
        filterLabel: 'Filter',
        footerText: 'To view the fleeting beauty of each story.'
    },
    'neural': {
        appTitle: 'NEURAL',
        appSubtitle: 'Sync Protocol v3.1',
        newEntry: 'New Data Entry',
        categoryLabel: 'Format',
        platformLabel: 'Source',
        ratingLabel: 'Score',
        dateLabel: 'Timestamp',
        submitText: 'UPLOAD',
        submitIcon: '^',
        itemStatus: 'SYNCED',
        statsTitle: 'Analytics',
        filterLabel: 'Query',
        footerText: 'Every stream leaves a trace in the network.'
    }
}
