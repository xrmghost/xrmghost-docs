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
way `QueryExpressionFrontend` derives it: the SDK member name lowercased. Where FetchXml
has a spelling of its own (`not-begin-with`, `last-seven-days`) `FetchXmlOperatorMap`
translates it onto this key; those are not separate operators. Where FetchXml has no
spelling at all there is nothing to translate, and the key names an operator no FetchXml
query can reach — which is what **Reachable from FetchXml** reports.

**Supported** is not a yes/no. It is one of three dispositions the registry declares once
`OperatorEvaluatorBootstrapper.RegisterAll` has run, and the difference between the two
negative ones is the point: `yes` means an evaluator is registered for that key;
`no (deliberate)` means the engine refuses the operator on purpose and the **Reason** column
says why, so the refusal is a decision with a cause behind it; a bare `no` means no
evaluator is registered and nothing has been decided — the operator is simply not covered
yet, which is a gap and not a judgement. This is the registry's answer and only the
registry's, and it travels with the refusal into the `NotSupportedQueryOperatorException`
message. Whether a FetchXml query can name the operator at all is a separate question,
asked of a separate source, and the next column answers it.

**Reachable from FetchXml** is that separate question: not "can this engine evaluate the
operator" but "can a FetchXml query name it". The answer comes from `FetchXmlOperatorMap`,
which is where the FetchXml dialect is defined: `yes` means the FetchXml frontend resolves
some spelling onto the canonical key, and `no (no FetchXml grammar)` means it resolves
none. That is a statement about the dialect and never about coverage — the operator may be
fully evaluable on the `QueryExpression` path and simply unwritable in FetchXml, which is
`masksselect`'s case. The two columns are independent in both directions, and the table
shows each: `childof` is `no (deliberate)` under **Supported** and `yes` here, because
FetchXml parses `child-of` and the platform refuses the use rather than the name.

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
| Supported | **88** |
| Not supported | **1** |
| — of those, deliberately rejected with a reason | **1** |
| — of those, not covered and not classified | **0** |
| Supported but not reachable from FetchXml | **1** |

