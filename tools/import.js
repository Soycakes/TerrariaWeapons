import { readFileSync, writeFileSync } from 'fs'

const ORIGINAL_FIELDS = new Set(['rawName', 'id', 'name', 'damageType', 'damage', 'knockback', 'speed', 'autoswing', 'rarity', 'sell', 'obtained', 'material', 'tooltip'])

function parseRow(line) {
  const cells = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      let value = ''
      i++
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { value += '"'; i += 2 }
        else if (line[i] === '"') { i++; break }
        else value += line[i++]
      }
      cells.push(value)
      if (line[i] === ',') i++
    } else {
      const end = line.indexOf(',', i)
      if (end === -1) { cells.push(line.slice(i)); break }
      cells.push(line.slice(i, end))
      i = end + 1
    }
  }
  return cells
}

function parseValue(str) {
  if (str === '') return undefined
  const lower = str.toLowerCase()
  if (lower === 'true') return true
  if (lower === 'false') return false
  if (str.includes('|')) return str.split('|').map(s => s.trim()).filter(Boolean)
  return str
}

const text = readFileSync('tools/weapons.csv', 'utf8').replace(/\r/g, '')
const [headerLine, ...dataLines] = text.trim().split('\n')
const headers = parseRow(headerLine)

const extras = {}
for (const line of dataLines) {
  const row = parseRow(line)
  const rawName = row[0]
  const extra = {}
  headers.forEach((h, i) => {
    if (ORIGINAL_FIELDS.has(h)) return
    const parsed = parseValue(row[i] ?? '')
    if (parsed !== undefined) extra[h] = parsed
  })
  if (Object.keys(extra).length > 0) extras[rawName] = extra
}

const body = Object.entries(extras).map(([rawName, data]) => {
  const fields = Object.entries(data).map(([k, v]) => {
    const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`
    return `    ${key}: ${JSON.stringify(v)}`
  }).join(',\n')
  return `  "${rawName}": {\n${fields}\n  }`
}).join(',\n')

writeFileSync('src/data/weaponsExtra.js', `export const weaponExtras = {\n${body}\n}\n`, 'utf8')
console.log(`Imported extras for ${Object.keys(extras).length} weapons into src/data/weaponsExtra.js`)
