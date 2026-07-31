import { useState } from 'react'
import { weaponData } from './data/weapons'
import { axisOptions } from './config/categories'
import Grid from './components/Grid'
import CellModal from './components/CellModal'

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
  const [picks, setPicks] = useState({})
  const [openCell, setOpenCell] = useState(null)

  const rows = rowAxis ? getUniqueValues(rowAxis.field) : null
  const cols = colAxis ? getUniqueValues(colAxis.field) : null

  function pickAxis(field, setter) {
    setter(axisOptions.find(o => o.field === field) || null)
    setPicks({})
  }

  function onPick(weapon) {
    const key = `${openCell.row}|${openCell.col}`
    setPicks(prev => {
      const next = { ...prev }
      if (weapon) next[key] = weapon
      else delete next[key]
      return next
    })
    setOpenCell(null)
  }

  return (
    <div style={{ background: '#ccc', minHeight: '100vh', padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Terraria Weapons Grid</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label>
          Rows:&nbsp;
          <select onChange={e => pickAxis(e.target.value, setRowAxis)} defaultValue="">
            <option value="">N/A</option>
            {axisOptions.map(o => <option key={o.field} value={o.field}>{o.label}</option>)}
          </select>
        </label>

        <label>
          Columns:&nbsp;
          <select onChange={e => pickAxis(e.target.value, setColAxis)} defaultValue="">
            <option value="">N/A</option>
            {axisOptions.map(o => <option key={o.field} value={o.field}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <Grid rows={rows} cols={cols} picks={picks} onCellClick={(row, col) => setOpenCell({ row, col })} />

      {openCell && (
        <CellModal
          weapons={weaponData}
          rowAxis={rowAxis}
          colAxis={colAxis}
          row={openCell.row}
          col={openCell.col}
          onPick={onPick}
          onClose={() => setOpenCell(null)}
        />
      )}
    </div>
  )
}
