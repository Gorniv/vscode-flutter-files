'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, '.test-out');

fs.rmSync(outputDirectory, { recursive: true, force: true });

const compile = spawnSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.test.json'],
  { cwd: projectRoot, stdio: 'inherit' },
);
if (compile.status !== 0) {
  process.exit(compile.status ?? 1);
}

const testDirectory = path.join(outputDirectory, 'test');
const testFiles = fs
  .readdirSync(testDirectory)
  .filter((file) => file.endsWith('.test.js'))
  .map((file) => path.join(testDirectory, file));

const run = spawnSync(
  process.execPath,
  [
    '--experimental-test-coverage',
    '--test-coverage-lines=85',
    '--test-coverage-functions=80',
    '--test-coverage-branches=75',
    '--test-coverage-exclude=.test-out/test/**',
    '--test',
    ...testFiles,
  ],
  { cwd: projectRoot, stdio: 'inherit' },
);
process.exit(run.status ?? 1);
