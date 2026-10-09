export function listValues(value) {
  return Array.isArray(value) ? (value[0] === 'L' ? value.slice(1) : value) : [value]
}

export function normalizeText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')
}

export function searchableText(value, info) {
  if (info?.type === 'Attachments') return ''
  if (typeof value === 'boolean') return value ? 'oui true' : 'non false'
  return listValues(value).map(v => normalizeText(v)).join(' ')
}

export function searchRecords(records, columns, infos, query) {
  const terms = normalizeText(query).trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return records
  return records.filter(record => {
    const text = columns.map(c => searchableText(record[c], infos[c])).join(' ')
    return terms.every(term => text.includes(term))
  })
}

export function filterRecords(records, field, values, infos) {
  if (!field || !values?.length) return records
  const exact = ['Choice', 'ChoiceList', 'Bool'].includes(infos[field]?.type)
  return records.filter(record => {
    const entries = listValues(record[field]).map(v => normalizeText(v))
    return values.some(value => entries.some(entry => exact ? entry === normalizeText(value) : entry.includes(normalizeText(value))))
  })
}

export function titleColumn(columns, infos, configured) {
  if (columns.includes(configured)) return configured
  return columns.find(c => /^(nom|titre|name|title)$/i.test(infos[c]?.label || c))
    || columns.find(c => infos[c]?.type === 'Text')
    || columns.find(c => infos[c]?.type !== 'Attachments')
}

export function recordTitle(record, columns, infos, configured) {
  const value = record?.[titleColumn(columns, infos, configured)]
  return value === null || value === undefined || value === '' ? 'Sans titre' : String(value)
}

export function previewColumns(columns, infos, title, configured) {
  if (Array.isArray(configured)) return configured.filter(c => columns.includes(c) && c !== title)
  return columns.filter(c => c !== title && infos[c]?.type !== 'Attachments')
    .sort((a, b) => Number(!['Choice', 'ChoiceList'].includes(infos[a]?.type)) - Number(!['Choice', 'ChoiceList'].includes(infos[b]?.type)))
    .slice(0, 3)
}

export function groupRecords(records, field, infos) {
  const groups = new Map()
  const add = value => {
    const normalized = value === '' || value === undefined ? null : value
    const key = JSON.stringify(normalized)
    if (!groups.has(key)) groups.set(key, { key, value: normalized, label: normalized === null ? 'Sans valeur' : typeof normalized === 'boolean' ? (normalized ? 'Oui' : 'Non') : String(normalized), records: [] })
    return groups.get(key)
  }
  for (const choice of infos[field]?.choices || []) add(choice)
  for (const record of records) {
    const values = listValues(record[field])
    for (const value of new Set(values.length ? values : [null])) add(value).records.push(record)
  }
  return [...groups.values()]
}

export function canMoveRecord(info, readOnly) {
  return !readOnly && !info?.isFormula && ['Choice', 'Text', 'Bool'].includes(info?.type)
}

export function moveValue(group, info) {
  if (group.value === null) return info.type === 'Bool' ? false : ''
  return group.value
}

export function sortRecords(records, field, direction) {
  if (!field) return records
  return [...records].sort((a, b) => {
    const x = a[field], y = b[field]
    if (x === y) return 0
    if (x === null || x === undefined || x === '') return 1
    if (y === null || y === undefined || y === '') return -1
    const comparison = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'fr', { numeric: true, sensitivity: 'base' })
    return direction === 'desc' ? -comparison : comparison
  })
}