| Canonical key | SDK member | SDK value | Supported | Reachable from FetchXml | Context required | Reason |
| --- | --- | ---: | --- | --- | --- | --- |
| `above` | `Above` | 78 | yes | yes | none | — |
| `aboveorequal` | `AboveOrEqual` | 79 | yes | yes | none | — |
| `beginswith` | `BeginsWith` | 54 | yes | yes | none | — |
| `between` | `Between` | 10 | yes | yes | none | — |
| `childof` | `ChildOf` | 45 | no (deliberate) | yes | — | The SDK reference marks ChildOf "for internal use only" and the platform enforces it as a refusal of USE rather than of the name: FetchXML parses the spelling and then rejects the attribute ("The parentbusinessunitid attribute is not a valid attribute for the child-of operator", ADO-2307: eight rejections out of eight), and QueryExpression at the operator's own arity of zero values answers "The child-of operator is not valid for standard queries. It is for internal crm infrastructure use only via OutlookSync queries." (ADO-2498, six targets across three hierarchies). It is therefore a reserved operator and not an unknown one, and there is no observed behaviour an evaluator could mirror. |
| `contains` | `Contains` | 49 | yes | yes | none | — |
| `containvalues` | `ContainValues` | 87 | yes | yes | none | — |
| `doesnotbeginwith` | `DoesNotBeginWith` | 55 | yes | yes | none | — |
| `doesnotcontain` | `DoesNotContain` | 50 | yes | yes | none | — |
| `doesnotcontainvalues` | `DoesNotContainValues` | 88 | yes | yes | none | — |
| `doesnotendwith` | `DoesNotEndWith` | 57 | yes | yes | none | — |
| `endswith` | `EndsWith` | 56 | yes | yes | none | — |
| `equal` | `Equal` | 0 | yes | yes | none | — |
| `equalbusinessid` | `EqualBusinessId` | 43 | yes | yes | `UserMembership` | — |
| `equaluserid` | `EqualUserId` | 41 | yes | yes | `UserMembership` | — |
| `equaluserlanguage` | `EqualUserLanguage` | 51 | yes | yes | `UserLanguage` | — |
| `equaluseroruserhierarchy` | `EqualUserOrUserHierarchy` | 80 | yes | yes | `UserHierarchy` | — |
| `equaluseroruserhierarchyandteams` | `EqualUserOrUserHierarchyAndTeams` | 81 | yes | yes | `UserHierarchy` | — |
| `equaluseroruserteams` | `EqualUserOrUserTeams` | 74 | yes | yes | `UserMembership`, `UserTeams` | — |
| `equaluserteams` | `EqualUserTeams` | 73 | yes | yes | `UserTeams` | — |
| `greaterequal` | `GreaterEqual` | 4 | yes | yes | none | — |
| `greaterthan` | `GreaterThan` | 2 | yes | yes | none | — |
| `in` | `In` | 8 | yes | yes | none | — |
| `infiscalperiod` | `InFiscalPeriod` | 69 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `infiscalperiodandyear` | `InFiscalPeriodAndYear` | 70 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `infiscalyear` | `InFiscalYear` | 68 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `inorafterfiscalperiodandyear` | `InOrAfterFiscalPeriodAndYear` | 72 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `inorbeforefiscalperiodandyear` | `InOrBeforeFiscalPeriodAndYear` | 71 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `last7days` | `Last7Days` | 17 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastfiscalperiod` | `LastFiscalPeriod` | 63 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastfiscalyear` | `LastFiscalYear` | 62 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastmonth` | `LastMonth` | 22 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastweek` | `LastWeek` | 19 | yes | yes | `CurrentInstant`, `UserTimeZone`, `WeekStart` | — |
| `lastxdays` | `LastXDays` | 33 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxfiscalperiods` | `LastXFiscalPeriods` | 65 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastxfiscalyears` | `LastXFiscalYears` | 64 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `lastxhours` | `LastXHours` | 31 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxmonths` | `LastXMonths` | 37 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxweeks` | `LastXWeeks` | 35 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastxyears` | `LastXYears` | 39 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lastyear` | `LastYear` | 28 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `lessequal` | `LessEqual` | 5 | yes | yes | none | — |
| `lessthan` | `LessThan` | 3 | yes | yes | none | — |
| `like` | `Like` | 6 | yes | yes | none | — |
| `mask` | `Mask` | 46 | yes | yes | none | — |
| `masksselect` | `MasksSelect` | 48 | yes | no (no FetchXml grammar) | none | — |
| `next7days` | `Next7Days` | 18 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextfiscalperiod` | `NextFiscalPeriod` | 61 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextfiscalyear` | `NextFiscalYear` | 60 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextmonth` | `NextMonth` | 24 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextweek` | `NextWeek` | 21 | yes | yes | `CurrentInstant`, `UserTimeZone`, `WeekStart` | — |
| `nextxdays` | `NextXDays` | 34 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxfiscalperiods` | `NextXFiscalPeriods` | 67 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextxfiscalyears` | `NextXFiscalYears` | 66 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `nextxhours` | `NextXHours` | 32 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxmonths` | `NextXMonths` | 38 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxweeks` | `NextXWeeks` | 36 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextxyears` | `NextXYears` | 40 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `nextyear` | `NextYear` | 30 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `notbetween` | `NotBetween` | 11 | yes | yes | none | — |
| `notequal` | `NotEqual` | 1 | yes | yes | none | — |
| `notequalbusinessid` | `NotEqualBusinessId` | 44 | yes | yes | `UserMembership` | — |
| `notequaluserid` | `NotEqualUserId` | 42 | yes | yes | `UserMembership` | — |
| `notin` | `NotIn` | 9 | yes | yes | none | — |
| `notlike` | `NotLike` | 7 | yes | yes | none | — |
| `notmask` | `NotMask` | 47 | yes | yes | none | — |
| `notnull` | `NotNull` | 13 | yes | yes | none | — |
| `noton` | `NotOn` | 52 | yes | yes | `UserTimeZone` | — |
| `notunder` | `NotUnder` | 76 | yes | yes | none | — |
| `null` | `Null` | 12 | yes | yes | none | — |
| `olderthanxdays` | `OlderThanXDays` | 84 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxhours` | `OlderThanXHours` | 85 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxminutes` | `OlderThanXMinutes` | 86 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxmonths` | `OlderThanXMonths` | 53 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxweeks` | `OlderThanXWeeks` | 83 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `olderthanxyears` | `OlderThanXYears` | 82 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `on` | `On` | 25 | yes | yes | `UserTimeZone` | — |
| `onorafter` | `OnOrAfter` | 27 | yes | yes | `UserTimeZone` | — |
| `onorbefore` | `OnOrBefore` | 26 | yes | yes | `UserTimeZone` | — |
| `thisfiscalperiod` | `ThisFiscalPeriod` | 59 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `thisfiscalyear` | `ThisFiscalYear` | 58 | yes | yes | `CurrentInstant`, `UserTimeZone`, `FiscalCalendar` | — |
| `thismonth` | `ThisMonth` | 23 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `thisweek` | `ThisWeek` | 20 | yes | yes | `CurrentInstant`, `UserTimeZone`, `WeekStart` | — |
| `thisyear` | `ThisYear` | 29 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `today` | `Today` | 15 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `tomorrow` | `Tomorrow` | 16 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
| `under` | `Under` | 75 | yes | yes | none | — |
| `underorequal` | `UnderOrEqual` | 77 | yes | yes | none | — |
| `yesterday` | `Yesterday` | 14 | yes | yes | `CurrentInstant`, `UserTimeZone` | — |
