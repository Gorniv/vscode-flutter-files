import assert from 'node:assert/strict';
import { test } from 'node:test';
import mergeDeep from '../src/deep-merge';

test('merges nested objects and replaces scalar values', () => {
  const result = mergeDeep(
    {},
    { defaults: { bloc: { flat: false }, state: { flat: false } }, appName: 'first' },
    { defaults: { bloc: { flat: true } }, appName: 'second' },
  );

  assert.deepEqual(result, {
    defaults: { bloc: { flat: true }, state: { flat: false } },
    appName: 'second',
  });
});

test('does not merge prototype-mutating keys', () => {
  const malicious = JSON.parse('{"__proto__":{"polluted":true},"safe":1}') as object;
  const result = mergeDeep({}, malicious);

  assert.deepEqual(result, { safe: 1 });
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);
});
