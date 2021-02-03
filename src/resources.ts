import * as path from 'path';
import { IResource } from './models/resource';
import { IConfig } from './models/config';
import { Command, ConfigElement } from './config-ext';
export class ResourcesDynamic {
  static resourcesDynamic(config: ConfigElement): Map<String, IResource> {
    let result = new Map<String, IResource>();
    config.commands.forEach((e) => {
      let temp = ResourcesDynamic.resourcesCommand(e);
      let newKey = e.key ?? e.files.join('');
      result.set(newKey, temp);
    });
    return result;
  }

  static resourcesCommand(command: Command): IResource {
    let temp = {
      locDirName: (loc) => (command.files.length > 1 ? loc.fileName : loc.dirName),
      locDirPath: (loc) => path.join(loc.dirPath, loc.dirName),

      files: command.files,
      createFolder: () => command.files.length > 1,
    };

    return temp;
  }
}
