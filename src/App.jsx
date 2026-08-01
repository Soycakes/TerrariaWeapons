import { useState, useEffect } from 'react'
import { weaponData } from './data/weapons'
import { weaponsNew } from './data/weaponsNew'
import { weaponExtras } from './data/weaponsExtra'
import { axisOptions } from './config/categories'
import Grid from './components/Grid'
import CellModal from './components/CellModal'
import FavoritePicker from './components/FavoritePicker'

const weapons = [...weaponData, ...weaponsNew].map(w => ({
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
  if (axis.order) return unique.sort((a, b) => {
    const ai = axis.order.indexOf(a)
    const bi = axis.order.indexOf(b)
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
  })
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
    const colFavorites = {}
    for (const [col, rawName] of Object.entries(s.colFavorites || {})) {
      const weapon = weapons.find(w => w.rawName === rawName)
      if (weapon) colFavorites[col] = weapon
    }
    const totalFavorite = s.totalFavorite
      ? weapons.find(w => w.rawName === s.totalFavorite) || null
      : null
    return {
      rowAxis: axisOptions.find(o => o.field === s.rowAxis) || axisOptions.find(o => o.field === 'subclass'),
      colAxis: axisOptions.find(o => o.field === s.colAxis) || axisOptions.find(o => o.field === 'progression tier'),
      picks,
      favorites,
      colFavorites,
      totalFavorite,
    }
  } catch {
    return {
      rowAxis: axisOptions.find(o => o.field === 'subclass'),
      colAxis: axisOptions.find(o => o.field === 'progression tier'),
      picks: {},
      favorites: {},
      colFavorites: {},
      totalFavorite: null,
    }
  }
})()

export default function App() {
  const [rowAxis, setRowAxis] = useState(init.rowAxis)
  const [colAxis, setColAxis] = useState(init.colAxis)
  const [picks, setPicks] = useState(init.picks)
  const [favorites, setFavorites] = useState(init.favorites)
  const [colFavorites, setColFavorites] = useState(init.colFavorites)
  const [totalFavorite, setTotalFavorite] = useState(init.totalFavorite)
  const [openCell, setOpenCell] = useState(null)
  const [openFavoriteRow, setOpenFavoriteRow] = useState(null)
  const [openFavoriteCol, setOpenFavoriteCol] = useState(null)
  const [openTotalFavorite, setOpenTotalFavorite] = useState(false)

  const rows = rowAxis ? getUniqueValues(rowAxis) : null
  const cols = colAxis ? getUniqueValues(colAxis) : null

  useEffect(() => {
    const savedPicks = {}
    for (const [key, weapon] of Object.entries(picks)) savedPicks[key] = weapon.rawName
    const savedFavorites = {}
    for (const [row, weapon] of Object.entries(favorites)) savedFavorites[row] = weapon.rawName
    const savedColFavorites = {}
    for (const [col, weapon] of Object.entries(colFavorites)) savedColFavorites[col] = weapon.rawName
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      rowAxis: rowAxis?.field || null,
      colAxis: colAxis?.field || null,
      picks: savedPicks,
      favorites: savedFavorites,
      colFavorites: savedColFavorites,
      totalFavorite: totalFavorite?.rawName || null,
    }))
  }, [rowAxis, colAxis, picks, favorites, colFavorites, totalFavorite])

  function pickAxis(field, setter) {
    setter(axisOptions.find(o => o.field === field) || null)
    setPicks({})
    setFavorites({})
    setColFavorites({})
    setTotalFavorite(null)
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
    if (current && weapon?.rawName !== current.rawName) {
      if (current.rawName === favorites[openCell.row]?.rawName)
        setFavorites(prev => { const next = { ...prev }; delete next[openCell.row]; return next })
      if (current.rawName === colFavorites[openCell.col]?.rawName)
        setColFavorites(prev => { const next = { ...prev }; delete next[openCell.col]; return next })
      if (current.rawName === totalFavorite?.rawName)
        setTotalFavorite(null)
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

  function onColFavoritePick(weapon) {
    setColFavorites(prev => {
      const next = { ...prev }
      if (weapon) next[openFavoriteCol] = weapon
      else delete next[openFavoriteCol]
      return next
    })
    setOpenFavoriteCol(null)
  }

  function onTotalFavoritePick(weapon) {
    setTotalFavorite(weapon || null)
    setOpenTotalFavorite(false)
  }

  function reset() {
    if (!confirm('Reset all picks?')) return
    setRowAxis(null)
    setColAxis(null)
    setPicks({})
    setFavorites({})
    setColFavorites({})
    setTotalFavorite(null)
    localStorage.removeItem(SAVE_KEY)
  }

  const totalPool = [...new Map(
    [...Object.values(favorites), ...Object.values(colFavorites)].map(w => [w.rawName, w])
  ).values()]

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
        colFavorites={colFavorites}
        totalFavorite={totalFavorite}
        onCellClick={(row, col) => setOpenCell({ row, col })}
        onFavoriteClick={row => setOpenFavoriteRow(row)}
        onColFavoriteClick={col => setOpenFavoriteCol(col)}
        onTotalFavoriteClick={() => setOpenTotalFavorite(true)}
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
          title="Pick row favorite"
          options={cols ? cols.map(col => picks[`${openFavoriteRow}|${col}`]).filter(Boolean) : []}
          onPick={onFavoritePick}
          onClose={() => setOpenFavoriteRow(null)}
        />
      )}

      {openFavoriteCol && (
        <FavoritePicker
          title="Pick column favorite"
          options={rows ? rows.map(row => picks[`${row}|${openFavoriteCol}`]).filter(Boolean) : []}
          onPick={onColFavoritePick}
          onClose={() => setOpenFavoriteCol(null)}
        />
      )}

      {openTotalFavorite && (
        <FavoritePicker
          title="Pick total favorite"
          options={totalPool}
          onPick={onTotalFavoritePick}
          onClose={() => setOpenTotalFavorite(false)}
        />
      )}
    </div>
  )
}
