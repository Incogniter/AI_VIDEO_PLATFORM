export type Video = {
  id: string
  title: string
  creator: string
  views: string
  age: string
  duration: string
  category: string
  cover: string
  description: string
  featured?: boolean
}

export const videos: Video[] = [
  {
    id: 'systems', title: 'Designing systems that scale', creator: 'Northstar Studio',
    views: '128K views', age: '2 days ago', duration: '24:18', category: 'Technology',
    cover: 'cover-architecture', description: 'A practical guide to building resilient real-time systems.', featured: true,
  },
  {
    id: 'ocean', title: 'Inside the world of ocean science', creator: 'Field Notes',
    views: '82K views', age: '1 week ago', duration: '18:42', category: 'Science',
    cover: 'cover-ocean', description: 'Meet the researchers mapping a changing ocean.',
  },
  {
    id: 'film', title: 'The art of seeing differently', creator: 'Still / Moving',
    views: '46K views', age: '3 days ago', duration: '12:06', category: 'Design',
    cover: 'cover-film', description: 'How visual storytellers turn ordinary moments into something memorable.',
  },
]

export const categories = ['All', 'For you', 'Technology', 'Design', 'Science', 'Documentary', 'Gaming', 'Music']
