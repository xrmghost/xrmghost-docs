# Contratti sorgente — snapshot di sola lettura

Questi file **non sono codice di questo repo**: sono copie, prese il 18 settembre 2026, di sorgenti
di `xrmghost-framework-host` al commit `ff32df7` (branch `dev`). Hanno l'estensione `.txt` proprio
perché nessuno provi a compilarli, e stanno fuori da `src/content/`, quindi non vengono pubblicati.

Sono **copie di sola lettura**. Non si modificano a mano — né per correggere un refuso, né per
allineare una riga a ciò che la pagina pubblica dice: una modifica qui direbbe dell'engine una cosa
che l'engine non dice, e la derivazione verificabile — si confrontano due file che stanno l'uno
accanto all'altro — smetterebbe di esserlo. L'unico modo legittimo di cambiarli è **sostituirli
interi** da un commit dell'engine, con la procedura più sotto.

## Perché stanno qui

La pagina pubblica di copertura degli operatori QueryEngine (ADO-2309) si **trascrive** da ciò che
l'engine dichiara, e non si inventa. La matrice generata
(`../operator-support-matrix.generated.md`) risponde a «quali operatori, con quale disposizione, e
con quale contesto richiesto», ma **non** contiene due cose che la pagina deve dire al cliente:

- **la grafia FetchXML** di ogni operatore — è quella che il cliente scrive. `FetchXmlOperatorMap`
  porta le sole grafie che la normalizzazione non raggiunge da sé; l'elenco completo, operatore per
  operatore, sta in `OperatorContractTests`, che è anche l'unico posto dove è visibile il **pin di
  pacchetto** (l'assembly dice `9.0.0.0` qualunque versione l'abbia portato);
- **cosa succede se il contesto non c'è** — i default documentati e la traccia, non un errore —
  che sta nel risolutore del contesto di esecuzione.

Copiare i contratti qui è la scelta opposta a costruire un collegamento automatico di
rigenerazione fra i due repo: la copertura è chiusa a 88 operatori su 89 e non è prevista
evoluzione continua, quindi una copia datata e firmata costa meno di un'infrastruttura permanente.
Il prezzo di quella scelta è dichiarato: **la manutenzione è manuale**, e sta scritta qui e nella
guida contributor (`../../../src/content/docs/contributing/public-docs-workflow.mdx`), che è la
procedura contributor autorevole — l'unica pubblicata — mentre questo README documenta gli snapshot
e la loro provenienza.

## La provenienza corrente

| | |
|---|---|
| repo | `xrmghost-framework-host` |
| branch | `dev` |
| commit | `ff32df7` |
| preso il | 18 settembre 2026 |
| pin SDK | `Microsoft.CrmSdk.CoreAssemblies` **9.0.2.45** |

**`AssemblyVersion 9.0.0.0` non è il pin.** Il pacchetto 9.0.2.45 spedisce un assembly la cui
`AssemblyVersion` è `9.0.0.0` e la cui `FileVersion` è `9.2.47.9489`: `9.0.0.0` resta `9.0.0.0`
qualunque versione del pacchetto l'abbia portato, quindi non identifica l'inventario di operatori
contro cui l'engine è scritto. Il numero che lo identifica è la versione del **pacchetto**, ed è
visibile solo in `OperatorContractTests.cs.txt`. Citare `9.0.0.0` come pin renderebbe il
riferimento pubblico non riproducibile: due inventari diversi si presenterebbero con lo stesso
numero.

L'equivoco ha una porta d'ingresso precisa, e va conosciuta: l'intestazione di
`../operator-support-matrix.generated.md` scrive `SDK Microsoft.Xrm.Sdk 9.0.0.0` e rimanda a
`OperatorContractTests.cs` per il pin. Chi prende il numero da lì prende l'`AssemblyVersion`
credendo di prendere il pin: il pin è `9.0.2.45`, e la matrice non lo porta.

## Dove si leggono le grafie FetchXML

**La fonte è `OperatorContractTests.cs.txt`**, campo `FetchXmlSpellings`: è lì che stanno le grafie
di tutti e 89 gli operatori dell'inventario SDK — 92 voci, perché `Equal` e `NotEqual` accettano più
di una grafia (`eq`/`equal`, `ne`/`neq`/`notequal`) — insieme al pin di pacchetto.

