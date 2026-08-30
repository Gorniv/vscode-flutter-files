'use strict';

const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '..', 'templates');
const output = path.resolve(__dirname, '..', 'out');
const destination = path.join(output, 'templates');

fs.rmSync(output, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
