import * as fs from 'fs';
import * as path from 'path';
import * as es6Renderer from 'express-es6-template-engine';
import { IConfig } from './models/config';
import { toCamelCase, toUpperCase, toPrivateCase } from './formatting';
import { promisify } from './promisify';
import { TemplateType } from './enums/template-type';
import { IPath } from './models/path';

const fsReaddir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const TEMPLATES_FOLDER = 'templates';
const TEMPLATE_ARGUMENTS = 'inputName, upperName, privateName, appName, relative, params';

export class FileContents {
  private templatesMap: Map<string, Function>;

  constructor() {
    this.templatesMap = new Map<string, Function>();
  }

  async loadTemplates() {
    const map = new Map();

    const templatesMap = await this.getTemplates();

    for (const [key, value] of templatesMap.entries()) {
      try {
        const compiled = es6Renderer(value, TEMPLATE_ARGUMENTS);
        this.templatesMap.set(key, compiled);
      } catch (e) {
        console.log(e);
      }
    }
  }

  private async getTemplates() {
    const templatesPath = path.join(__dirname, TEMPLATES_FOLDER);
    const templatesFiles: string[] = await fsReaddir(templatesPath, 'utf-8');
    // tslint:disable-next-line:ter-arrow-parens
    const templatesFilesPromises = templatesFiles.map((t) =>
      // tslint:disable-next-line:ter-arrow-parens
      fsReadFile(path.join(__dirname, TEMPLATES_FOLDER, t), 'utf8').then((data) => [t, data]),
    );
    const templates = await Promise.all(templatesFilesPromises);

    // tslint:disable-next-line:ter-arrow-parens
    return new Map(templates.map((x) => x as [string, string]));
  }

  public getTemplateContent(
    template: TemplateType,
    config: IConfig,
    inputName: string,
    params: string[] = [],
    loc: IPath,
  ) {
    const paths = loc.dirPath.split('/');
    let relative;
    let find = false;
    for (const item of paths) {
      if (find) {
        relative = path.join(relative, item);
      }
      if (item === 'lib') {
        find = true;
        relative = '';
      }
    }
    const templateName: string = template;
    const upperName = toUpperCase(inputName);
    const args = [inputName, upperName, toPrivateCase(upperName), config.appName, relative, params];

    return this.templatesMap.has(templateName) ? this.templatesMap.get(templateName)(...args) : '';
  }
}
