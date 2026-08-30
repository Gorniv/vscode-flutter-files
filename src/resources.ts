import * as path from 'path';
import { IResource } from './models/resource';
import { Command, ConfigElement } from './config-ext';

export class ResourcesDynamic {
  static resourcesDynamic(config: ConfigElement): Map<string, IResource> {
    const result = new Map<string, IResource>();
    config.commands.forEach((e) => {
      const temp = ResourcesDynamic.resourcesCommand(e);
      const newKey = e.key ?? e.files.join('');
      result.set(newKey, temp);
    });
    return result;
  }

  static resourcesCommand(command: Command): IResource {
    return {
      locDirName: (loc) => (command.files.length > 1 ? loc.fileName : loc.dirName),
      locDirPath: (loc) =>
        command.files.length > 1
          ? path.join(loc.dirPath, loc.dirName, loc.fileName)
          : path.join(loc.dirPath, loc.dirName),
      files: command.files,
      createFolder: () => command.files.length > 1,
    };
  }
}
