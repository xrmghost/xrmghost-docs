# Contratti sorgente — snapshot di sola lettura

Questi file **non sono codice di questo repo**: sono copie, prese il 17 settembre 2026, di sorgenti
di `xrmghost-framework-host` al commit `67e9d3e` (branch `dev`). Hanno l'estensione `.txt` proprio
perché nessuno provi a compilarli, e stanno fuori da `src/content/`, quindi non vengono pubblicati.

## Perché stanno qui

La pagina pubblica di copertura degli operatori QueryEngine (ADO-2309) si **trascrive** da ciò che
l'engine dichiara, e non si inventa. La matrice generata
(`../operator-support-matrix.generated.md`) risponde a «quali operatori, con quale disposizione, e
con quale contesto richiesto», ma **non** contiene due cose che la pagina deve dire al cliente:

- **la grafia FetchXML** di ogni operatore — è quella che il cliente scrive, e sta in
  `FetchXmlOperatorMap`;
- **cosa succede se il contesto non c'è** — i default documentati e la traccia, non un errore —
  che sta nel risolutore del contesto di esecuzione.

Copiare i contratti qui è la scelta opposta a costruire un collegamento automatico di
rigenerazione fra i due repo: la copertura è chiusa a 87 operatori su 89 e non è prevista
evoluzione continua, quindi una copia datata e firmata costa meno di un'infrastruttura permanente.

## I file

| file | risponde a |
|---|---|
| `FetchXmlOperatorMap.cs.txt` | la grafia FetchXML di ogni operatore, e quali grafie la normalizzazione raggiunge da sé |
| `OperatorSupportStatus.cs.txt` | le tre disposizioni: supportato, rifiutato di proposito col motivo, non coperto |
| `IConditionEvaluator.cs.txt` | il contratto di un evaluator e i requisiti di contesto che dichiara |
| `NotSupportedQueryOperatorException.cs.txt` | che cosa legge chi incontra un rifiuto |
| `MockQueryExecutionContext.cs.txt` | cosa contiene il contesto di esecuzione |
| `MockQueryExecutionContextResolver.cs.txt` | come il contesto si risolve, e i default quando i record non ci sono |

## Se un giorno l'engine cambia

Si sostituiscono le copie e si aggiorna il commit qui sopra. **Non si modificano a mano**: una
modifica qui direbbe dell'engine una cosa che l'engine non dice.
