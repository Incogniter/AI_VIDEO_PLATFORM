const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatRelativeAge(uploadedAt: string) {
  const uploadedTime = Date.parse(uploadedAt)
  if (Number.isNaN(uploadedTime)) return ''

  const differenceSeconds = (uploadedTime - Date.now()) / 1000
  if (Math.abs(differenceSeconds) < 45) return differenceSeconds < 0 ? 'just now' : 'soon'

  const [unit, secondsPerUnit] = units.find(([, seconds]) => Math.abs(differenceSeconds) >= seconds) ?? ['second', 1]
  return relativeTime.format(Math.round(differenceSeconds / secondsPerUnit), unit)
}
