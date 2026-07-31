import { useState } from 'react'
import { weaponData } from './data/weapons'
import { axisOptions } from './config/categories'
import Grid from './components/Grid'

function getUniqueValues(field) {
  const all = weaponData.flatMap(w => {
    const val = w.data[field]
    return Array.isArray(val) ? val : [val]
  })
  return [...new Set(all)].filter(Boolean).sort()
}

export default function App() {
  const [rowAxis, setRowAxis] = useState(null)
  const [colAxis, setColAxis] = useState(null)

  const rows = rowAxis ? getUniqueValues(rowAxis.field) : null
  const cols = colAxis ? getUniqueValues(colAxis.field) : null

  return (
    <div style={{ background: '#ccc', minHeight: '100vh', padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Terraria Weapons Grid</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label>
          Rows:&nbsp;
          <select onChange={e => setRowAxis(axisOptions.find(o => o.field === e.target.value) || null)} defaultValue="">
            <option value="">N/A</option>
            {axisOptions.map(o => <option key={o.field} value={o.field}>{o.label}</option>)}
          </select>
        </label>

        <label>
          Columns:&nbsp;
          <select onChange={e => setColAxis(axisOptions.find(o => o.field === e.target.value) || null)} defaultValue="">
            <option value="">N/A</option>
            {axisOptions.map(o => <option key={o.field} value={o.field}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <Grid rows={rows} cols={cols} />
    </div>
  )
}
