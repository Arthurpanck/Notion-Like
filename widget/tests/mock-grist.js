// Development fixture only. No real Grist data or authentication is used.
const rows = [
  {id:1,Photo:null,Nom:'École des données',Statut:'En cours',Tags:['L','Éducation','Numérique'],Publie:true,Resume:'Une description longue pour vérifier la lecture des cartes et des fiches.',Lien:'https://example.org'},
  {id:2,Photo:null,Nom:'Route 10',Statut:'Terminé',Tags:['L','Territoire'],Publie:false,Resume:'Projet terminé.'},
  {id:3,Photo:null,Nom:'Route 2',Statut:'',Tags:['L'],Publie:false,Resume:'Aucun statut.'},
  {id:4,Photo:null,Nom:'',Statut:'En cours',Tags:['L','Numérique'],Publie:true},
]
const columnIds = ['Photo','Nom','Statut','Tags','Publie','Resume','Lien']
const labels = ['Photo','Nom','Statut','Domaines','Publié','Résumé','Lien']
const types = ['Attachments','Text','Choice','ChoiceList','Bool','Text','Text']
let onRecords, onOptions
let options = { titre:'Bibliothèque de test', kanbanVues:[{id:1,champ:'Statut'}], ordreVues:['kanban-1','galerie','tableau'] }
const params = new URLSearchParams(location.search)
window.grist = {
  onRecords(callback) { onRecords = callback },
  onOptions(callback) { onOptions = callback },
  ready() { queueMicrotask(() => { onOptions(options,{access_level:'full'}); onRecords(params.has('empty') ? [] : [...rows]) }) },
  async setOptions(next) { if (params.has('save-error')) throw Error('Fixture save error'); options = next; onOptions(options,{access_level:'full'}) },
  getTable() { return { async getTableId() { return 'Demo' }, async update({id,fields}) { if (params.has('move-error')) throw Error('Fixture move error'); Object.assign(rows.find(r=>r.id===id),fields); onRecords([...rows]) } } },
  docApi: { async fetchTable(name) {
    if (name === '_grist_Tables') return {id:[1],tableId:['Demo'],rawViewSectionRef:[1]}
    if (name === '_grist_Views_section_field') return {id:columnIds.map((_,i)=>i+1),parentId:columnIds.map(()=>1),colRef:columnIds.map((_,i)=>i+1),parentPos:columnIds.map((_,i)=>i)}
    return {id:columnIds.map((_,i)=>i+1),parentId:columnIds.map(()=>1),colId:columnIds,label:labels,type:types,isFormula:columnIds.map(()=>false),widgetOptions:columnIds.map(c=>c==='Statut'?JSON.stringify({choices:['En cours','Terminé','À démarrer']}):'{}')}
  } }
}
