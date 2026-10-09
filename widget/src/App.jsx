/* global grist */
import { useEffect, useRef, useState } from 'react'
import { Search, Plus, X, Pencil, Save, RotateCcw } from 'lucide-react'
import { Tableau } from './Tableau'
import { Galerie } from './Galerie'
import { Kanban } from './Kanban'
import { Carte } from './Carte'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet'
import { canMoveRecord, filterRecords, groupRecords, moveValue, previewColumns, recordTitle, searchRecords, sortRecords, titleColumn } from './lib/viewModel'

const EMPTY_OPTIONS = {}
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'

export default function App() {
  const [records, setRecords] = useState([])
  const [colInfos, setColInfos] = useState({})
  const [options, setOptions] = useState(EMPTY_OPTIONS)
  const [activeTab, setActiveTab] = useState(null)
  const [query, setQuery] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [moving, setMoving] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [readOnly, setReadOnly] = useState(() => new URLSearchParams(window.location.search).get('readonly') !== 'false')
  const [access, setAccess] = useState('none')
  const searchRef = useRef(null)
  const baseline = useRef(EMPTY_OPTIONS)
  const dirtyRef = useRef(false)

  useEffect(() => {
    let alive = true
    let request = 0
    const applyTheme = () => document.documentElement.classList.toggle('dark', document.documentElement.getAttribute('data-grist-appearance') === 'dark')
    applyTheme()
    const observer = new MutationObserver(applyTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-grist-appearance'] })
    async function loadColumns() {
      const current = ++request
      try {
        const tableId = await grist.getTable().getTableId()
        const [tables, cols, fields] = await Promise.all(['_grist_Tables', '_grist_Tables_column', '_grist_Views_section_field'].map(t => grist.docApi.fetchTable(t)))
        const idx = tables.tableId.indexOf(tableId)
        const refs = Object.fromEntries(cols.id.map((id, i) => [id, cols.colId[i]]))
        const order = {}
        fields.id.forEach((_, i) => { if (fields.parentId[i] === tables.rawViewSectionRef[idx]) order[refs[fields.colRef[i]]] = fields.parentPos[i] })
        const infos = {}
        cols.id.forEach((_, i) => {
          if (cols.parentId[i] !== tables.id[idx]) return
          let config = {}
          try { config = JSON.parse(cols.widgetOptions[i] || '{}') } catch { /* Keep defaults for malformed metadata. */ }
          infos[cols.colId[i]] = { label: cols.label[i], type: cols.type[i], isFormula: Boolean(cols.isFormula?.[i]), choices: config.choices || [], choiceOptions: config.choiceOptions || {}, pos: order[cols.colId[i]] ?? 9999 }
        })
        if (alive && current === request) { setColInfos(infos); setError('') }
      } catch {
        if (alive && current === request) setError('Les informations des colonnes sont indisponibles. Vérifiez dans Grist le niveau d’accès du widget puis rechargez la page.')
      }
    }
    grist.onOptions((incoming, interaction) => {
      if (!alive) return
      const next = incoming || EMPTY_OPTIONS
      baseline.current = next
      if (!dirtyRef.current) setOptions(next)
      if (interaction?.access_level) setAccess(interaction.access_level)
      setReadOnly(new URLSearchParams(window.location.search).get('readonly') !== 'false')
    })
    grist.onRecords(r => {
      if (!alive) return
      setRecords(r || []); setLoaded(true); loadColumns()
    }, { includeColumns: 'normal' })
    grist.ready({ requiredAccess: 'full', onEditOptions: () => { if (alive) setConfigOpen(true) } })
    return () => { alive = false; observer.disconnect() }
  }, [])

  const columns = [...new Set(records.flatMap(r => Object.keys(r)))].filter(c => c !== 'id').sort((a, b) => (colInfos[a]?.pos ?? 9999) - (colInfos[b]?.pos ?? 9999))
  const boards = Array.isArray(options.kanbanVues) ? options.kanbanVues : []
  const views = [ { id: 'tableau', titre: 'Tableau', type: 'tableau' }, { id: 'galerie', titre: 'Galerie', type: 'galerie' }, ...boards.map(v => ({ ...v, vueId: v.id, id: `kanban-${v.id}`, titre: v.nom || `Par ${colInfos[v.champ]?.label || v.champ}`, type: 'kanban' })) ]
    .sort((a, b) => { const order = options.ordreVues || []; const index = id => order.includes(id) ? order.indexOf(id) : 999; return index(a.id) - index(b.id) })
  const active = views.find(v => v.id === activeTab) || views[0]
  const searched = searchRecords(records, columns, colInfos, query)
  const displayed = sortRecords(filterRecords(searched, active.filtreChamp, active.filtreVals, colInfos), active.tri, active.sensTri)
  const selected = records.find(r => r.id === selectedId)
  const title = titleColumn(columns, colInfos, options.titreChamp)
  const groups = active.type === 'kanban' ? groupRecords(records, active.champ, colInfos) : []
  const writable = !readOnly && access === 'full'

  function change(patch) { dirtyRef.current = true; setDirty(true); setNotice(''); setOptions(previous => ({ ...previous, ...patch })) }
  function modifyBoard(id, patch) { change({ kanbanVues: boards.map(v => v.id === id ? { ...v, ...patch } : v) }) }
  async function save() {
    setSaving(true); setError('')
    try {
      await grist.setOptions({ ...baseline.current, ...options })
      dirtyRef.current = false; setDirty(false)
      setNotice('Réglages transmis à Grist. Pour les partager avec tous, cliquez sur Enregistrer dans le menu des options du widget Grist.')
    } catch { setError('Les réglages n’ont pas été transmis. Vos modifications restent disponibles ici. Réessayez.') }
    finally { setSaving(false) }
  }
  function reset() { setOptions(baseline.current); dirtyRef.current = false; setDirty(false); setNotice('Modifications locales annulées.') }
  function addBoard(field) {
    if (!field) return
    const id = Math.max(0, ...boards.map(v => Number(v.id) || 0)) + 1
    change({ kanbanVues: [...boards, { id, champ: field }] }); setActiveTab(`kanban-${id}`)
  }
  async function moveRecord(id, key) {
    const target = groups.find(g => g.key === key)
    const record = records.find(r => r.id === id)
    if (!target || !record || !canMoveRecord(colInfos[active.champ], !writable) || moving) return
    const value = moveValue(target, colInfos[active.champ])
    if (record[active.champ] === value) return
    setMoving(true); setError(''); setNotice('Déplacement en cours…')
    try {
      await grist.getTable().update({ id, fields: { [active.champ]: value } })
      setNotice(`Carte déplacée vers ${target.label}.`)
    } catch { setNotice(''); setError('La carte n’a pas été déplacée. Vérifiez vos droits et les règles de la colonne puis réessayez.') }
    finally { setMoving(false) }
  }
  const cardProps = { colonnes: columns, colInfos, titreChamp: title, champsApercu: options.champsApercu, showCover: options.couvertures !== false }

  return <main className="widget-shell p-4 sm:p-6">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold break-words">{options.titre || 'Bibliothèque'}</h1>
      <div className="flex flex-wrap gap-2">
        {readOnly && <span className="self-center text-sm text-muted-foreground">Lecture seule</span>}
        {!readOnly && <button className={buttonClass} onClick={() => setConfigOpen(!configOpen)} aria-expanded={configOpen}><Pencil size={16}/>Configurer</button>}
      </div>
    </header>
    {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
    <p role="status" aria-live="polite" className="text-sm mb-3">{notice || (dirty ? 'Réglages modifiés localement. Appliquez les réglages pour les transmettre à Grist.' : '')}</p>
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3 py-2" htmlFor="search"><Search size={18}/><span className="sr-only">Rechercher dans les fiches</span><input id="search" ref={searchRef} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher dans les fiches" className="min-w-0 w-full bg-transparent outline-none"/></label>
      {query && <button className={buttonClass} onClick={() => { setQuery(''); searchRef.current?.focus() }}>Effacer la recherche</button>}
      <span role="status" className="text-sm text-muted-foreground">{displayed.length} fiche{displayed.length !== 1 ? 's' : ''} sur {records.length}</span>
    </div>
    {configOpen && !readOnly && <section aria-label="Configuration de la bibliothèque" className="mb-6 border rounded-lg p-4 space-y-4">
      <h2 className="font-semibold text-lg">Configuration de la bibliothèque</h2>
      <p className="text-sm text-muted-foreground">La recherche reste personnelle. Les réglages ci-dessous peuvent être partagés via le menu Enregistrer de Grist.</p>
      <label className="control-label">Titre de la bibliothèque<input value={options.titre || ''} onChange={e => change({ titre: e.target.value })} placeholder="Bibliothèque"/></label>
      <label className="control-label">Colonne du titre<select value={title || ''} onChange={e => change({ titreChamp: e.target.value })}>{columns.map(c => <option key={c} value={c}>{colInfos[c]?.label || c}</option>)}</select></label>
      <fieldset><legend className="font-medium mb-2">Champs visibles sur les cartes</legend><p className="text-sm mb-2 text-muted-foreground">Choisissez les informations utiles à la consultation. La fiche complète garde tous les champs.</p><div className="flex flex-wrap gap-3">{columns.filter(c => c !== title && colInfos[c]?.type !== 'Attachments').map(c => <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={previewColumns(columns, colInfos, title, options.champsApercu).includes(c)} onChange={e => change({ champsApercu: e.target.checked ? [...previewColumns(columns, colInfos, title, options.champsApercu), c] : previewColumns(columns, colInfos, title, options.champsApercu).filter(x => x !== c) })}/>{colInfos[c]?.label || c}</label>)}</div><button className={`${buttonClass} mt-2`} onClick={() => change({ champsApercu: null })}>Aperçu automatique</button></fieldset>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={options.couvertures !== false} onChange={e => change({ couvertures: e.target.checked })}/>Afficher les couvertures</label>
      <label className="control-label">Ajouter un kanban regroupé par<select value="" onChange={e => addBoard(e.target.value)}><option value="">Choisir une colonne</option>{columns.map(c => <option key={c} value={c}>{colInfos[c]?.label || c}</option>)}</select></label>
      <p className="text-sm text-muted-foreground"><Plus size={14} className="inline"/> Les regroupements par choix sont les plus adaptés. Les choix multiples restent consultables sans déplacement.</p>
      <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={!dirty || saving} onClick={save}><Save size={16}/>{saving ? 'Transmission…' : 'Appliquer les réglages'}</button><button className={buttonClass} disabled={!dirty || saving} onClick={reset}><RotateCcw size={16}/>Annuler les modifications</button></div>
    </section>}
    {dirty && !configOpen && <div className="mb-4 flex flex-wrap gap-2"><button className={buttonClass} disabled={saving} onClick={save}>Appliquer les réglages</button><button className={buttonClass} disabled={saving} onClick={reset}>Annuler les modifications</button></div>}
    <nav aria-label="Vues de la bibliothèque" className="mb-4 flex flex-wrap gap-2">{views.map(v => <button key={v.id} className={`${buttonClass} ${active.id === v.id ? 'bg-accent font-semibold' : ''}`} aria-current={active.id === v.id ? 'page' : undefined} onClick={() => setActiveTab(v.id)}>{v.titre}</button>)}</nav>
    {active.type === 'kanban' && <section className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">Regroupement par {colInfos[active.champ]?.label || active.champ}. {canMoveRecord(colInfos[active.champ], !writable) ? 'Déplacez une carte avec sa poignée ou depuis sa fiche.' : 'Les cartes sont consultables. Le déplacement est indisponible pour ce champ ou vos droits.'}</p>
      {!readOnly && <details><summary className="cursor-pointer font-medium">Réglages de cette vue{active.filtreVals?.length ? ' — filtre actif' : ''}</summary><div className="mt-3 flex flex-wrap gap-3 items-end">
        <label className="control-label">Nom de la vue<input value={active.nom || ''} placeholder={active.titre} onChange={e => modifyBoard(active.vueId, { nom: e.target.value })}/></label>
        <label className="control-label">Trier par<select value={active.tri || ''} onChange={e => modifyBoard(active.vueId, { tri: e.target.value || null })}><option value="">Aucun tri</option>{columns.map(c => <option key={c} value={c}>{colInfos[c]?.label || c}</option>)}</select></label>
        <label className="control-label">Ordre<select disabled={!active.tri} value={active.sensTri || 'asc'} onChange={e => modifyBoard(active.vueId, { sensTri: e.target.value })}><option value="asc">Croissant</option><option value="desc">Décroissant</option></select></label>
        <label className="control-label">Filtrer par<select value={active.filtreChamp || ''} onChange={e => modifyBoard(active.vueId, { filtreChamp: e.target.value || null, filtreVals: [] })}><option value="">Aucun filtre</option>{columns.map(c => <option key={c} value={c}>{colInfos[c]?.label || c}</option>)}</select></label>
        {active.filtreChamp && <FilterControls key={active.filtreChamp} field={active.filtreChamp} values={active.filtreVals || []} infos={colInfos} onChange={values => modifyBoard(active.vueId, { filtreVals: values })}/>}

        <button className={buttonClass} onClick={() => modifyBoard(active.vueId, { filtreChamp: null, filtreVals: [], tri: null })}>Réinitialiser tri et filtre</button>
        <button className={buttonClass} onClick={() => { const order = views.map(v => v.id); const idx = order.indexOf(active.id); if (idx > 0) { [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]]; change({ ordreVues: order }) } }}>Déplacer la vue à gauche</button>
        <button className={`${buttonClass} text-destructive`} onClick={() => { change({ kanbanVues: boards.filter(v => v.id !== active.vueId) }); setActiveTab('tableau'); setNotice('Vue retirée localement. Annuler les modifications permet de la restaurer avant application.') }}><X size={16}/>Retirer cette vue</button>
      </div></details>}
      {active.filtreVals?.length > 0 && <p className="mt-2 text-sm">Filtre actif : {colInfos[active.filtreChamp]?.label || active.filtreChamp} — {active.filtreVals.map(v => v === 'true' ? 'Oui' : v === 'false' ? 'Non' : v).join(', ')}</p>}
    </section>}
    {!loaded ? <p role="status">Chargement des fiches depuis Grist…</p> : !displayed.length ? <section className="py-8 text-center"><h2 className="text-lg font-semibold">{records.length ? 'Aucune fiche ne correspond' : 'Aucune fiche disponible'}</h2><p className="mt-2 text-muted-foreground">{records.length ? 'Modifiez la recherche ou le filtre de cette vue.' : 'Ajoutez des lignes dans la table Grist ou vérifiez les filtres de la section.'}</p></section> : active.type === 'tableau' ? <Tableau records={displayed} {...cardProps} onSelect={setSelectedId}/> : active.type === 'galerie' ? <Galerie records={displayed} {...cardProps} onSelect={setSelectedId}/> : <Kanban records={displayed} {...cardProps} champ={active.champ} ordreColonnesEnregistre={active.ordreColonnes} onReorderColumns={order => modifyBoard(active.vueId, { ordreColonnes: order })} onSelect={setSelectedId} onMove={moveRecord} canMove={canMoveRecord(colInfos[active.champ], !writable) && !moving} canConfigure={!readOnly}/>}
    <Sheet open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null) }}><SheetContent className="w-full sm:max-w-xl"><SheetHeader><SheetTitle>{selected ? recordTitle(selected, columns, colInfos, title) : 'Fiche'}</SheetTitle><SheetDescription>Fiche complète en consultation</SheetDescription></SheetHeader><div className="overflow-y-auto px-4 pb-8">{selected && <>
      {active.type === 'kanban' && canMoveRecord(colInfos[active.champ], !writable) && <label className="control-label mb-4">Déplacer vers<select disabled={moving} value={JSON.stringify(selected[active.champ] === '' || selected[active.champ] === undefined ? null : selected[active.champ])} onChange={e => moveRecord(selected.id, e.target.value)}>{groups.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}</select></label>}
      <Carte record={selected} {...cardProps} isDetail/>
    </>}</div></SheetContent></Sheet>
  </main>
}

