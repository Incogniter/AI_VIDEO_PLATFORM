import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = { title: string; eyebrow: string; description: string }

export default function PlaceholderPage({ title, eyebrow, description }: Props) {
  return <section className="placeholder-page"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p><div className="placeholder-card"><span className="ai-icon"><Sparkles size={18} /></span><div><strong>This space is taking shape</strong><p>Explore the video feed while we build this part of Streamline.</p></div><Link to="/" className="text-link">Go to Home <ArrowRight size={15} /></Link></div></section>
}
