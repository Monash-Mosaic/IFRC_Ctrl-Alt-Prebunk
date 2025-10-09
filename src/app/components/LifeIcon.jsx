import { useState } from 'react'

export default function LifeIcon({ index }) {
  const [src, setSrc] = useState('/lives.png')
  if (src === null) return <span style={{ marginRight: 4 }}>♥</span>
  return (
    <img
      src={src}
      alt="life"
      width={16}
      height={16}
      style={{ marginRight: 4, verticalAlign: 'text-bottom' }}
      onError={() => setSrc(prev => (prev === '/lives.png' ? '/lives-bar1 (1).png' : null))}
    />
  )
}