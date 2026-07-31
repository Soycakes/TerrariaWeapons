import { useState } from 'react'
import Sprite from './Sprite'

function matches(weapon, field, value) {
  const val = weapon.data[field]
  return Array.isArray(val) ? val.includes(value) : val === value
}

export default function CellModal({ weapons, rowAxis, colAxis, row, col, onPick, onClose }) {
  const [search, setSearch] = useState('')

  const valid = weapons.filter(w =>
    matches(w, rowAxis.field, row) &&
    matches(w, colAxis.field, col) &&
    w.data.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={box}>
        <p style={{ marginBottom: '0.5rem' }}>{row} / {col}</p>
        <input
          autoFocus
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: '0.5rem', padding: '4px' }}
        />
        <div style={list}>
          <button onClick={() => onPick(null)} style={clearBtn}>Clear</button>
          {valid.map(w => (
            <button key={w.rawName} onClick={() => onPick(w)} style={itemBtn}>
              <Sprite rawName={w.rawName} name={w.data.name} />
              <span>{w.data.name}</span>
            </button>
          ))}
          {valid.length === 0 && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={`${import.meta.env.BASE_URL}ui/MissingSprite.png`} style={{ imageRendering: 'pixelated', width: 32, height: 32 }} />
              No weapons found.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }
const box = { background: '#fff', padding: '1rem', borderRadius: 6, width: 340, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }
const list = { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }
const clearBtn = { background: '#fdd', border: '1px solid #c00', padding: '4px 8px', cursor: 'pointer', color: '#c00', fontWeight: 'bold', textAlign: 'left' }
const itemBtn = { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer', textAlign: 'left' }
