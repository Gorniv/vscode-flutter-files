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
import { ConfigurationManager } from './configuration-manager';

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

    if (!resource) {
      window.showErrorMessage(`Error: can't found key = '${name}' in ff.config.json`);
      return;
    }

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

    let indexFiles = await this.createIndexFile({ files: resource.files }, loc);
    indexFiles = indexFiles.filter((c) => c.content != '');
    await createFiles(loc, indexFiles);
  }

  // Function to read directory recursively and gather .dart files
  async readDirectoryRecursive(dirPath: string, fileList: string[] = []): Promise<string[]> {
    const files = await fs.promises.readdir(dirPath);
    if (fileList.length > 0 && files.includes('index.dart')) {
      fileList.push(path.join(dirPath, 'index.dart'));
      return fileList;
    }

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) {
        await this.readDirectoryRecursive(filePath, fileList); // Recursively read subdirectory
      } else {
        if (
          file.toLowerCase().endsWith('.dart') &&
          !file.toLowerCase().includes('.g.dart') &&
          !file.toLowerCase().includes('.freezed.dart')
        ) {
          fileList.push(filePath);
        }
      }
    }

    return fileList;
  }

  async createIndexFile(
    resource: { files: string[] },
    loc: { dirPath: string },
  ): Promise<IFiles[]> {
    const filesIndex: Promise<IFiles>[] = resource.files
      .filter((file) => file === 'index')
      .map(async (file) => {
        try {
          const fileName = `${file}.dart`;
          const files = await this.readDirectoryRecursive(loc.dirPath);
          let contentStr = '';
          const quota = await ConfigurationManager.quote();
          for (const filePath of files) {
            const relativeFilePath = path.relative(loc.dirPath, filePath).replace(/\\/g, '/');
            if (relativeFilePath === 'index.dart') {
              continue;
            }
            contentStr += `export ${quota}${relativeFilePath}${quota};\r\n`;
          }

          const result: IFiles = {
            name: path.join(loc.dirPath, fileName),
            content: contentStr,
          };

          return result;
        } catch (ex) {
          console.error(ex);
          window.showErrorMessage(`Error: ${ex}`);
        }
      });

    return Promise.all(filesIndex);
  }
}
