import * as fs from 'fs';
import { IPath } from './models/path';
import { IFiles } from './models/file';

// Get file contents and create the new files in the folder.
export const createFiles = async (loc: IPath, files: IFiles[]): Promise<string> => {
  await Promise.all(files.map((file) => fs.promises.writeFile(file.name, file.content)));
  return loc.dirPath;
};

// Create the new folder.
export const createFolder = async (loc: IPath): Promise<IPath> => {
  if (!loc.dirName) {
    return loc;
  }
  if (fs.existsSync(loc.dirPath)) {
    throw new Error('Folder already exists');
  }
  await fs.promises.mkdir(loc.dirPath, { recursive: true });
  return loc;
};

export const createDirectory = async (pathDirectory: string): Promise<void> => {
  if (pathDirectory) {
    await fs.promises.mkdir(pathDirectory, { recursive: true });
  }
};

export const copyRecursiveSync = async (source: string, destination: string): Promise<void> => {
  await fs.promises.cp(source, destination, {
    recursive: true,
    force: false,
    errorOnExist: false,
  });
};
