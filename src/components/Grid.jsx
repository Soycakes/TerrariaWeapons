import Sprite from './Sprite'

export default function Grid({ rows, cols, picks, onCellClick }) {
  if (!rows || !cols) {
    return <p style={{ padding: '1rem' }}>Pick a row and column category to get started.</p>
  }

  return (
    <div style={{ overflowX: 'auto', padding: '1rem' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={corner} />
            {cols.map(col => (
              <th key={col} style={header}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row}>
              <td style={header}>{row}</td>
              {cols.map(col => {
                const pick = picks[`${row}|${col}`]
                return (
                  <td key={col} style={cell} onClick={() => onCellClick(row, col)}>
                    <div style={cellInner}>
                      {pick && <Sprite rawName={pick.rawName} name={pick.data.name} size={64} />}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const corner = { width: 120, height: 60 }
const header = { padding: '8px 12px', background: '#aaa', fontWeight: 'bold', border: '1px solid #888', textAlign: 'center' }
const cell = { width: 120, height: 80, border: '1px solid #888', background: '#ddd', cursor: 'pointer', verticalAlign: 'middle' }
const cellInner = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }
