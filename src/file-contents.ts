import * as fs from 'fs';
import * as path from 'path';
import * as es6Renderer from 'express-es6-template-engine';
import { IConfig } from './models/config';
import { toUpperCase, toPrivateCase } from './formatting';
import { promisify } from './promisify';
import { IPath } from './models/path';

const fsReaddir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const fsExists = promisify(fs.exists);

export class FileContents {
  static TEMPLATES_FOLDER = 'templates';
  static TEMPLATE_ARGUMENTS = 'inputName, upperName, privateName, appName, relative, params';

  private templatesMap: Map<string, Function>;
  private localTemplatesMap: Map<string, Function>;

  constructor() {
    this.templatesMap = new Map<string, Function>();
  }

  async loadTemplates(pathDirectory: string, templatesMap: Map<string, Function>) {
    if (!fs.existsSync(pathDirectory)) {
      return;
    }

    const tempMap: Map<string, string> = await this.getTemplates(pathDirectory);
    for (const [key, value] of tempMap.entries()) {
      try {
        const compiled = es6Renderer(value, FileContents.TEMPLATE_ARGUMENTS);
        templatesMap.set(key, compiled);
      } catch (e) {
        console.log(e);
      }
    }
    return templatesMap;
  }

  private async getTemplates(templatesPath: string): Promise<Map<string, string>> {
    const templatesFiles: string[] = await fsReaddir(templatesPath, 'utf-8');
    // tslint:disable-next-line:ter-arrow-parens
    const templatesFilesPromises = templatesFiles.map((t) =>
      // tslint:disable-next-line:ter-arrow-parens
      fsReadFile(path.join(templatesPath, t), 'utf8').then((data) => [t, data]),
    );
    const templates = await Promise.all(templatesFilesPromises);

    // tslint:disable-next-line:ter-arrow-parens
    return new Map(templates.map((x) => x as [string, string]));
  }

  async loadDirTemplates(pathDirectory: string) {
    const templatesPath = path.join(pathDirectory, FileContents.TEMPLATES_FOLDER);
    if (!fs.existsSync(templatesPath)) {
      return undefined;
    }

    const directories: string[] = await this.getDirTemplates(templatesPath);
    return directories.filter((c) => {
      return !c.endsWith('.tmpl') && !c.endsWith('.json');
    });
  }

  private async getDirTemplates(templatesPath: string): Promise<string[]> {
    const templatesFiles: string[] = await fsReaddir(templatesPath, 'utf-8');
    return templatesFiles;
  }

  public async getTemplateContent(
    template: string,
    config: IConfig,
    inputName: string,
    loc: IPath,
  ) {
    const paths = loc.dirPath.split(path.sep);
    let relative: string;
    let find = false;
    for (const item of paths) {
      if (find) {
        relative = `${relative}/${item}`;
      }
      if (item === 'lib') {
        find = true;
        relative = '';
      }
    }
    const templateName: string = `${template}.tmpl`;
    const upperName = toUpperCase(inputName);
    const args = [inputName, upperName, toPrivateCase(upperName), config.appName, relative];
    // load dynamic templates
    this.localTemplatesMap = new Map<string, Function>();
    this.localTemplatesMap = await this.loadTemplates(
      loc.templateDirectory,
      this.localTemplatesMap,
    );

    let resultTemplate =
      this.localTemplatesMap && this.localTemplatesMap.has(templateName)
        ? this.localTemplatesMap.get(templateName)(...args)
        : undefined;
    if (!resultTemplate) {
      /// use template from extension
      resultTemplate = this.templatesMap.has(templateName)
        ? this.templatesMap.get(templateName)(...args)
        : '';
    }
    return resultTemplate;
  }
}
