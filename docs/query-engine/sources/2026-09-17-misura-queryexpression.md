<!--
Snapshot — non si modifica.
Provenienza: repository `loom`, `calibration/2026-09-17-queryexpression-operatori/esito.md`
al commit 4a53599 (18 settembre 2026).
Sta qui perché la pagina pubblica cita numeri che vengono da questa misura e non dall'engine:
il codice di rifiuto di `childof`, il limite residuo dichiarato (massimo interrogato 852023),
gli insiemi di esempio dei tre predicati. Una citazione pubblica deve essere verificabile
accanto alla pagina che la fa.
-->

# Sonda — `ChildOf` e `MasksSelect` dal percorso `QueryExpression`

- **Data** 17 settembre 2026 (esecuzione 18 settembre 00:02–00:06) · **ambiente** XrmGhost Dev
  (`xrmghost-dev.crm4.dynamics.com`, org `0c968695-1a66-f011-8ee3-000d3abd4d45`)
- **Occasione** il limite dichiarato in coda a `calibration/2026-09-17-mask-operators/esito.md`,
  e da ieri sera anche sulla pagina pubblica: *«no claim is made here about the QueryExpression path»*
- **Domanda** `ConditionOperator.ChildOf` e `ConditionOperator.MasksSelect` sono accettati o rifiutati
  passando da `RetrieveMultiple` con una `QueryExpression` costruita in codice, invece che da FetchXML?
- **Esito** **i due operatori si separano, e la misura di FetchXML non li prediceva.**
  **`MasksSelect` è ACCETTATO** dal percorso `QueryExpression`, con una semantica bit a bit piena e
  misurabile; **`ChildOf` è RIFIUTATO**, ma con un messaggio che non è `Unknown Condition Operator` —
  è un rifiuto *deliberato e nominato*, che chiude la domanda meglio di quanto la chiudesse il 400 di
  FetchXML.
- **Esito di rimbalzo, non cercato e più caro dei due** la semantica di **`Mask`** stabilita dal
  verbale FetchXML **è sbagliata**, ed è già mergiata in `origin/dev` e già pubblicata: era stata
  fissata su un operando a un solo bit, dove le letture concorrenti coincidono. `Mask` è
  `(v & op) == op`, non `(v & op) != 0` — quest'ultima è la semantica di `MasksSelect`. Confermato su
  **tre colonne** e trenta confronti di insiemi, **zero controesempi**. Vedi § «Il rimbalzo su `Mask`
  e `NotMask`» e § «Conferma su una seconda colonna».

## Metodo

| voce | valore |
|---|---|
| percorso | `ServiceClient.RetrieveMultiple(QueryExpression)` — **mai** FetchXML |
| pacchetto | `Microsoft.PowerPlatform.Dataverse.Client` **1.2.9** |
| assembly | `Microsoft.Xrm.Sdk` versione dichiarata `9.0.0.0`, file version **9.2.49.14828** |
| target | `net8.0` |
| identità | `filippo@agostinilab.it` (sysadmin in DEV), utente `e7c569c5-ca5e-f011-bec2-6045bd99c284` |
| autenticazione | token da `az account get-access-token --resource <org>`, passato al costruttore `ServiceClient(Uri, Func<string,Task<string>>, bool)` — **nessun browser** |
| sorgente | `probe/Program.cs` (giro 1), `probe/Round2.cs` (giro 2), `probe/Round3.cs` (giro 3) |
| output grezzo | `output-grezzo.txt`, `output-grezzo-giro2.txt`, `output-grezzo-giro3.txt` |

### L'inventario SDK: le due versioni sono confrontate, non assunte

Il Framework Host sta su `Microsoft.CrmSdk.CoreAssemblies 9.0.2.45`, questa sonda sul client moderno.
**Entrambi dichiarano assembly version `9.0.0.0`**, quindi la differenza non si legge dal manifest e
va cavata dal file version. Letti con `MetadataLoadContext`:

