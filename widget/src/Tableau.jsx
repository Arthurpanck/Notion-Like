import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/table'
import { formaterValeur } from './formaterValeur'
import { recordTitle, titleColumn } from './lib/viewModel'

export function Tableau({ records, colonnes, colInfos, titreChamp, onSelect }) {
  const title = titleColumn(colonnes, colInfos, titreChamp)
  const columns = [title, ...colonnes.filter(c => c !== title)].filter(Boolean)
  return <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tableau des fiches">
    <Table><caption className="sr-only">Liste des fiches. Ouvrez une fiche avec le bouton de son titre.</caption><TableHeader><TableRow>{columns.map(c => <TableHead key={c} scope="col" className="min-w-40">{colInfos[c]?.label || c}</TableHead>)}</TableRow></TableHeader><TableBody>
      {records.map(record => <TableRow key={record.id}>{columns.map(c => <TableCell key={c} className="min-w-40 max-w-sm whitespace-normal break-words align-top">{c === title ? <button className="text-left font-medium underline underline-offset-4" onClick={() => onSelect(record.id)}>{recordTitle(record, colonnes, colInfos, title)}</button> : <div className="line-clamp-3">{formaterValeur(record[c], colInfos[c])}</div>}</TableCell>)}</TableRow>)}
    </TableBody></Table>
  </div>
}