`FetchXmlOperatorMap.cs.txt` **non basta**, ed è l'errore facile da fare: quella tabella porta 24
voci, cioè le sole grafie che `OperatorIdentity.Normalize` non raggiunge da sé (le forme brevi
`eq`, `ne`, `lt`, `le`, `gt`, `ge`; le negative che FetchXML scrive diversamente dall'SDK come
`not-contain`; la settimana per esteso `last-seven-days`; le forme `eq-`/`ne-` degli operatori
contestuali; le forme di gerarchia che nominano prima l'uguaglianza, come `eq-or-under`). Tutte le
altre grafie differiscono dal nome SDK per i soli separatori e non compaiono in quella tabella
proprio perché la normalizzazione le riconcilia. Dedurre da lì l'elenco completo significa
perderne la maggior parte.

**E risolvere una grafia non è supportare un operatore.** `FetchXmlOperatorMap` risponde a «quale
operatore è questo»; se l'engine sappia valutarlo è risposta di `IConditionEvaluatorRegistry.IsSupported`.
Una chiave senza evaluator registrato — gli operatori di calendario fiscale, i contestuali, quelli
di gerarchia — si risolve nella sua identità e viene poi rifiutata. Usare la presenza di una grafia
come prova del supporto darebbe per coperti operatori che l'engine rifiuta di proposito.

## I file

| file | risponde a |
|---|---|
| `FetchXmlOperatorMap.cs.txt` | le sole grafie FetchXML che `OperatorIdentity.Normalize` non raggiunge da sé — 24 voci nel dizionario `_aliases`. **Non è l'elenco completo**: quello è `OperatorContractTests.cs.txt` (campo `FetchXmlSpellings`), con le grafie di tutti e 89 gli operatori. E risolvere una grafia non è supportare un operatore: il supporto lo dichiara `IConditionEvaluatorRegistry.IsSupported` |
| `OperatorSupportStatus.cs.txt` | le tre disposizioni: supportato, rifiutato di proposito col motivo, non coperto |
| `IConditionEvaluator.cs.txt` | il contratto di un evaluator e i requisiti di contesto che dichiara |
| `NotSupportedQueryOperatorException.cs.txt` | che cosa legge chi incontra un rifiuto |
| `MockQueryExecutionContext.cs.txt` | cosa contiene il contesto di esecuzione |
| `MockQueryExecutionContextResolver.cs.txt` | come il contesto si risolve, e i default quando i record non ci sono |
| `OperatorContractTests.cs.txt` | l'inventario congelato: le grafie FetchXML di tutti gli 89 operatori (`FetchXmlSpellings`, 92 voci) e il pin di pacchetto `Microsoft.CrmSdk.CoreAssemblies` 9.0.2.45 — l'unico posto dove il pin è scritto |

## Se un giorno l'engine cambia

Non c'è nessuna automazione che se ne accorga, e non deve essercene: niente CI che confronti i due
repo, nessun generatore, nessun verificatore, nessun collegamento automatico cross-repo. Si sceglie
un commit di `xrmghost-framework-host` e si sostituisce a mano, **in quest'ordine**:

1. **`docs/query-engine/operator-support-matrix.generated.md`** — rigenerata dal nuovo commit di
   `xrmghost-framework-host`. È l'inventario da cui si trascrivono disposizioni, contesto richiesto
   e motivi dei rifiuti, quindi viene prima di tutto il resto.
2. **Le sette copie `.cs.txt`** di questa cartella, sostituite intere dallo stesso commit.
3. **La riga di provenienza** — commit e data — qui sopra nella tabella «La provenienza corrente»,
   nell'intestazione della matrice generata, e nel blocco di provenienza della pagina pubblica.
4. **La ri-trascrizione e la review manuale** di `src/content/docs/query-engine/operator-support.mdx`,
   confrontandola con la matrice e con le sette copie. Il confronto con le fonti **è** la review:
   non lo fa nessuno strumento.

**Sostituire i soli `.cs.txt` lasciando pubblica la matrice vecchia è la cosa da non fare.** Le
disposizioni — supportato, rifiutato col motivo, non coperto — e il contesto richiesto li porta la
matrice, non le copie dei contratti: aggiornare le seconde e non la prima pubblicherebbe le
disposizioni di un engine che non esiste più, con accanto una provenienza che dice che sono
attuali. È la forma di errore che nessun gate qui intercetta, perché l'unico gate automatico di
questo flusso è `npm run build`, che verifica che il sito compili e non che dica il vero.

La sorveglianza periodica dei nuovi operatori SDK **non appartiene a questo flusso**: è una
ricognizione dedicata, ADO-2349.