| pacchetto | file version | membri di `ConditionOperator` | `ChildOf` | `Mask` | `NotMask` | `MasksSelect` |
|---|---|---|---|---|---|---|
| `Microsoft.CrmSdk.CoreAssemblies 9.0.2.45` (host, pinnato) | 9.2.47.9489 | **89** | 45 | 46 | 47 | 48 |
| `Microsoft.PowerPlatform.Dataverse.Client 1.2.9` (sonda) | 9.2.49.14828 | **90** | 45 | 46 | 47 | 48 |

I quattro operatori esistono in entrambi con lo **stesso valore numerico**, quindi **la misura non
dipende dalla versione del pacchetto**: nessuno dei due è stato introdotto o rimosso fra le due, e la
decisione di accettare o rifiutare è del **server**, non dell'inventario client.

**Ma i totali differiscono, e la differenza è informazione.** Il pinnato ha 89 membri — ed è il
denominatore della copertura «87 su 89», che quindi è dichiarata contro l'inventario *del host*. Il
più nuovo ne ha 90: l'aggiunta è **`EqualRoleBusinessId = 89`**, in coda e puramente additiva
(`comm` sui due elenchi: nessun membro rimosso, nessun valore rinumerato). Se un giorno l'inventario
del Framework Host si allineasse, **la copertura diventerebbe «87 su 90» senza che nessuno abbia
scritto una riga**, e il nuovo operatore arriverebbe non misurato. Lo script e gli elenchi stanno in
`enum-inventory/`.

### Bersagli provati

`MasksSelect` — quattro tabelle, scelte perché la domanda avesse senso in modi diversi:

| tabella.colonna | perché |
|---|---|
| `webresource.webresourcetype` | valori **compositi**: è la colonna che ha sciolto la semantica nel verbale FetchXML |
| `roleprivileges.privilegedepthmask` | la casa nominale dell'operatore, le maschere di privilegio |
| `principalobjectaccess.accessrightsmask` | l'altra maschera securitaria |
| `systemuser.accessmode` | con `mask` rendeva valori diversi dall'operando |

`ChildOf` — sei combinazioni su **tre alberi diversi** di Dataverse, più la chiave primaria:
`businessunit.parentbusinessunitid`, `businessunit.businessunitid`, `systemuser.businessunitid`,
`systemuser.parentsystemuserid` (gerarchia manageriale), `role.parentrootroleid`,
`team.businessunitid` — **ciascuna a uno e a zero valori**, perché il primo giro ha mostrato che
l'arità era il vero oggetto del primo rifiuto.

## `MasksSelect` — **ACCETTATO**

Su tutte e quattro le tabelle, `RetrieveMultiple` risponde `200` con righe:

| interrogazione | esito |
|---|---|
| `webresource.webresourcetype` MasksSelect 1 | accettato, 50 righe (TopCount), valori `1,3,5,7,11` |
| `roleprivileges.privilegedepthmask` MasksSelect 4 | accettato, 50 righe, tutte a `4` |
| `principalobjectaccess.accessrightsmask` MasksSelect 1 | accettato, 50 righe, valori `1`, `9`, `852023` |
| `systemuser.accessmode` MasksSelect 1 | accettato, **2 righe**, valori `3` e `5` |

Questo **ribalta il verbale FetchXML**, che lo dava respinto sotto ogni grafia. Le due misure non si
contraddicono: dicono che `masks-select` **non ha una grafia FetchXML** ma **ha un'implementazione
server** raggiungibile dal solo `QueryExpression`. Lo confermano i messaggi d'errore dei casi
degeneri, che parlano dell'operando e **non dell'operatore**:

```
MasksSelect due valori  → -2147220989: The ConditonOperator.MasksSelect requires 1 value/s, not 2. Parameter Name: WebResourceType
MasksSelect zero valori → -2147220989: The ConditonOperator.MasksSelect requires 1 value/s, not 0. Parameter Name: WebResourceType
MasksSelect operando 0  → accettato, 0 righe
MasksSelect su colonna stringa (webresource.name) → -2147204784: Sql error: Generic SQL error. Sql Number: 402
```

