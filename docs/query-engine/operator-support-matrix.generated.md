<!--
  SNAPSHOT — non è la sorgente, ne è la copia versionata qui accanto.

  Provenienza:
    repo    xrmghost-framework-host
    branch  dev
    commit  67e9d3e
    file    docs/query-engine/operator-support-matrix.generated.md
    SDK     Microsoft.Xrm.Sdk 9.0.0.0 (pin congelato in Tests/QueryEngine/OperatorContractTests.cs)
    preso   17 settembre 2026

  Perché sta qui (ADO-2309): la pagina pubblica di copertura degli operatori si TRASCRIVE da
  questo file e non si inventa. Tenerne la copia nel repo che pubblica la pagina rende la
  derivazione verificabile — si confrontano due file che stanno l'uno accanto all'altro —
  senza costruire un collegamento automatico di rigenerazione fra i due repo, che sarebbe
  infrastruttura permanente al servizio di un evento che non ci aspettiamo: la copertura è
  chiusa a 87 operatori su 89 e i nuovi operatori sono sorvegliati da una ricognizione
  periodica dedicata.

  Se un giorno la matrice a monte cambia, questo file si sostituisce con la nuova copia e si
  aggiorna la riga `commit` qui sopra. Non si modifica a mano: una modifica qui direbbe
  dell'engine una cosa che l'engine non dice.
-->

<!--
  GENERATED FILE — do not edit by hand.
  Produced by QueryEngine/Diagnostics/OperatorSupportMatrixGenerator.cs and checked
  against this copy by OperatorSupportMatrixGeneratorTests; an edit made here is
  reverted by the next generation, and a claim changed here without changing the
  engine turns the test red.
-->

# QueryEngine operator support matrix

Every condition operator the pinned Dataverse SDK declares, with the answer the mock
QueryEngine gives for it. The inventory is read from
`Microsoft.Xrm.Sdk.Query.ConditionOperator` by reflection and frozen member by member in
`Tests/QueryEngine/OperatorContractTests.cs`, which is the only place the pin is visible:
the shipped assembly carries version 9.0.0.0 whatever package version brought it in.

**Canonical key** is the name every part of the engine uses for the operator, derived the
way `QueryExpressionFrontend` derives it: the SDK member name lowercased. FetchXml
spellings (`not-begin-with`, `last-seven-days`) are translated to it by
`FetchXmlOperatorMap`; they are not separate operators.

**Supported** is not a yes/no. It is one of three dispositions the registry declares once
`OperatorEvaluatorBootstrapper.RegisterAll` has run, and the difference between the two
negative ones is the point: `yes` means an evaluator is registered for that key;
`no (deliberate)` means the engine refuses the operator on purpose and the **Reason** column
says why, so the refusal is a decision with a cause behind it; a bare `no` means no
evaluator is registered and nothing has been decided — the operator is simply not covered
yet, which is a gap and not a judgement. Both frontends ask the same registry, so an
operator that is not `yes` is refused identically whether the query arrived as a
`QueryExpression` or as FetchXml, and the reason travels with the refusal into the
`NotSupportedQueryOperatorException` message.

**Context required** is what the evaluator declares it needs beyond the record itself —
the instant, the caller's time zone, the organisation's first day of the week, the
caller's identity, the organisation's fiscal calendar, the caller's interface language,
the teams the caller belongs to, the caller and their descendants in the user hierarchy
together with that whole set's teams. It is a resolution requirement and
never an entitlement: an operator that needs context and finds none is evaluated against
documented defaults, not refused.

The five structural hierarchy operators — `above`, `aboveorequal`, `under`,
`underorequal`, `notunder` — say `none` here and are not thereby answerable from the row
alone: what they need is a traversal of the records the query itself names, resolved once
per plan by `InMemoryExecutor` before the first row. That is a different question from
"what does the caller's context hold", which is the only question this column asks.

| | |
| --- | --- |
| Operators in the SDK inventory | **89** |
| Supported | **87** |
| Not supported | **2** |
| — of those, deliberately rejected with a reason | **2** |
| — of those, not covered and not classified | **0** |

