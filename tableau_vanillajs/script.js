grist.ready({ requiredAccess: 'full'});

grist.onRecords(function (records) {
    // conteneur
    const listeEl = document.getElementById('liste');
    listeEl.replaceChildren();

    // tableau dans conteneur
    const table = document.createElement('table');
    listeEl.appendChild(table);

    // listes des colonnes
    const colonnes = Object.keys(records[0]).filter(function (nom) {
        return nom !== 'id';
    });

    // En-tête
    const trEntete = document.createElement('tr');
    colonnes.forEach(function (nom) {
        const th = document.createElement('th');
        th.textContent = nom;
        trEntete.appendChild(th);
    });
    table.appendChild(trEntete);
    
    // lignes
    records.forEach(function (record) {
        const tr = document.createElement('tr');
        colonnes.forEach(function (nom) {
            const td = document.createElement('td');
            td.textContent = record[nom];
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
});

function formaterValeur(valeur) {
    
}