function FilterControls({ field, values, infos, onChange }) {
  const [text, setText] = useState('')
  const info = infos[field]
  const choices = info?.type === 'Bool' ? ['true', 'false'] : info?.choices || []
  const toggle = value => onChange(values.includes(value) ? values.filter(v => v !== value) : [...values, value])
  const add = () => { const value = text.trim(); if (value && !values.includes(value)) onChange([...values, value]); setText('') }
  return <fieldset className="min-w-0"><legend className="text-sm font-medium mb-2">{choices.length ? 'Correspond à une des valeurs' : 'Contient un des textes'}</legend>
    {choices.length ? <div className="flex flex-wrap gap-3">{[...new Set([...choices, ...values])].map(value => <label key={value} className="flex gap-2 items-center text-sm"><input type="checkbox" checked={values.includes(value)} onChange={() => toggle(value)}/>{value === 'true' ? 'Oui' : value === 'false' ? 'Non' : value}</label>)}</div> : <div className="flex flex-wrap items-center gap-2"><label className="control-label"><span className="sr-only">Texte du filtre</span><input value={text} placeholder="Texte puis Entrée" onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}/></label><button className={buttonClass} onClick={add}>Ajouter au filtre</button>{values.map(value => <button key={value} className={buttonClass} aria-label={`Retirer le filtre ${value}`} onClick={() => onChange(values.filter(v => v !== value))}>{value} ×</button>)}</div>}
  </fieldset>
}
