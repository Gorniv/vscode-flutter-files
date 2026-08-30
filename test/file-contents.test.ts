import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, test } from 'node:test';
import { FileContents } from '../src/file-contents';
import { config } from '../src/config/cli-config';
import { IPath } from '../src/models/path';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'flutter-files-templates-'));
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

test('lists only template directories in a stable order', async () => {
  const root = await createTemporaryDirectory();
  const templates = path.join(root, 'templates');
  await fs.promises.mkdir(path.join(templates, 'zeta'), { recursive: true });
  await fs.promises.mkdir(path.join(templates, 'alpha'));
  await fs.promises.writeFile(path.join(templates, 'ff.config.json'), '{}');
  await fs.promises.writeFile(path.join(templates, 'loose.tmpl'), 'ignored');

  assert.deepEqual(await new FileContents().loadDirTemplates(root), ['alpha', 'zeta']);
  assert.deepEqual(await new FileContents().loadDirTemplates(path.join(root, 'missing')), []);
});

test('renders a custom nested template with project-relative values', async () => {
  const root = await createTemporaryDirectory();
  const templateDirectory = path.join(root, 'templates', 'custom');
  const generatedDirectory = path.join(root, 'lib', 'features');
  await fs.promises.mkdir(path.join(templateDirectory, 'nested'), { recursive: true });
  await fs.promises.mkdir(generatedDirectory, { recursive: true });
  await fs.promises.writeFile(
    path.join(templateDirectory, 'nested', 'bloc.tmpl'),
    '${appName}|${relative}|${inputName}|${upperName}|${privateName}',
  );
  const location: IPath = {
    fileName: 'user_profile',
    dirName: '',
    dirPath: generatedDirectory,
    fullPath: generatedDirectory,
    rootPath: root,
    templateDirectory,
  };

  const result = await new FileContents().getTemplateContent(
    'nested\\bloc',
    { ...config, appName: 'sample_app' },
    'user_profile',
    location,
  );

  assert.equal(result, 'sample_app|/features|user_profile|UserProfile|userProfile');
});

test('reports the template name when compilation fails', async () => {
  const root = await createTemporaryDirectory();
  await fs.promises.writeFile(path.join(root, 'broken.tmpl'), '${');

  await assert.rejects(
    new FileContents().loadTemplates(root, new Map()),
    /Failed to compile template broken\.tmpl/,
  );
});
