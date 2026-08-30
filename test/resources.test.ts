import assert from 'node:assert/strict';
import * as path from 'node:path';
import { test } from 'node:test';
import { Command, ConfigElement } from '../src/config-ext';
import { ResourcesDynamic } from '../src/resources';
import { IPath } from '../src/models/path';
import { config } from '../src/config/cli-config';

const location: IPath = {
  fileName: 'profile',
  dirName: 'features',
  dirPath: path.join('/workspace', 'lib'),
  fullPath: path.join('/workspace', 'lib', 'features', 'profile'),
  rootPath: path.join('/workspace', 'lib'),
  templateDirectory: '/templates/simple',
};

test('uses an explicit command key in the resource map', () => {
  const element: ConfigElement = {
    name: 'bloc',
    commands: [{ name: 'Big Pack', key: 'bigpack', templates: ['*'], files: ['bloc', 'state'] }],
  };

  assert.deepEqual(ResourcesDynamic.resourcesDynamic(element).get('bigpack')?.files, [
    'bloc',
    'state',
  ]);
});

test('creates a folder for packs and keeps single files in the selected directory', () => {
  const pack: Command = {
    name: 'Big Pack',
    templates: ['*'],
    files: ['bloc', 'state'],
  };
  const single: Command = { name: 'Bloc', templates: ['*'], files: ['bloc'] };

  const packResource = ResourcesDynamic.resourcesCommand(pack);
  assert.equal(packResource.locDirName?.(location, config), 'profile');
  assert.equal(
    packResource.locDirPath?.(location, config),
    path.join('/workspace', 'lib', 'features', 'profile'),
  );
  assert.equal(packResource.createFolder?.(config), true);

  const singleResource = ResourcesDynamic.resourcesCommand(single);
  assert.equal(singleResource.locDirName?.(location, config), 'features');
  assert.equal(
    singleResource.locDirPath?.(location, config),
    path.join('/workspace', 'lib', 'features'),
  );
  assert.equal(singleResource.createFolder?.(config), false);
});