Un server che ignorasse l'operatore non ne conoscerebbe l'arità né ne scriverebbe il nome
(`ConditonOperator.MasksSelect`, con il refuso di Microsoft dentro). Il `Sql Number: 402` sulla
colonna stringa — «operand type clash» di SQL Server — è la traccia che l'operatore **arriva fino al
generatore SQL** e prova a fare un AND bit a bit su un `nvarchar`.

### La semantica, misurata

Il conteggio di righe sotto il tetto di pagina non basta a distinguere `MasksSelect` da `Mask`: a
operando `1` rendono lo stesso insieme. Il metodo che le separa non guarda le righe ma
l'**insieme dei valori ammessi**, chiedendo per ogni `v` del dominio noto se esiste una riga che
soddisfa `(webresourcetype eq v) AND (webresourcetype <op> operando)`. La risposta è esatta e non
dipende dal paging.

Dominio realmente presente in DEV: `1,2,3,4,5,6,7,11,12`.

| operando | `Mask` | `MasksSelect` | `NotMask` |
|---|---|---|---|
| 1 `0001` | `1,3,5,7,11` | `1,3,5,7,11` | `2,4,6,12` |
| 2 `0010` | `2,3,6,7,11` | `2,3,6,7,11` | `1,4,5,12` |
| **3 `0011`** | **`3,7,11`** | **`1,2,3,5,6,7,11`** | **`4,12`** |
| **5 `0101`** | **`5,7`** | **`1,3,4,5,6,7,11,12`** | **`2`** |
| **6 `0110`** | **`6,7`** | **`2,3,4,5,6,7,11,12`** | **`1`** |
| **12 `1100`** | **`12`** | **`4,5,6,7,11,12`** | **`1,2,3`** |

Le righe in grassetto sono la misura: a operando multi-bit i tre operatori **divergono**, e la
divergenza è regolare. Le tre semantiche, ciascuna verificata su tutte e sei le righe senza un
controesempio:

- **`Mask`** → `(valore & operando) == operando` — *tutti* i bit dell'operando accesi
- **`MasksSelect`** → `(valore & operando) != 0` — *almeno un* bit acceso
- **`NotMask`** → `(valore & operando) == 0` — *nessun* bit acceso

Verifica a campione: operando `12 = 1100`. `Mask` chiede bit 2 **e** 3 → solo `12 (1100)`; `11 (1011)`
ha il bit 3 ma non il bit 2 ed è escluso. `MasksSelect` chiede bit 2 **o** 3 → `4,5,6,7,12` più `11`
per il bit 3. `NotMask` chiede nessuno dei due → `1,2,3`. Coincide riga per riga.

## `ChildOf` — **RIFIUTATO**, e stavolta nominato

Il primo giro, a **un** valore, ha reso un errore di arità su tutti i bersagli:

```
-2147220989 (0x80040203): Condition operator 'ChildOf' requires that no values are set. Values.Length: 1
  detail[ApiExceptionMessageName] = InvalidArgument
  detail[ApiExceptionHttpStatusCode] = 400
  detail[ApiExceptionSourceKey] = Plugin/Microsoft.Crm.ObjectModel.BusinessUnitService
```

**Quello era l'esito (c): non aveva misurato niente.** Non è un rifiuto dell'operatore, è il server
che dice che la mia condizione ha l'arità sbagliata — e nel dirlo rivela che `ChildOf` è un operatore
**noto e nullario**. Riprovato a **zero** valori, su tutti e sei i bersagli, la risposta cambia
messaggio e codice:

```
-2147217120 (0x800400E0): The child-of operator is not valid for standard queries.
                          It is for internal crm infrastructure use only via OutlookSync queries.
```

