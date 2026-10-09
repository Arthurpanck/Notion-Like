/* global grist */
import { useState, useEffect } from 'react'
import { Badge } from './components/ui/badge'
import { Paperclip } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet'

let tokenCache = null
let tokenPromise = null
async function getGristToken() {
  if (tokenCache && tokenCache.expire > Date.now()) return tokenCache
  if (!tokenPromise) tokenPromise = grist.docApi.getAccessToken({ readOnly: true }).then(info => {
    tokenCache = { ...info, expire: Date.now() + 2 * 60 * 1000 }
    return tokenCache
  }).finally(() => { tokenPromise = null })
  return tokenPromise
}
export function PieceJointe({ id, variante = 'miniature' }) {
  const [result, setResult] = useState(null)
  const [file, setFile] = useState(false)
  const [open, setOpen] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    getGristToken().then(({ baseUrl, token }) => {
      if (alive) setResult({ id, src: `${baseUrl}/attachments/${id}/download?auth=${encodeURIComponent(token)}` })
    }).catch(() => { if (alive) setResult({ id, error: true }) })
    return () => { alive = false }
  }, [id, attempt])
  if (result?.id !== id) return <span className="text-sm text-muted-foreground">Chargement du fichier…</span>
  if (result.error) return <button className="text-sm underline" onClick={() => { setResult(null); setAttempt(n => n + 1) }}>Fichier indisponible — réessayer</button>
  const src = result.src
  if (file) return <a href={src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border p-2" aria-label="Ouvrir la pièce jointe dans un nouvel onglet"><Paperclip size={18}/>Ouvrir le fichier</a>
  if (variante === 'couverture') return <img src={src} alt="" loading="lazy" onError={() => setFile(true)} className="w-full h-32 object-cover"/>
  return <>
    <button onClick={() => setOpen(true)} aria-label="Agrandir la pièce jointe"><img src={src} alt="Pièce jointe" loading="lazy" onError={() => setFile(true)} className="h-12 w-12 object-cover rounded border"/></button>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent className="w-full sm:max-w-2xl"><SheetHeader><SheetTitle>Pièce jointe</SheetTitle><SheetDescription>Aperçu du fichier</SheetDescription></SheetHeader><div className="overflow-auto px-4 pb-4"><img src={src} alt="Aperçu de la pièce jointe" className="max-h-[75vh] w-full object-contain"/><a href={src} target="_blank" rel="noreferrer" className="inline-block mt-4 underline">Ouvrir ou télécharger le fichier</a></div></SheetContent></Sheet>
  </>
}
export function formaterValeur(valeur, colInfo) {
  const type = colInfo?.type
  if (valeur === null || valeur === undefined || valeur === '') return ''
  if (typeof valeur === 'boolean') return <span>{valeur ? 'Oui' : 'Non'}</span>
  if (type === 'Attachments' && Array.isArray(valeur)) {
    const ids = valeur[0] === 'L' ? valeur.slice(1) : valeur
    return <span className="inline-flex flex-wrap gap-2">{ids.map(id => <PieceJointe key={id} id={id}/>)}</span>
  }
  if (Array.isArray(valeur)) {
    const items = valeur[0] === 'L' ? valeur.slice(1) : valeur
    return <span className="inline-flex flex-wrap gap-1">{items.map((item, i) => {
      const opt = colInfo?.choiceOptions?.[item] || {}
      return <Badge key={i} variant="secondary" className="h-auto whitespace-normal break-words" style={{ backgroundColor: opt.fillColor, color: opt.textColor }}>{String(item)}</Badge>
    })}</span>
  }
  if (type === 'Choice') {
    const opt = colInfo?.choiceOptions?.[valeur] || {}
    return <Badge variant="secondary" className="h-auto whitespace-normal break-words" style={{ backgroundColor: opt.fillColor, color: opt.textColor }}>{String(valeur)}</Badge>
  }
  if (type === 'Date' || type?.startsWith('DateTime')) {
    const date = typeof valeur === 'number' ? new Date(valeur * 1000) : new Date(valeur)
    if (Number.isNaN(date.getTime())) return <span title="Valeur de date non reconnue">{String(valeur)}</span>
    return type === 'Date' ? date.toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : date.toLocaleString('fr-FR')
  }
  const text = String(valeur)
  if (/^https?:\/\/\S+$/i.test(text)) return <a href={text} target="_blank" rel="noreferrer" className="underline break-all">{text}</a>
  return text
}
