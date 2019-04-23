import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from './models/config';
import { IPath } from './models/path';
import { FileContents } from './file-contents';
import { IFiles } from './models/file';
import { promisify } from './promisify';
import { toCamelCase, toUpperCase } from './formatting';
import { createFiles, createFolder } from './ioutil';
import { TemplateType } from './enums/template-type';
import { resources } from './resources';
import { ResourceType } from './enums/resource-type';
import { OptionType } from './enums/option-type';

const fsWriteFile = promisify(fs.writeFile);
const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

export class AngularCli {
  constructor(private readonly fc = new FileContents()) {
  }

  private async findModulePathRecursive(
    dir: string,
    fileList: any[] | string[],
    optionalFilterFunction: { (name: string): boolean; (arg0: string): boolean },
  ) {
    if (!fileList) {
      console.error("Variable 'fileList' is undefined or NULL.");
      return;
    }
    const files: string[] = await fsReaddir(dir);
    for (const i in files) {
      if (!files.hasOwnProperty(i)) {
        continue;
      }
      const name = path.join(dir, files[i]);
      const stat: fs.Stats = await fsStat(name);

      if (stat.isDirectory()) {
        await this.findModulePathRecursive(name, fileList, optionalFilterFunction);
      } else {
        if (optionalFilterFunction && optionalFilterFunction(name) !== true) {
          continue;
        }
        fileList.push(name);
      }
    }
  }

  private addToImport(data: string, fileName: string, type: string, relativePath: string) {
    const typeUpper = toUpperCase(type);
    const fileNameUpper = toUpperCase(fileName);

    const lastImportInx = data.lastIndexOf('import ');
    const endOfLastImportInx = data.indexOf('\n', lastImportInx);
    const fileLength = data.length;
    return (
      // tslint:disable-next-line:prefer-template
      data.substring(0, endOfLastImportInx) +
      `\nimport { ${fileNameUpper}${typeUpper} } from '${relativePath}/${fileName}.${type}';` +
      data.substring(endOfLastImportInx, fileLength)
    );
  }

  private parseNgModule(data: string) {
    const startPattern = '@NgModule({';
    const endPattern = '})';
    const startIndex = data.indexOf(startPattern) + startPattern.length;
    const endIndex = data.indexOf(endPattern, startIndex);
    const ngModuleStr = data
      .substring(startIndex, endIndex)
      .replace('{', '')
      .replace('}', '')
      .split(' ')
      .join('');

    const before = data.substring(0, startIndex - startPattern.length);
    const after = data.substring(endIndex + endPattern.length, data.length);

    const ngModuleTokens = ngModuleStr.split('],');

    const ngModuleTokenPairs = ngModuleTokens.map((t) => {
      const [key, val] = t.split(':');

      const values = val
        .replace('[', '')
        .replace(']', '')
        .split(',')
        // tslint:disable-next-line:ter-arrow-parens
        .map((item) => item.trim())
        // tslint:disable-next-line:ter-arrow-parens
        .filter((item) => item !== '');

      return [key.trim(), values] as [string, string[]];
    });

    const ngModuleMap = new Map<string, string[]>(ngModuleTokenPairs);

    return {
      data,
      before,
      after,
      ngModuleMap,
      toString: () => {
        const obj: any = {};
        ngModuleMap.forEach((value, key, map) => {
          obj[key] = value;
        });

        const moduleStr = JSON.stringify(obj, null, 3)
          .split('"')
          .join('');
        // tslint:disable-next-line:prefer-template
        return before + `@NgModule(${moduleStr})` + after;
      },
    };
  }

  private addToArray(
    ngModule: {
      data?: string;
      before?: string;
      after?: string;
      ngModuleMap: any;
      toString?: () => string;
    },
    fileName: string,
    type: string,
    prop: string,
  ) {
    const item = `${toUpperCase(fileName)}${toUpperCase(type)}`;
    if (ngModule.ngModuleMap.has(prop)) {
      const items = ngModule.ngModuleMap.get(prop);
      items.push(item);
    } else {
      ngModule.ngModuleMap.set(prop, [item]);
    }
  }

  private getRelativePath(dst: string, src: string) {
    const modulePath = path.parse(dst).dir;
    // tslint:disable-next-line:prefer-template
    return '.' + src.replace(modulePath, '').replace(/\\/g, '/');
  }

