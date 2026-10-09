import { useMemo, useRef, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Carte } from './Carte'
import { groupRecords, recordTitle } from './lib/viewModel'

function DraggableCard({ record, cardProps, onSelect, canMove }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: `record-${record.id}`, disabled: !canMove, data: { rowId: record.id } })
  return <div ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative">
    {canMove && <button ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`Déplacer ${recordTitle(record, cardProps.colonnes, cardProps.colInfos, cardProps.titreChamp)}`} className="absolute top-2 right-2 z-10 rounded bg-background border p-2 cursor-grab"><GripVertical size={16}/></button>}
    <Carte record={record} {...cardProps} onOpen={() => onSelect(record.id)}/>
  </div>
}
function Column({ group, color, children, canConfigure }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: `column-${group.key}`, disabled: { draggable: !canConfigure, droppable: false }, data: { groupKey: group.key } })
  return <section ref={setNodeRef} aria-label={`${group.label}, ${group.records.length} fiches`} className={`w-[280px] max-w-[85vw] shrink-0 rounded-lg border bg-muted/30 p-3 ${isOver ? 'ring-2 ring-ring' : ''}`} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, borderTop: `4px solid ${color}` }}>
    <header className="flex items-start gap-2 mb-3">
      {canConfigure && <button ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`Réordonner la colonne ${group.label}`} className="rounded p-1 cursor-grab"><GripVertical size={16}/></button>}
      <h2 className="font-semibold break-words flex-1">{group.label}</h2><span className="text-sm text-muted-foreground">{group.records.length}</span>
    </header>
    <div className="flex flex-col gap-3 min-h-24">{children}{!group.records.length && <p className="text-sm text-muted-foreground">Aucune fiche</p>}</div>
  </section>
}
export function Kanban({ records, colonnes, colInfos, champ, ordreColonnesEnregistre, onReorderColumns, onSelect, onMove, canMove, canConfigure, ...displayProps }) {
  const [activeId, setActiveId] = useState(null)
  const scrollRef = useRef(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const groups = useMemo(() => {
    const all = groupRecords(records, champ, colInfos)
    const order = ordreColonnesEnregistre || []
    const index = group => { const i = order.indexOf(group.key); return i >= 0 ? i : order.indexOf(group.label) >= 0 ? order.indexOf(group.label) : 9999 }
    return all.sort((a, b) => index(a) - index(b))
  }, [records, champ, colInfos, ordreColonnesEnregistre])
  const cardProps = { colonnes, colInfos, ...displayProps }
  const activeRecord = records.find(r => `record-${r.id}` === activeId)
  return <>
    <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
      <span>{groups.length} groupes. Faites défiler horizontalement pour les parcourir.</span>
      <button className="rounded border px-3 py-2" aria-label="Voir les colonnes précédentes" onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>← Précédentes</button>
      <button className="rounded border px-3 py-2" aria-label="Voir les colonnes suivantes" onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>Suivantes →</button>
    </div>
    <DndContext sensors={sensors} onDragStart={e => setActiveId(e.active.id)} onDragCancel={() => setActiveId(null)} onDragEnd={e => {
      setActiveId(null)
      const { active, over } = e
      if (!over || active.id === over.id) return
      if (String(active.id).startsWith('column-') && String(over.id).startsWith('column-') && canConfigure) {
        const ids = groups.map(g => `column-${g.key}`)
        const from = ids.indexOf(active.id), to = ids.indexOf(over.id)
        if (from >= 0 && to >= 0) onReorderColumns(arrayMove(groups.map(g => g.key), from, to))
      } else if (active.data.current?.rowId && over.data.current?.groupKey && canMove) onMove(active.data.current.rowId, over.data.current.groupKey)
    }}>
      <SortableContext items={groups.map(g => `column-${g.key}`)} strategy={horizontalListSortingStrategy}>
        <div ref={scrollRef} tabIndex={0} role="region" aria-label="Colonnes du kanban" className="flex gap-4 items-start overflow-x-auto pb-4 focus-visible:outline-2 focus-visible:outline-ring">
          {groups.map(group => <Column key={group.key} group={group} color={colInfos[champ]?.choiceOptions?.[group.value]?.fillColor || '#64748b'} canConfigure={canConfigure}>{group.records.map(record => <DraggableCard key={record.id} record={record} cardProps={cardProps} onSelect={onSelect} canMove={canMove}/>)}</Column>)}
        </div>
      </SortableContext>
      <DragOverlay>{activeRecord ? <Carte record={activeRecord} {...cardProps}/> : null}</DragOverlay>
    </DndContext>
  </>
}
