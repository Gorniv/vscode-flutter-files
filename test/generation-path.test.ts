import assert from 'node:assert/strict';
import * as path from 'node:path';
import { test } from 'node:test';
import { parseGenerationPath } from '../src/generation-path';

test('parses a simple generated name', () => {
  const result = parseGenerationPath('user_profile', '/workspace/lib');

  assert.deepEqual(result, {
    dirName: '',
    fileName: 'user_profile',
    fullPath: path.join('/workspace/lib', 'user_profile'),
    normalizedPath: 'user_profile',
  });
});

test('normalizes nested paths written with either separator', () => {
  for (const input of ['features/profile', 'features\\profile']) {
    const result = parseGenerationPath(input, '/workspace/lib');
    assert.equal(result.dirName, 'features');
    assert.equal(result.fileName, 'profile');
    assert.equal(result.fullPath, path.join('/workspace/lib', 'features', 'profile'));
  }
});

test('rejects whitespace, traversal, absolute paths, and invalid Dart names', () => {
  const invalidNames = ['', 'two words', '../outside', './inside', '/absolute', 'feature-name'];
  for (const input of invalidNames) {
    assert.throws(() => parseGenerationPath(input, '/workspace/lib'));
  }
});
