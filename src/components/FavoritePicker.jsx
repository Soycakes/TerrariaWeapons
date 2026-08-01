import Sprite from './Sprite'

export default function FavoritePicker({ title = 'Pick favorite', options, onPick, onClose }) {
  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={box}>
        <p style={{ marginBottom: '0.5rem' }}>{title}</p>
        <div style={list}>
          <button onClick={() => onPick(null)} style={clearBtn}>Clear</button>
          {options.length === 0 && <p>No picks in this row yet.</p>}
          {options.map(w => (
            <button key={w.rawName} onClick={() => onPick(w)} style={itemBtn}>
              <Sprite id={w.data.id} rawName={w.rawName} name={w.data.name} />
              <span>{w.data.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }
const box = { background: '#fff', padding: '1rem', borderRadius: 6, width: 280, maxHeight: '60vh', display: 'flex', flexDirection: 'column' }
const list = { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }
const clearBtn = { background: '#fdd', border: '1px solid #c00', padding: '4px 8px', cursor: 'pointer', color: '#c00', fontWeight: 'bold', textAlign: 'left' }
const itemBtn = { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer', textAlign: 'left' }