Identico su `businessunit.parentbusinessunitid`, `businessunit.businessunitid`,
`systemuser.businessunitid`, `systemuser.parentsystemuserid`, `role.parentrootroleid`,
`team.businessunitid`. **Questo chiude il limite meglio di come lo chiudeva FetchXML**: non è un
operatore sconosciuto al vocabolario, è un operatore **riservato** che la piattaforma rifiuta
esplicitamente alle query ordinarie, dicendo per chi è. Il «for internal use only» della
documentazione SDK non è una nota di stile: è il predicato che il server applica.

Contesto dei dati, perché «zero righe» non si confonda con «rifiutato»: la gerarchia di BU in DEV
**ha** un secondo livello (`XrmGhost` è figlia di `xrmghost-dev`), quindi un `ChildOf` accettato
avrebbe avuto qualcosa da rendere. Non è arrivato a quel punto.

## Il rimbalzo su `Mask` e `NotMask`

Il verbale FetchXML fissa `mask` come `(valore & operando) != 0` e aggiunge che `not-mask` è
«l'una il complemento dell'altra». **Entrambe le affermazioni sono vere solo a operando di un bit
solo**, che è l'unico operando che quella sonda ha provato (`mask 1`, `not-mask 1`).

La misura qui sopra dice che:
- `Mask` è `== operando`, **non** `!= 0`. La lettura `!= 0` del verbale è in realtà la semantica di
  **`MasksSelect`**, l'operatore che quel verbale aveva concluso non esistere.
- `Mask` e `NotMask` **non sono complementari**: a operando `3`, `Mask` rende `{3,7,11}` e `NotMask`
  rende `{4,12}` — i valori `1,2,5,6` non stanno in nessuno dei due. Il complemento di `NotMask` è
  `MasksSelect`.

È la stessa forma di errore due volte: **una semantica scelta su un caso in cui le ipotesi
concorrenti danno la stessa risposta**. A operando `1` le tre letture `== operando`, `!= 0` e
`== bit 0` coincidono, e il discriminante non era la tabella — quella era già stata scelta bene — era
l'**operando**. Il verbale precedente si era fermato a `1` perché la domanda di allora era «è
securitario o bit a bit», e per quella `1` bastava.

**Conseguenza operativa: la correzione arriva DOPO, su codice in servizio.**
`origin/dev` di `xrmghost-framework-host` implementa `mask` come `(value & mask) != 0`:

```csharp
// QueryEngine/Operators/BitmaskEvaluators.cs, su origin/dev
public sealed class MaskEvaluator : BitwiseMaskEvaluator          // ← sbagliato: è MasksSelect
{
    protected override bool Holds(int value, int mask) => (value & mask) != 0;
}
public sealed class NotMaskEvaluator : BitwiseMaskEvaluator        // ← corretto
{
    protected override bool Holds(int value, int mask) => (value & mask) == 0;
}
```

Il commento XML sopra `MaskEvaluator` dichiara anche l'errore a parole — *«share at least one set
bit»*, *«Not equality»* — e porta l'esempio di `systemuser.accessmode` con maschera `1`, che è
precisamente l'operando a un bit su cui le due letture coincidono. **`notmask` è giusto, `mask` no**:
implementa la semantica di `MasksSelect`. Sbaglia sui soli operandi multi-bit, cioè esattamente sui
casi per cui una maschera esiste, e insieme al codice è sbagliata la pagina pubblica messa online il
17 settembre, che dichiara lo stesso predicato ai clienti.

> **Ritiro di un'affermazione di questo stesso verbale.** Una versione precedente diceva che nel
> workspace non c'era codice che nominasse questi operatori, e quindi che la correzione precedeva
> l'implementazione. **Era falso, e la causa era il checkout:** `xrmghost-framework-host` in locale
> è indietro rispetto a `origin/dev`, dove gli evaluator di ADO-2308 sono già mergiati. Un `grep`
> sull'albero di lavoro risponde sullo stato del checkout, non su quello del ramo: si legge con
> `git show origin/dev:<path>`. È la terza volta in questo verbale che la stessa forma d'errore si
> presenta — **una conclusione tratta da un campione che non conteneva il caso discriminante**.

