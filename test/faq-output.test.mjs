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
  assert.match(answer, /next stable XrmGhost release/);
  assert.doesNotMatch(answer, /ADO-\d+/);
  assert.doesNotMatch(answer, /''|never a value that is always empty|defect in the plugin/);
  assert.equal(html.split('Live connection is read-only:').length - 1 >= 2, true);
});

test('the MFA, cache and agents answer appears once, in the same place in the body and in the structured data', () => {
  const html = readFileSync(new URL('../dist/faq/index.html', import.meta.url), 'utf8');
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const faqs = schemas.filter((schema) => schema['@type'] === 'FAQPage');
  assert.equal(faqs.length, 1);
  const faq = faqs[0];
  const question = 'Does it work with MFA and can a coding agent reuse my sign-in?';
  const names = faq.mainEntity.map((item) => item.name);
  assert.equal(new Set(names).size, names.length);
  assert.equal(names.filter((name) => name === question).length, 1);
  assert.equal(names[3], question);
  assert.equal(names[2], 'How is XrmGhost different from Dataverse PowerTools replay?');
  assert.equal(names.at(-1), 'Can a live customer org be changed by a run?');
  const answer = faq.mainEntity[3].acceptedAnswer.text;
  assert.equal(html.split('<p>' + answer + '</p>').length - 1, 1);
  assert.doesNotMatch(answer, /[`"<&]|\]\(|--/);
  assert.doesNotMatch(answer, /\d+\.\d+|\bv\d|ADO-\d+/);
  assert.match(answer, /multi-factor authentication/);
  assert.match(answer, /one method among them, not the only one/);
  assert.match(answer, /sign in once yourself in a terminal/);
  assert.match(answer, /Linux without libsecret the cache stays in memory only and no refresh token is written to disk/);
  assert.match(answer, /Workload identity and managed identity are not supported/);
  assert.doesNotMatch(answer, /(token|secret|password)\s*[:=]/i);
  const headings = [...html.matchAll(/<h2 id="([^"]+)"/g)].map((match) => match[1]);
  const anchor = 'does-it-work-with-mfa-and-can-a-coding-agent-reuse-my-sign-in';
  assert.equal(headings.filter((id) => id === anchor).length, 1);
  const thirdAnchor = 'how-is-xrmghost-different-from-dataverse-powertools-replay';
  assert.equal(headings.indexOf(anchor), headings.indexOf(thirdAnchor) + 1);
  assert.equal(headings.indexOf('does-it-run-the-real-plugin-or-a-mock'), headings.indexOf(anchor) + 1);
  assert.ok(html.includes('<a href="/how-to/use-delegated-dataverse-authentication/">Use delegated Dataverse authentication</a>'));
});
