const base = import.meta.env.BASE_URL

function toFilename(rawName) {
  return decodeURIComponent(rawName).replace(/[^a-zA-Z0-9]/g, '')
}

export default function Sprite({ rawName, name, size = 32 }) {
  const file = toFilename(rawName)
  return (
    <img
      key={rawName}
      src={`${base}sprites/${file}.png`}
      alt={name}
      title={name}
      style={{ imageRendering: 'pixelated', width: size, height: size, objectFit: 'contain' }}
      onError={e => {
        const stage = e.target.dataset.stage || '0'
        if (stage === '0') {
          e.target.dataset.stage = '1'
          e.target.src = `https://terraria.wiki.gg/images/${rawName}.png`
        } else if (stage === '1') {
          e.target.dataset.stage = '2'
          e.target.src = `${base}ui/MissingSprite.png`
        } else {
          e.target.onerror = null
        }
      }}
    />
  )
}
