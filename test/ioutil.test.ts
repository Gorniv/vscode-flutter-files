import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, test } from 'node:test';
import { copyRecursiveSync, createDirectory, createFiles, createFolder } from '../src/ioutil';
import { IPath } from '../src/models/path';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'flutter-files-io-'));
  temporaryDirectories.push(directory);
  return directory;
};

const location = (root: string, dirName: string, dirPath: string): IPath => ({
  fileName: 'profile',
  dirName,
  dirPath,
  fullPath: path.join(root, 'profile'),
  rootPath: root,
  templateDirectory: '/templates/simple',
});

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.promises.rm(directory, { recursive: true, force: true })),
  );
});

test('creates nested directories and generated files', async () => {
  const root = await createTemporaryDirectory();
  const nested = path.join(root, 'features', 'profile');
  await createDirectory(nested);
  const loc = location(root, 'profile', nested);

  assert.equal(
    await createFiles(loc, [{ name: path.join(nested, 'profile_bloc.dart'), content: 'bloc' }]),
    nested,
  );
  assert.equal(await fs.promises.readFile(path.join(nested, 'profile_bloc.dart'), 'utf8'), 'bloc');
});

test('creates pack folders once and rejects an existing destination', async () => {
  const root = await createTemporaryDirectory();
  const destination = path.join(root, 'features', 'profile');
  const loc = location(root, 'profile', destination);

  await createFolder(loc);
  assert.equal((await fs.promises.stat(destination)).isDirectory(), true);
  await assert.rejects(createFolder(loc), /Folder already exists/);
  assert.equal((await createFolder(location(root, '', root))).dirPath, root);
});

test('copies missing templates without overwriting project customizations', async () => {
  const root = await createTemporaryDirectory();
  const source = path.join(root, 'source');
  const destination = path.join(root, 'destination');
  await fs.promises.mkdir(source);
  await fs.promises.mkdir(destination);
  await fs.promises.writeFile(path.join(source, 'existing.tmpl'), 'bundled');
  await fs.promises.writeFile(path.join(source, 'new.tmpl'), 'new');
  await fs.promises.writeFile(path.join(destination, 'existing.tmpl'), 'custom');

  await copyRecursiveSync(source, destination);

  assert.equal(
    await fs.promises.readFile(path.join(destination, 'existing.tmpl'), 'utf8'),
    'custom',
  );
  assert.equal(await fs.promises.readFile(path.join(destination, 'new.tmpl'), 'utf8'), 'new');
});
