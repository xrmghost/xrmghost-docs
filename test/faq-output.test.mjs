import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('environment and PowerTools answers match the rendered FAQ structured data', () => {
  const html = readFileSync(new URL('../dist/faq/index.html', import.meta.url), 'utf8');
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  assert.ok(faq);
  const questions = [
    'Do I need a Dataverse environment to start?',
    'How is XrmGhost different from Dataverse PowerTools replay?',
  ];
  assert.deepEqual(faq.mainEntity.slice(1, 3).map((item) => item.name), questions);
  for (const question of questions) {
    const entries = faq.mainEntity.filter((item) => item.name === question);
    assert.equal(entries.length, 1);
    const answer = entries[0].acceptedAnswer.text;
    assert.ok(html.includes(`<p>${answer}</p>`), question);
    assert.doesNotMatch(answer, /\b(test|free|evaluation|trial)\b|\d+\.\d+/i);
    const anchor = question.toLowerCase().replace(/\?$/, '').replaceAll(' ', '-');
    assert.ok(html.includes(`id="${anchor}"`), anchor);
  }
  assert.match(faq.mainEntity[1].acceptedAnswer.text, /A Dataverse environment is still where you deploy/);
  assert.match(faq.mainEntity[2].acceptedAnswer.text, /replay that capture locally under the debugger without a live connection/);
  assert.match(faq.mainEntity[2].acceptedAnswer.text, /Today you or your coding agent write the scenario; we do not generate one from a trace log\./);
});

test('the live customer org answer appears once and matches the rendered FAQ', () => {
  const html = readFileSync(new URL('../dist/faq/index.html', import.meta.url), 'utf8');
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  assert.ok(faq);
  const question = 'Can a live customer org be changed by a run?';
  const entries = faq.mainEntity.filter((item) => item.name === question);
  assert.equal(entries.length, 1);
  assert.equal(faq.mainEntity.at(-1).name, question);
  const answer = entries[0].acceptedAnswer.text;
  assert.doesNotMatch(answer, /[`"<&]|\]\(/);
  assert.ok(html.includes('<p>' + answer + '</p>'));
  assert.ok(html.includes('<a href="/how-to/use-live-data-from-a-customer-org-safely/">Use live data from a customer org safely</a>'));
  assert.ok(html.includes('id="can-a-live-customer-org-be-changed-by-a-run"'));
});

test('the live customer org answer carries the block message and reports blocks as XrmGhost bugs', () => {
  const html = readFileSync(new URL('../dist/faq/index.html', import.meta.url), 'utf8');
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  const answer = faq.mainEntity.find((item) => item.name === 'Can a live customer org be changed by a run?').acceptedAnswer.text;
  assert.match(answer, /Live connection is read-only: .* is not allowed \(only Retrieve, RetrieveMultiple and WhoAmI reach Dataverse\)/);
  assert.match(answer, /the quoted name is the refused operation/);
  assert.match(answer, /it is a bug in XrmGhost, not in your plugin/);
  assert.match(answer, /first Framework Host release that includes ADO-5437/);
  assert.doesNotMatch(answer, /''|never a value that is always empty|defect in the plugin/);
  assert.equal(html.split('Live connection is read-only:').length - 1 >= 2, true);
});
