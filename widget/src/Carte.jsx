import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import { formaterValeur, PieceJointe } from './formaterValeur'
import { listValues, previewColumns, recordTitle, titleColumn } from './lib/viewModel'

export function Carte({ record, colonnes, colInfos, titreChamp, champsApercu, showCover = true, isDetail = false, onOpen }) {
  const title = titleColumn(colonnes, colInfos, titreChamp)
  const name = recordTitle(record, colonnes, colInfos, title)
  const coverColumn = colonnes.find(c => colInfos[c]?.type === 'Attachments' && listValues(record[c]).some(v => v))
  const cover = coverColumn ? listValues(record[coverColumn]).find(v => v) : null
  const fields = isDetail ? colonnes.filter(c => c !== title) : previewColumns(colonnes, colInfos, title, champsApercu)
  const populated = fields.filter(c => record[c] !== null && record[c] !== undefined && record[c] !== '' && (!Array.isArray(record[c]) || listValues(record[c]).length))
  return <Card className={isDetail ? 'border-none shadow-none' : 'overflow-hidden transition-shadow hover:shadow-md'}>
    {showCover && cover && <div className="border-b"><PieceJointe id={cover} variante="couverture"/></div>}
    {!isDetail && <CardHeader className="pt-4 pb-2"><CardTitle className="text-lg leading-snug break-words pr-8">{onOpen ? <button className="text-left hover:underline" onClick={onOpen} aria-label={`Ouvrir la fiche ${name}`}>{name}</button> : name}</CardTitle></CardHeader>}
    <CardContent className="flex flex-col gap-3 pb-4 pt-2">
      {populated.map(c => <div key={c} className="text-sm break-words"><span className="text-muted-foreground block mb-1">{colInfos[c]?.label || c}</span>{formaterValeur(record[c], colInfos[c])}</div>)}
      {isDetail && !populated.length && <p className="text-muted-foreground">Aucun autre champ renseigné.</p>}
      {!isDetail && onOpen && <button className="text-left text-sm underline underline-offset-4" onClick={onOpen}>Voir la fiche complète</button>}
    </CardContent>
  </Card>
}
