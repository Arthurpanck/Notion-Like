import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const { Carte } = await server.ssrLoadModule('/src/Carte.jsx')
const { Tableau } = await server.ssrLoadModule('/src/Tableau.jsx')
const { Galerie } = await server.ssrLoadModule('/src/Galerie.jsx')
const { formaterValeur } = await server.ssrLoadModule('/src/formaterValeur.jsx')
const props = { colonnes:['Photo','Nom','Statut','Publie'], colInfos:{Photo:{type:'Attachments'},Nom:{type:'Text'},Statut:{type:'Choice'},Publie:{type:'Bool'}}, record:{id:1,Photo:null,Nom:'Mon projet',Statut:'En cours',Publie:false}, onOpen:()=>{}, onSelect:()=>{} }
test('card has an explicit named opening button',()=>assert.match(renderToStaticMarkup(createElement(Carte,props)),/aria-label="Ouvrir la fiche Mon projet"/))
test('title is rendered as card heading',()=>assert.match(renderToStaticMarkup(createElement(Carte,props)),/Mon projet<\/button>/))
test('Boolean false remains visible',()=>assert.match(renderToStaticMarkup(createElement(Carte,props)),/>Non<\/span>/))
test('detail renders all fields',()=>assert.match(renderToStaticMarkup(createElement(Carte,{...props,isDetail:true})),/Statut/))
test('table has a named title button instead of click-only row',()=>assert.match(renderToStaticMarkup(createElement(Tableau,{...props,records:[props.record]})),/<button[^>]*>Mon projet<\/button>/))
test('gallery is responsive and opens records',()=>assert.match(renderToStaticMarkup(createElement(Galerie,{...props,records:[props.record]})),/grid-cols-1 sm:grid-cols-2/))
test('http link is actionable',()=>assert.match(renderToStaticMarkup(formaterValeur('https://example.org',{})),/href="https:\/\/example.org"/))
test('javascript strings remain inert text',()=>assert.doesNotMatch(renderToStaticMarkup(createElement('div',null,formaterValeur('javascript:alert(1)',{}))),/<a /))
test('invalid date does not emit Invalid Date',()=>assert.doesNotMatch(renderToStaticMarkup(formaterValeur('not-a-date',{type:'Date'})),/Invalid Date/))
test.after(()=>server.close())
