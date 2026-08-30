import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toCamelCase, toPrivateCase, toTileCase, toUpperCase } from '../src/formatting';

test('formats generated Dart names', () => {
  assert.equal(toCamelCase('user_profile_page'), 'userProfilePage');
  assert.equal(toUpperCase('user_profile'), 'UserProfile');
  assert.equal(toPrivateCase('UserProfile'), 'userProfile');
  assert.equal(toTileCase('new bloc'), 'New Bloc');
});

test('keeps already normalized and empty names stable', () => {
  assert.equal(toCamelCase('profile'), 'profile');
  assert.equal(toUpperCase(''), '');
  assert.equal(toPrivateCase(''), '');
});
