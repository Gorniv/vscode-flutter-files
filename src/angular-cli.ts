import { window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from './models/config';
import { IPath } from './models/path';
import { FileContents } from './file-contents';
import { IFiles } from './models/file';
import { promisify } from './promisify';
import { toUpperCase } from './formatting';
import { createDirectory, createFiles, createFolder } from './ioutil';
import { ResourcesDynamic } from './resources';
import { ResourceType } from './enums/resource-type';
import { ConfigElement } from './config-ext';

const fsWriteFile = promisify(fs.writeFile);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

export class AngularCli {
  constructor(private readonly fc = new FileContents()) {}

  async generateResources(
    name: ResourceType,
    loc: IPath,
    config: IConfig,
    configExt: ConfigElement,
  ) {
    const resource = !!loc.command
      ? ResourcesDynamic.resourcesCommand(loc.command)
      : ResourcesDynamic.resourcesDynamic(configExt).get(name);

    loc.dirName = resource.hasOwnProperty('locDirName')
      ? resource.locDirName(loc, config)
      : loc.dirName;
    loc.dirPath = resource.hasOwnProperty('locDirPath')
      ? resource.locDirPath(loc, config)
      : loc.dirPath;

    // tslint:disable-next-line:ter-arrow-parens
    if (resource.hasOwnProperty('createFolder') && resource.createFolder(config)) {
      await createFolder(loc);
    }

    const filesASync: Promise<IFiles>[] = resource.files
      // tslint:disable-next-line:ter-arrow-parens
      .filter((file) => file !== 'index')
      .map(async (file) => {
        try {
          const splitDir = '\\';
          var newDirs = file.split(splitDir);
          var tempDir = '';
          var fileTemp: string = file;
          if (newDirs.length != 1) {
            for (let index = 0; index < newDirs.length - 1; index++) {
              const newDir = newDirs[index];
              createDirectory(path.join(loc.dirPath, newDir));
              tempDir = path.join(tempDir, newDir);
              fileTemp = fileTemp.replace(newDir + splitDir, '');
            }
          }
          const fileName: string = `${fileTemp}.dart`;
          const newName: string = path.join(
            loc.dirPath,
            tempDir,
            fileName.startsWith('_') ? `${loc.fileName}${fileName}` : `${loc.fileName}_${fileName}`,
          );
          const result: IFiles = {
            name: newName,
            content: await this.fc.getTemplateContent(file, config, loc.fileName, loc),
          };
          return result;
        } catch (ex) {
          console.log(ex);
          window.showErrorMessage(`Error: ${ex}`);
        }
      });
    let files = await Promise.all(filesASync);
    files = files.filter((c) => c.content != '');
    await createFiles(loc, files);

    const filesIndex: Promise<IFiles>[] = resource.files
      // tslint:disable-next-line:ter-arrow-parens
      // .filter((file) => (file.condition ? file.condition(config, []) : true))
      // tslint:disable-next-line:ter-arrow-parens
      .filter((file) => file === 'index')
      .map(async (file) => {
        try {
          const fileName: string = `${file}.dart`;
          const files: string[] = await fsReaddir(loc.dirPath);
          let contentStr = '';
          // tslint:disable-next-line:ter-arrow-parens
          for (const file of files.filter((c) => c.toLowerCase().includes('.dart'))) {
            if (file === 'index') {
              continue;
            }
            contentStr += `export '${file}';\r\n`;
          }
          const result: IFiles = {
            name: path.join(loc.dirPath, fileName),
            content: contentStr,
          };
          return result;
        } catch (ex) {
          console.log(ex);
          window.showErrorMessage(`Error: ${ex}`);
        }
      });
    let indexFiles = await Promise.all(filesIndex);
    indexFiles = indexFiles.filter((c) => c.content != '');
    await createFiles(loc, indexFiles);
  }
}