  private async addDeclarationsToModule(
    loc: IPath,
    type: string,
    module: string,
    exports: boolean = false,
  ) {
    const condition = (name: string) =>
      module ? name.includes(`${module}.module.ts`) : name.includes('.module.ts');

    const moduleFiles: never[] | [any] = [];
    await this.findModulePathRecursive(loc.rootPath, moduleFiles, condition);

    // at least one module is there
    if (moduleFiles.length > 0) {
      moduleFiles.sort((a: string, b: string) => path.dirname(a).length - path.dirname(b).length);

      // find closest module
      let [module] = moduleFiles;
      let minDistance = Infinity;

      for (const moduleFile of moduleFiles) {
        const moduleDirPath = path.parse(moduleFile).dir;
        const locPath = loc.dirPath.replace(loc.dirName, '');

        const distance = Math.abs(locPath.length - moduleDirPath.length);
        if (distance < minDistance) {
          minDistance = distance;
          module = moduleFile;
        }
      }

      const data: string = await fsReadFile(module, 'utf8');

      // relativePath
      const relativePath = this.getRelativePath(module, loc.dirPath);
      const content = this.addToImport(data, loc.fileName, type, relativePath);

      const ngModule = this.parseNgModule(content);

      this.addToArray(ngModule, loc.fileName, type, 'declarations');
      if (exports) {
        this.addToArray(ngModule, loc.fileName, type, 'exports');
      }

      await fsWriteFile(module, ngModule.toString());
    }
  }

  async generateResources(name: ResourceType, loc: IPath, config: IConfig) {
    const resource = resources.get(name);

    loc.dirName = resource.hasOwnProperty('locDirName')
      ? resource.locDirName(loc, config)
      : loc.dirName;
    loc.dirPath = resource.hasOwnProperty('locDirPath')
      ? resource.locDirPath(loc, config)
      : loc.dirPath;

    if (
      resource.hasOwnProperty('declaration') &&
      resource.declaration &&
      !config.defaults[name].skipImport
    ) {
      await this.addDeclarationsToModule(
        loc,
        resource.declaration,
        config.defaults[name].module,
        config.defaults[name].export,
      );
    }

    // tslint:disable-next-line:ter-arrow-parens
    if (resource.hasOwnProperty('createFolder') && resource.createFolder(config)) {
      await createFolder(loc);
    }

    const filesASync: Promise<IFiles>[] = resource.files
      // tslint:disable-next-line:ter-arrow-parens
      .filter((file) => (file.condition ? file.condition(config, loc.params) : true))
      // tslint:disable-next-line:ter-arrow-parens
      .filter((file) => file.name(config) !== 'index.dart')
      .map(async (file) => {
        try {
          const fileName: string = file.name(config);
          const newName: string = path.join(
            loc.dirPath,
            fileName.startsWith('_') ? `${loc.fileName}${fileName}` : `${loc.fileName}_${fileName}`,
          );
          const result: IFiles = {
            name: newName,
            content: await this.fc.getTemplateContent(file.type, config, loc.fileName, loc.params, loc),
          };
          return result;
        } catch (ex) {
          console.log(ex);
          await window.showErrorMessage(`Error: ${ex}`);
        }
      });

    const files = await Promise.all(filesASync);

    await createFiles(loc, files);

    const filesIndex: Promise<IFiles>[] = resource.files
      // tslint:disable-next-line:ter-arrow-parens
      .filter((file) => (file.condition ? file.condition(config, loc.params) : true))
      // tslint:disable-next-line:ter-arrow-parens
      .filter((file) => file.name(config) === 'index.dart')
      .map(async (file) => {
        try {
          const fileName: string = file.name(config);
          const files: string[] = await fsReaddir(loc.dirPath);
          let contentStr = '';
          // tslint:disable-next-line:ter-arrow-parens
          for (const file of files.filter((c) => c.toLowerCase().includes('.dart'))) {
            if (file === 'index.dart') {
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
          await window.showErrorMessage(`Error: ${ex}`);
        }
      });
    const indexFiles = await Promise.all(filesIndex);
    await createFiles(loc, indexFiles);
  }
}
