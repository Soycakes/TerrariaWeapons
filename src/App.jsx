import { useState, useEffect } from 'react'
import { weaponData } from './data/weapons'
import { weaponExtras } from './data/weaponsExtra'
import { axisOptions } from './config/categories'
import Grid from './components/Grid'
import CellModal from './components/CellModal'
import FavoritePicker from './components/FavoritePicker'

const weapons = weaponData.map(w => ({
  ...w,
  data: { ...w.data, ...(weaponExtras[w.rawName] || {}) }
}))

const SAVE_KEY = 'tgrid'

function getUniqueValues(axis) {
  const all = weapons.flatMap(w => {
    const val = w.data[axis.field]
    return Array.isArray(val) ? val : [val]
  })
  const unique = [...new Set(all)].filter(Boolean)
  if (axis.order) return unique.sort((a, b) => axis.order.indexOf(a) - axis.order.indexOf(b))
  return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

const init = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    const picks = {}
    for (const [key, rawName] of Object.entries(s.picks || {})) {
      const weapon = weapons.find(w => w.rawName === rawName)
      if (weapon) picks[key] = weapon
    }
    const favorites = {}
    for (const [row, rawName] of Object.entries(s.favorites || {})) {
      const weapon = weapons.find(w => w.rawName === rawName)
      if (weapon) favorites[row] = weapon
    }
    return {
      rowAxis: axisOptions.find(o => o.field === s.rowAxis) || axisOptions.find(o => o.field === 'subclass'),
      colAxis: axisOptions.find(o => o.field === s.colAxis) || axisOptions.find(o => o.field === 'progression tier'),
      picks,
      favorites,
    }
  } catch {
    return {
      rowAxis: axisOptions.find(o => o.field === 'subclass'),
      colAxis: axisOptions.find(o => o.field === 'progression tier'),
      picks: {},
      favorites: {},
    }
  }
})()

export default function App() {
  const [rowAxis, setRowAxis] = useState(init.rowAxis)
  const [colAxis, setColAxis] = useState(init.colAxis)
  const [picks, setPicks] = useState(init.picks)
  const [favorites, setFavorites] = useState(init.favorites)
  const [openCell, setOpenCell] = useState(null)
  const [openFavoriteRow, setOpenFavoriteRow] = useState(null)

  const rows = rowAxis ? getUniqueValues(rowAxis) : null
  const cols = colAxis ? getUniqueValues(colAxis) : null

  useEffect(() => {
    const savedPicks = {}
    for (const [key, weapon] of Object.entries(picks)) savedPicks[key] = weapon.rawName
    const savedFavorites = {}
    for (const [row, weapon] of Object.entries(favorites)) savedFavorites[row] = weapon.rawName
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      rowAxis: rowAxis?.field || null,
      colAxis: colAxis?.field || null,
      picks: savedPicks,
      favorites: savedFavorites,
    }))
  }, [rowAxis, colAxis, picks, favorites])

  function pickAxis(field, setter) {
    setter(axisOptions.find(o => o.field === field) || null)
    setPicks({})
    setFavorites({})
  }

  function onPick(weapon) {
    const key = `${openCell.row}|${openCell.col}`
    const current = picks[key]
    setPicks(prev => {
      const next = { ...prev }
      if (weapon) next[key] = weapon
      else delete next[key]
      return next
    })
    if (current?.rawName === favorites[openCell.row]?.rawName && weapon?.rawName !== current?.rawName) {
      setFavorites(prev => { const next = { ...prev }; delete next[openCell.row]; return next })
    }
    setOpenCell(null)
  }

  function onFavoritePick(weapon) {
    setFavorites(prev => {
      const next = { ...prev }
      if (weapon) next[openFavoriteRow] = weapon
      else delete next[openFavoriteRow]
      return next
    })
    setOpenFavoriteRow(null)
  }

  function reset() {
    if (!confirm('Reset all picks?')) return
    setRowAxis(null)
    setColAxis(null)
    setPicks({})
    setFavorites({})
    localStorage.removeItem(SAVE_KEY)
  }

  return (
    <div style={{ background: '#ccc', minHeight: '100vh', padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Terraria Weapons Grid</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <label>
          Rows:&nbsp;
          <select value={rowAxis?.field || ''} onChange={e => pickAxis(e.target.value, setRowAxis)}>
            <option value="">N/A</option>
            {axisOptions.map(o => <option key={o.field} value={o.field} disabled={o.field === colAxis?.field}>{o.label}</option>)}
          </select>
        </label>

        <label>
          Columns:&nbsp;
          <select value={colAxis?.field || ''} onChange={e => pickAxis(e.target.value, setColAxis)}>
            <option value="">N/A</option>
            {axisOptions.map(o => <option key={o.field} value={o.field} disabled={o.field === rowAxis?.field}>{o.label}</option>)}
          </select>
        </label>

        <button onClick={reset} style={{ border: '1px solid #888', padding: '2px 8px', cursor: 'pointer' }}>Reset</button>
      </div>

      <Grid
        rows={rows}
        cols={cols}
        picks={picks}
        rowAxis={rowAxis}
        colAxis={colAxis}
        favorites={favorites}
        onCellClick={(row, col) => setOpenCell({ row, col })}
        onFavoriteClick={row => setOpenFavoriteRow(row)}
      />

      {openCell && (
        <CellModal
          weapons={weapons}
          rowAxis={rowAxis}
          colAxis={colAxis}
          row={openCell.row}
          col={openCell.col}
          onPick={onPick}
          onClose={() => setOpenCell(null)}
        />
      )}

      {openFavoriteRow && (
        <FavoritePicker
          rowPicks={cols ? cols.map(col => picks[`${openFavoriteRow}|${col}`]).filter(Boolean) : []}
          onPick={onFavoritePick}
          onClose={() => setOpenFavoriteRow(null)}
        />
      )}
    </div>
  )
}