## Conferma su una seconda colonna

La tabella della divergenza qui sopra viene da `webresource.webresourcetype` **sola**, ed è la stessa
base su cui il verbale di ieri ha sbagliato: allora il discriminante mancante era la colonna, ieri
l'operando. Una colonna sola non esclude una peculiarità di quella colonna, e qui la conseguenza è
codice già in `dev` più una pagina pubblicata: un «probabilmente» non vale niente.

**Metodo.** Lo stesso degli insiemi — per ogni `v` del dominio, `(attr eq v) AND (attr <op> operando)`
— con due irrigidimenti. Primo: il dominio è **scoperto** con `Distinct = true` e non assunto, perché
un insieme vuoto per assenza di dati è indistinguibile da un insieme vuoto per semantica. Secondo:
l'esito non si legge a occhio, si **confronta l'insieme osservato con quello previsto dalla formula**
calcolata in processo, e si stampano separatamente i *previsti-non-resi* e i *resi-non-previsti*. Un
solo scostamento è un controesempio. Sorgente: `probe/Round3.cs`, output `output-grezzo-giro3.txt`.

### `principalobjectaccess.accessrightsmask` (la seconda colonna)

Maschera di diritti a bit indipendenti. Dominio distinto in DEV: `0,1,5,9,21,786487,852023` — di cui
**cinque multi-bit** (`5,9,21,786487,852023`), quindi non il caso degenere delle sole potenze di due.

| operando | `Mask` | `MasksSelect` | `NotMask` |
|---|---|---|---|
| 3 `0b11` | `786487,852023` | `1,5,9,21,786487,852023` | `0` |
| 5 `0b101` | `5,21,786487,852023` | `1,5,9,21,786487,852023` | `0` |
| 9 `0b1001` | `9` | `1,5,9,21,786487,852023` | `0` |
| 12 `0b1100` | *(nessuno)* | `5,9,21,786487,852023` | `0,1` |
| 65537 `0b1…1` | `852023` | `1,5,9,21,786487,852023` | `0` |
| 852023 (8 bit) | `852023` | `1,5,9,21,786487,852023` | `0` |

Sei operandi multi-bit, **tutti e tre gli operatori coincidono con il previsto su tutti**. La
divergenza è massima e non lascia margine: a operando `12`, `Mask` rende **l'insieme vuoto** dove
`MasksSelect` rende cinque valori; a operando `9`, `Mask` rende il solo `9` dove `MasksSelect` ne
rende sei.

### `savedquery.querytype` (la terza)

Aggiunta per non far riposare la conferma su due sole colonne. Dominio di 19 valori distinti, ma un
**solo** multi-bit (`4230`): discrimina meno, e lo si dice. Quattro operandi, tutti coincidenti; il
caso che parla è l'operando `6`, dove `Mask` rende `{4230}` e `MasksSelect` rende `{2,4,4230}`.

### Verdetto

**CONFERMATO, senza mediazioni.** Tre colonne (`webresourcetype`, `accessrightsmask`, `querytype`),
dieci combinazioni colonna/operando, tre operatori ciascuna: **trenta confronti fra insieme osservato
e insieme previsto, zero scostamenti, zero controesempi.**

- **`Mask`** = `(v & op) == op` — confermato
- **`MasksSelect`** = `(v & op) != 0` — confermato
- **`NotMask`** = `(v & op) == 0` — confermato

Le tre semantiche non sono una peculiarità di `webresourcetype`.

## Il limite di questa misura

Cosa resta non osservato anche dopo questa sonda:

