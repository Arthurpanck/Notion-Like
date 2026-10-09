import { Carte } from './Carte'
export function Galerie({ records, onSelect, ...cardProps }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">{records.map(record => <Carte key={record.id} record={record} {...cardProps} onOpen={() => onSelect(record.id)}/>)}</div>
}
