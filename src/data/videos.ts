export type Video = {
  id: string
  title: string
  creator: string
  views: string
  uploadedAt: string
  duration: string
  category: string
  cover: string
  description: string
  featured?: boolean
}

export const videos: Video[] = [
  {
    id: 'systems', title: 'Designing systems that scale', creator: 'Northstar Studio',
    views: '128K views', uploadedAt: '2026-11-22T12:00:00+05:30', duration: '24:18', category: 'Technology',
    cover: 'cover-architecture', description: 'A practical guide to building resilient real-time systems.', featured: true,
  },
  {
    id: 'ocean', title: 'Inside the world of ocean science', creator: 'Field Notes',
    views: '82K views', uploadedAt: '2026-11-17T12:00:00+05:30', duration: '18:42', category: 'Science',
    cover: 'cover-ocean', description: 'Meet the researchers mapping a changing ocean.',
  },
  {
    id: 'film', title: 'The art of seeing differently', creator: 'Still / Moving',
    views: '46K views', uploadedAt: '2026-11-21T12:00:00+05:30', duration: '12:06', category: 'Design',
    cover: 'cover-film', description: 'How visual storytellers turn ordinary moments into something memorable.',
  },
]

export const categories = VIDEO_CATEGORIES
import { VIDEO_CATEGORIES } from '../constants/app'