1. **La semantica di `MasksSelect` è misurata su un solo tipo di colonna: `Integer`/`Picklist`.**
   `webresourcetype` è una picklist e `privilegedepthmask` un intero. Non è stato provato su
   `BigInt`, su `Decimal`, né su una colonna `Money`. Il `Sql Number: 402` sulla stringa dice che
   non c'è una conversione implicita, ma non dice dove sta il confine dei tipi numerici.
2. **Non è stato provato su una colonna custom.** Tutte le tabelle qui sono di sistema. Se il
   generatore SQL trattasse diversamente un attributo custom (colonna in una vista `_base` diversa),
   non si vedrebbe.
3. **Il bit 6 e oltre non sono coperti.** Il dominio di `webresourcetype` arriva a `12`, quindi gli
   operandi provati usano i primi quattro bit. Un operando con bit alti — e soprattutto un operando
   **negativo** o oltre `2^31` — non è stato interrogato, e lì vive la differenza fra un AND a 32 e a
   64 bit, più la questione del segno.
4. **`ChildOf` non è stato provato dal percorso per cui esiste.** Il messaggio nomina «OutlookSync
   queries»: la sonda ha stabilito che *le query ordinarie* lo rifiutano, su tre alberi e a entrambe
   le arità, e questo è ciò che serve al QueryEngine mock. Non ha stabilito cosa faccia dentro
   OutlookSync, che è un percorso che non si raggiunge da `RetrieveMultiple`.
5. **Una sola organizzazione, un solo istante.** DEV, 18 settembre 2026. `MasksSelect` è accettato da
   un server la cui versione non è stata registrata (`RefreshInstanceDetails` — la chiamata che la
   riporta — è fallita su una risposta HTML, cfr. nota sotto): se la piattaforma lo deprecasse, questa
   misura non lo prevede. La stessa cautela che il verbale FetchXML meritava e non ha avuto.
6. **`EqualRoleBusinessId` non è stato interrogato.** È il novantesimo operatore, presente nel
   pacchetto della sonda e assente in quello pinnato dal host (cfr. § inventario). Non rientrava
   nella domanda e non è stato provato: sta qui perché è l'unico membro dell'enum che questa sonda
   ha *visto* senza misurare.
7. **La conferma delle tre semantiche non copre gli operandi a bit alti né il segno.** È replicata
   su tre colonne, ma l'operando più grande interrogato è `852023` (bit 19) e tutti i valori dei
   domini stanno in `Int32` positivo. Un operando negativo, oltre `2^31`, o una colonna `BigInt`
   restano fuori: è lo stesso confine del limite 3, che la seconda colonna ha allargato ma non
   chiuso.

Nota tecnica su un fallimento **non** rilevante per la domanda: `ServiceClient.ConnectedOrgUniqueName`
solleva `DataverseConnectionException` perché `RefreshInstanceDetails` riceve HTML invece di JSON. La
connessione e tutte le `RetrieveMultiple` funzionano; la prova di connessione qui è un `WhoAmI`
eseguito. Non è stato indagato: non tocca l'oggetto della misura.

## Come rifarla

```bash
cd probe
export DV_ORG=https://xrmghost-dev.crm4.dynamics.com
export DV_TOKEN=$(az account get-access-token --resource $DV_ORG --query accessToken -o tsv)
dotnet run                        # giro 1: i due operatori, otto casi
DV_ROUND2=1 dotnet run            # giro 2: la semantica, ChildOf a zero valori, l'arita'
DV_ROUND3=1 dotnet run            # giro 3: la conferma su seconda e terza colonna, osservato vs previsto
```

Il token si prende **fuori** dal processo e si passa in `DV_TOKEN`: sotto WSL `az` è la CLI di
Windows, e invocarla da `ProcessStartInfo` aggiunge un modo di fallire che non c'entra con la
domanda. `pac env fetch` non è stato usato di proposito — va in stack overflow su `not-mask`, ed è un
difetto del CLI, non una risposta di Dataverse.
