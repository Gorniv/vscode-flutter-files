import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import { IPath } from './models/path';
import { IFiles } from './models/file';
import { promisify } from './promisify';
import path = require('path');

const fsWriteFile = promisify(fs.writeFile);
const fsExists = promisify(fs.exists);
const fsMkdir = promisify(fs.mkdir);
const fsCopyFile = promisify(fs.copyFile);
const fsReaddir = promisify(fs.readdir);

// Get file contents and create the new files in the folder
export const createFiles = async (loc: IPath, files: IFiles[]) => {
  try {
    await writeFiles(files);
  } catch (ex) {
    await window.showErrorMessage(`File(s) could not be created. ${ex}`);
  }

  return loc.dirPath;
};

const writeFiles = async (files: IFiles[]) => {
  // tslint:disable-next-line:ter-arrow-parens
  const filesPromises: Promise<any>[] = files.map((file) => fsWriteFile(file.name, file.content));

  await Promise.all(filesPromises);
};

// Create the new folder
export const createFolder = async (loc: IPath) => {
  if (loc.dirName) {
    const exists = await fsExists(loc.dirPath);
    if (exists) {
      throw new Error('Folder already exists');
    }

    await fsMkdir(loc.dirPath);
  }

  return loc;
};

export const createDirectory = async (pathDir: String) => {
  if (pathDir) {
    try {
      const exists = await fsExists(pathDir);
      if (exists) {
        return;
      }

      await fsMkdir(pathDir);
    } catch (_) {
      console.log(_);
    }
  }

  return;
};

/**
 * Look ma, it's cp -R.
 * @param {string} src The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
export const copyRecursiveSync = async (src: string, dest: string) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  console.log('isDirectory', isDirectory);
  if (isDirectory) {
    console.log('dest', dest);
    await createDirectory(dest);
    console.log('finish dest');
    console.log('fs.readdirSync(src)', await fsReaddir(src));
    const items = await fsReaddir(src);
    items.forEach((childItemName) => {
      console.log('childItemName', childItemName);
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    console.log('fsCopyFile');
    await fsCopyFile(src, dest); // UPDATE FROM:    fs.linkSync(src, dest);
  }
};
