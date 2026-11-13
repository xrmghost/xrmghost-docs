import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const canonical =
  'With `--data-source live` (Framework Host 1.1.0 or later), `-c` does not change reads: without a Pro license, `Retrieve` still fails with `ProFeatureNotLicensedException` and `RetrieveMultiple` returns an empty collection with a warning; use `--data-source auto` or a Pro license instead. Other Pro features with a safe mock substitute still follow `-c`.';
const obsolete = 'Does not apply to `--data-source live`';

for (const file of ['src/content/docs/cli/reference/run.mdx', 'public/llms-full.txt']) {
  test(`${file}: contratto di -c con live allineato`, () => {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.ok(text.split(canonical).length - 1 >= 2, 'frase canonica almeno due volte');
    assert.ok(!text.includes(obsolete), 'frase obsoleta assente');
  });
}
