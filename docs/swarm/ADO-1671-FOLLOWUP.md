# ADO-1671-FOLLOWUP — Close remaining backlink mesh edges (docs surface)

## Goal
Close three missing edges in the ADO-1669 public discovery backlink mesh on
xrmghost-docs (Astro/Starlight), out of scope for the original ADO-1683 task:
- N-CLI: XrmGhost.Cli NuGet package
- N-ATTR: XrmGhost.Attributes NuGet package
- R-DOCS: self-referential link to the xrmghost-docs GitHub repo

## Scope and modifications
- `src/components/Footer.astro`: appended three entries to the `surfaces`
  array used by the "More from XrmGhost" footer block, each with
  differentiated copy (not cloned from existing entries):
  - `https://www.nuget.org/packages/XrmGhost.Cli` — "Install the CLI — the
    dotnet tool package referenced throughout these docs."
  - `https://www.nuget.org/packages/XrmGhost.Attributes` — "Declarative
    Dataverse attributes as a NuGet package — reference it directly from
    your plugin project."
  - `https://github.com/xrmghost/xrmghost-docs` — "Source of this site —
    view the page source or open an issue against these docs."
- `astro.config.mjs`: added the same three URLs to the `sameAs` array in the
  `WebSite`/`Organization` JSON-LD block (first-party, public, non-gated
  only — no admin/gated URLs introduced).

No other files touched. `public/CNAME`, `dist/**`, `.github/workflows/**`
left untouched per constraints.

## Commands executed
- `npm ci` — exit 0 (422 packages installed).
- `npm run build` — exit 0, 53 pages built, Pagefind index + sitemap
  generated successfully.
- `grep -o "nuget.org/packages/XrmGhost.Cli\|nuget.org/packages/XrmGhost.Attributes\|github.com/xrmghost/xrmghost-docs" dist/overview/index.html | sort -u`
  — confirmed all three URLs render in the built footer output.

## Acceptance criteria verified
- [x] Docs shared footer includes first-party links to N-CLI, N-ATTR, and
  R-DOCS (self-link) — verified in `src/components/Footer.astro` and in
  rendered `dist/overview/index.html`.
- [x] Copy is differentiated per link, not duplicated — each entry has
  distinct wording (install CTA for CLI, integration framing for
  Attributes, "view source / open an issue" framing for the self-link).
- [x] No gated/admin URLs introduced — admin.xrmghost.tech remains
  excluded, unchanged from the prior ADO-1683 cycle.

## Residual risks
- The self-link (R-DOCS) framing ("Source of this site — view the page
  source or open an issue against these docs") was deliberately worded to
  avoid reading as a duplicate homepage/nav link, per the task's own risk
  note. Worth a quick editorial glance in review but not expected to need
  rework.
- `npm audit` reports 4 pre-existing vulnerabilities (1 low, 1 moderate,
  2 high) in transitive dependencies — unrelated to this change, not
  remediated (out of scope).

## Notes for review
- Diff is limited to `src/components/Footer.astro` and `astro.config.mjs`
  as scoped.
- JSON-LD `sameAs` update was trivial (array append), so it was included
  per the task's optional clause.
