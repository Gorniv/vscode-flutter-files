import * as fs from 'fs';
import * as path from 'path';
import * as es6Renderer from 'express-es6-template-engine';
import { IConfig } from './models/config';
import { toCamelCase, toUpperCase, toPrivateCase } from './formatting';
import { promisify } from './promisify';
import { TemplateType } from './enums/template-type';
import { IPath } from './models/path';
import { workspace, window } from 'vscode';

const fsReaddir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const fsExists = promisify(fs.exists);

const TEMPLATES_FOLDER = 'templates';
const TEMPLATE_ARGUMENTS = 'inputName, upperName, privateName, appName, relative, params';

export class FileContents {
  private templatesMap: Map<string, Function>;
  private localTemplatesMap: Map<string, Function>;

  constructor() {
    this.templatesMap = new Map<string, Function>();
    this.loadTemplates(__dirname, this.templatesMap);
  }

  async loadTemplates(pathDirectory: string, templatesMap: Map<string, Function>) {
    const templatesPath = path.join(pathDirectory, TEMPLATES_FOLDER);
    if (!fs.existsSync(templatesPath)) {
      return;
    }

    const tempMap = await this.getTemplates(templatesPath);
    for (const [key, value] of tempMap.entries()) {
      try {
        const compiled = es6Renderer(value, TEMPLATE_ARGUMENTS);
        templatesMap.set(key, compiled);
      } catch (e) {
        console.log(e);
      }
    }
    return templatesMap;
  }

  private async getTemplates(templatesPath: string) {
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

  public async getTemplateContent(
    template: TemplateType,
    config: IConfig,
    inputName: string,
    params: string[] = [],
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
    const templateName: string = template;
    const upperName = toUpperCase(inputName);
    const args = [inputName, upperName, toPrivateCase(upperName), config.appName, relative, params];
    // load dynamic templates
    this.localTemplatesMap = new Map<string, Function>();
    this.localTemplatesMap = await this.loadTemplates(workspace.rootPath, this.localTemplatesMap);

    let resultTemplate = this.localTemplatesMap && this.localTemplatesMap.has(templateName)
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
