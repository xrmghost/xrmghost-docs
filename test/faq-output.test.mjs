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
  assert.match(faq.mainEntity[2].acceptedAnswer.text, /Today, we do not generate a scenario from a trace log\./);
});
