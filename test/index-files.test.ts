import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, test } from 'node:test';
import { collectIndexFiles, createIndexContent } from '../src/index-files';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'flutter-files-index-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.promises.rm(directory, { recursive: true, force: true })),
  );
});

test('creates deterministic exports and ignores generated Dart files', async () => {
  const root = await createTemporaryDirectory();
  await fs.promises.mkdir(path.join(root, 'nested'));
  await fs.promises.mkdir(path.join(root, 'barrel'));
  await Promise.all([
    fs.promises.writeFile(path.join(root, 'z.dart'), ''),
    fs.promises.writeFile(path.join(root, 'a.dart'), ''),
    fs.promises.writeFile(path.join(root, 'index.dart'), 'old'),
    fs.promises.writeFile(path.join(root, 'model.g.dart'), ''),
    fs.promises.writeFile(path.join(root, 'model.freezed.dart'), ''),
    fs.promises.writeFile(path.join(root, 'nested', 'child.dart'), ''),
    fs.promises.writeFile(path.join(root, 'barrel', 'index.dart'), ''),
    fs.promises.writeFile(path.join(root, 'barrel', 'hidden.dart'), ''),
  ]);

  assert.equal(
    await createIndexContent(root, "'"),
    [
      "export 'a.dart';\n",
      "export 'barrel/index.dart';\n",
      "export 'nested/child.dart';\n",
      "export 'z.dart';\n",
    ].join(''),
  );
});

test('treats a nested index as a barrel but scans the root index directory', async () => {
  const root = await createTemporaryDirectory();
  const nested = path.join(root, 'nested');
  await fs.promises.mkdir(nested);
  await fs.promises.writeFile(path.join(root, 'index.dart'), '');
  await fs.promises.writeFile(path.join(nested, 'index.dart'), '');
  await fs.promises.writeFile(path.join(nested, 'child.dart'), '');

  assert.deepEqual(await collectIndexFiles(root), [
    path.join(root, 'index.dart'),
    path.join(nested, 'index.dart'),
  ]);
  assert.equal(await createIndexContent(root, '"'), 'export "nested/index.dart";\n');
});
