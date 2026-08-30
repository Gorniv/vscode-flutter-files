import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from './models/config';
import { toUpperCase, toPrivateCase } from './formatting';
import { IPath } from './models/path';

type TemplateRenderer = (...args: string[]) => string;

const compileTemplate = (content: string, argumentNames: string[]): TemplateRenderer => {
  const render = Function(...argumentNames, `return \`${content}\`;`) as TemplateRenderer;
  return (...args: string[]) => render(...args);
};

export class FileContents {
  static TEMPLATES_FOLDER = 'templates';
  static TEMPLATE_ARGUMENTS = [
    'inputName',
    'upperName',
    'privateName',
    'appName',
    'relative',
    'params',
  ];

  private readonly templatesMap = new Map<string, TemplateRenderer>();

  async loadTemplates(
    pathDirectory: string,
    templatesMap: Map<string, TemplateRenderer>,
  ): Promise<Map<string, TemplateRenderer>> {
    if (!fs.existsSync(pathDirectory)) {
      return templatesMap;
    }

    const tempMap = await this.getTemplates(pathDirectory);
    for (const [key, value] of tempMap.entries()) {
      try {
        templatesMap.set(key, compileTemplate(value, FileContents.TEMPLATE_ARGUMENTS));
      } catch (error) {
        throw new Error(`Failed to compile template ${key}`, { cause: error });
      }
    }
    return templatesMap;
  }

  private async getTemplates(templatesPath: string): Promise<Map<string, string>> {
    const templateFiles = (await getFiles(templatesPath)).map((file) =>
      path.relative(templatesPath, file),
    );
    const templates = await Promise.all(
      templateFiles.map(
        async (file) =>
          [file, await fs.promises.readFile(path.join(templatesPath, file), 'utf8')] as const,
      ),
    );
    return new Map(templates);
  }

  async loadDirTemplates(pathDirectory: string): Promise<string[]> {
    const templatesPath = path.join(pathDirectory, FileContents.TEMPLATES_FOLDER);
    if (!fs.existsSync(templatesPath)) {
      return [];
    }

    const entries = await fs.promises.readdir(templatesPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  }

  public async getTemplateContent(
    template: string,
    config: IConfig,
    inputName: string,
    loc: IPath,
  ): Promise<string> {
    const pathSegments = loc.dirPath.split(path.sep);
    const libIndex = pathSegments.lastIndexOf('lib');
    const relative = libIndex === -1 ? '' : `/${pathSegments.slice(libIndex + 1).join('/')}`;
    const templateName = `${template}.tmpl`;
    const upperName = toUpperCase(inputName);
    const args = [inputName, upperName, toPrivateCase(upperName), config.appName, relative];
    const localTemplatesMap = await this.loadTemplates(
      loc.templateDirectory,
      new Map<string, TemplateRenderer>(),
    );
    const key = templateName.replaceAll('\\', path.sep);
    return localTemplatesMap.get(key)?.(...args) ?? this.templatesMap.get(key)?.(...args) ?? '';
  }
}

async function getFiles(directory: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await fs.promises.readdir(directory);
  for (const entry of entries) {
    const filePath = path.join(directory, entry);
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) {
      results.push(...(await getFiles(filePath)));
    } else {
      results.push(filePath);
    }
  }
  return results;
}