| Canonical key | SDK member | SDK value | Supported | Context required | Reason |
| --- | --- | ---: | --- | --- | --- |
| `above` | `Above` | 78 | yes | none | — |
| `aboveorequal` | `AboveOrEqual` | 79 | yes | none | — |
| `beginswith` | `BeginsWith` | 54 | yes | none | — |
| `between` | `Between` | 10 | yes | none | — |
| `childof` | `ChildOf` | 45 | no (deliberate) | — | The SDK reference marks ChildOf "for internal use only", and the platform refuses it on every attribute it has been tried on (ADO-2307: eight rejections out of eight), so there is no observed behaviour an evaluator could mirror. |
| `contains` | `Contains` | 49 | yes | none | — |
| `containvalues` | `ContainValues` | 87 | yes | none | — |
| `doesnotbeginwith` | `DoesNotBeginWith` | 55 | yes | none | — |
| `doesnotcontain` | `DoesNotContain` | 50 | yes | none | — |
| `doesnotcontainvalues` | `DoesNotContainValues` | 88 | yes | none | — |
| `doesnotendwith` | `DoesNotEndWith` | 57 | yes | none | — |
| `endswith` | `EndsWith` | 56 | yes | none | — |
| `equal` | `Equal` | 0 | yes | none | — |
| `equalbusinessid` | `EqualBusinessId` | 43 | yes | `UserMembership` | — |
| `equaluserid` | `EqualUserId` | 41 | yes | `UserMembership` | — |
| `equaluserlanguage` | `EqualUserLanguage` | 51 | yes | `UserLanguage` | — |
| `equaluseroruserhierarchy` | `EqualUserOrUserHierarchy` | 80 | yes | `UserHierarchy` | — |
| `equaluseroruserhierarchyandteams` | `EqualUserOrUserHierarchyAndTeams` | 81 | yes | `UserHierarchy` | — |
| `equaluseroruserteams` | `EqualUserOrUserTeams` | 74 | yes | `UserMembership`, `UserTeams` | — |
| `equaluserteams` | `EqualUserTeams` | 73 | yes | `UserTeams` | — |
| `greaterequal` | `GreaterEqual` | 4 | yes | none | — |
| `greaterthan` | `GreaterThan` | 2 | yes | none | — |
| `in` | `In` | 8 | yes | none | — |
| `infiscalperiod` | `InFiscalPeriod` | 69 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `infiscalperiodandyear` | `InFiscalPeriodAndYear` | 70 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `infiscalyear` | `InFiscalYear` | 68 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `inorafterfiscalperiodandyear` | `InOrAfterFiscalPeriodAndYear` | 72 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `inorbeforefiscalperiodandyear` | `InOrBeforeFiscalPeriodAndYear` | 71 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `last7days` | `Last7Days` | 17 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastfiscalperiod` | `LastFiscalPeriod` | 63 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastfiscalyear` | `LastFiscalYear` | 62 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastmonth` | `LastMonth` | 22 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastweek` | `LastWeek` | 19 | yes | `CurrentInstant`, `UserTimeZone`, `WeekStart` | — |
| `lastxdays` | `LastXDays` | 33 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxfiscalperiods` | `LastXFiscalPeriods` | 65 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastxfiscalyears` | `LastXFiscalYears` | 64 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastxhours` | `LastXHours` | 31 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxmonths` | `LastXMonths` | 37 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxweeks` | `LastXWeeks` | 35 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxyears` | `LastXYears` | 39 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastyear` | `LastYear` | 28 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lessequal` | `LessEqual` | 5 | yes | none | — |
| `lessthan` | `LessThan` | 3 | yes | none | — |
| `like` | `Like` | 6 | yes | none | — |
| `mask` | `Mask` | 46 | yes | none | — |
| `masksselect` | `MasksSelect` | 48 | no (deliberate) | — | The Dataverse server rejects every spelling tried — 'masks-select', 'masksselect', 'maskselect' and 'masks_select' — with HTTP 400 'Unknown Condition Operator', so there is no observed behaviour an evaluator could mirror; that measurement was taken through the FetchXML frontend alone, which bounds what has been observed and is not itself the reason for the exclusion. |
| `next7days` | `Next7Days` | 18 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextfiscalperiod` | `NextFiscalPeriod` | 61 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextfiscalyear` | `NextFiscalYear` | 60 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextmonth` | `NextMonth` | 24 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextweek` | `NextWeek` | 21 | yes | `CurrentInstant`, `UserTimeZone`, `WeekStart` | — |
| `nextxdays` | `NextXDays` | 34 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxfiscalperiods` | `NextXFiscalPeriods` | 67 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextxfiscalyears` | `NextXFiscalYears` | 66 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextxhours` | `NextXHours` | 32 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxmonths` | `NextXMonths` | 38 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxweeks` | `NextXWeeks` | 36 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxyears` | `NextXYears` | 40 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextyear` | `NextYear` | 30 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `notbetween` | `NotBetween` | 11 | yes | none | — |
| `notequal` | `NotEqual` | 1 | yes | none | — |
| `notequalbusinessid` | `NotEqualBusinessId` | 44 | yes | `UserMembership` | — |
| `notequaluserid` | `NotEqualUserId` | 42 | yes | `UserMembership` | — |
| `notin` | `NotIn` | 9 | yes | none | — |
| `notlike` | `NotLike` | 7 | yes | none | — |
| `notmask` | `NotMask` | 47 | yes | none | — |
| `notnull` | `NotNull` | 13 | yes | none | — |
| `noton` | `NotOn` | 52 | yes | `UserTimeZone` | — |
| `notunder` | `NotUnder` | 76 | yes | none | — |
| `null` | `Null` | 12 | yes | none | — |
| `olderthanxdays` | `OlderThanXDays` | 84 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxhours` | `OlderThanXHours` | 85 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxminutes` | `OlderThanXMinutes` | 86 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxmonths` | `OlderThanXMonths` | 53 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxweeks` | `OlderThanXWeeks` | 83 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxyears` | `OlderThanXYears` | 82 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `on` | `On` | 25 | yes | `UserTimeZone` | — |
| `onorafter` | `OnOrAfter` | 27 | yes | `UserTimeZone` | — |
| `onorbefore` | `OnOrBefore` | 26 | yes | `UserTimeZone` | — |
| `thisfiscalperiod` | `ThisFiscalPeriod` | 59 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `thisfiscalyear` | `ThisFiscalYear` | 58 | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `thismonth` | `ThisMonth` | 23 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `thisweek` | `ThisWeek` | 20 | yes | `CurrentInstant`, `UserTimeZone`, `WeekStart` | — |
| `thisyear` | `ThisYear` | 29 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `today` | `Today` | 15 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `tomorrow` | `Tomorrow` | 16 | yes | `CurrentInstant`, `UserTimeZone` | — |
| `under` | `Under` | 75 | yes | none | — |
| `underorequal` | `UnderOrEqual` | 77 | yes | none | — |
| `yesterday` | `Yesterday` | 14 | yes | `CurrentInstant`, `UserTimeZone` | — |
