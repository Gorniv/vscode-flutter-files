import * as path from 'path';
import { IConfig } from './models/config';
import { IPath } from './models/path';
import { FileContents } from './file-contents';
import { IFiles } from './models/file';
import { createDirectory, createFiles, createFolder } from './ioutil';
import { ResourcesDynamic } from './resources';
import { ResourceType } from './enums/resource-type';
import { ConfigElement } from './config-ext';
import { ConfigurationManager } from './configuration-manager';
import { createIndexContent } from './index-files';

export class AngularCli {
  constructor(private readonly fc = new FileContents()) {}

  async generateResources(
    name: ResourceType,
    loc: IPath,
    config: IConfig,
    configExt: ConfigElement,
  ): Promise<void> {
    const resource = loc.command
      ? ResourcesDynamic.resourcesCommand(loc.command)
      : ResourcesDynamic.resourcesDynamic(configExt).get(name);

    if (!resource) {
      throw new Error(`Can't find key '${name}' in ff.config.json`);
    }

    const destinationPath = resource.locDirPath?.(loc, config) ?? loc.dirPath;
    const destinationName = resource.locDirName?.(loc, config) ?? loc.dirName;
    loc.dirName = destinationName;
    loc.dirPath = destinationPath;

    if (resource.createFolder?.(config)) {
      await createFolder(loc);
    }

    const files = await Promise.all(
      resource.files
        .filter((file) => file !== 'index')
        .map(async (file): Promise<IFiles> => {
          const pathParts = file.split('\\');
          let tempDirectory = '';
          let templateName = file;
          if (pathParts.length > 1) {
            for (const newDirectory of pathParts.slice(0, -1)) {
              tempDirectory = path.join(tempDirectory, newDirectory);
              await createDirectory(path.join(loc.dirPath, tempDirectory));
              templateName = templateName.replace(`${newDirectory}\\`, '');
            }
          }
          const fileName = `${templateName}.dart`;
          const newName = path.join(
            loc.dirPath,
            tempDirectory,
            fileName.startsWith('_') ? `${loc.fileName}${fileName}` : `${loc.fileName}_${fileName}`,
          );
          return {
            name: newName,
            content: await this.fc.getTemplateContent(file, config, loc.fileName, loc),
          };
        }),
    );
    await createFiles(
      loc,
      files.filter(({ content }) => content !== ''),
    );

    const indexFiles = await this.createIndexFile({ files: resource.files }, loc);
    await createFiles(
      loc,
      indexFiles.filter(({ content }) => content !== ''),
    );
  }

  async createIndexFile(
    resource: { files: string[] },
    loc: { dirPath: string },
  ): Promise<IFiles[]> {
    return Promise.all(
      resource.files
        .filter((file) => file === 'index')
        .map(async (file): Promise<IFiles> => {
          const fileName = `${file}.dart`;
          const quote = await ConfigurationManager.quote(loc.dirPath);

          return {
            name: path.join(loc.dirPath, fileName),
            content: await createIndexContent(loc.dirPath, quote),
          };
        }),
    );
  }
}
