'use strict';

const fs = require('node:fs');
const path = require('node:path');

const argumentNames = ['inputName', 'upperName', 'privateName', 'appName', 'relative', 'params'];
const argumentValues = ['example', 'Example', 'example', 'example_app', '/feature', ''];
const templatesRoot = path.resolve(__dirname, '..', 'templates');

const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(entryPath);
      continue;
    }
    if (!entry.name.endsWith('.tmpl')) {
      continue;
    }

    const content = fs.readFileSync(entryPath, 'utf8');
    const render = Function(...argumentNames, `return \`${content}\`;`);
    const result = render(...argumentValues);
    if (typeof result !== 'string') {
      throw new Error(`Template did not render: ${path.relative(templatesRoot, entryPath)}`);
    }
  }
};

visit(templatesRoot);
