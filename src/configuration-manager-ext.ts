import { workspace, window, Uri } from 'vscode';
import * as fs from 'fs';
import { promisify } from './promisify';
import deepMerge from './deep-merge';
import { ConfigExt } from './config-ext';
import * as path from 'path';
import { FileContents } from './file-contents';

const readFileAsync = promisify(fs.readFile);

export class ConfigurationManagerExt {
  private getFiles(): string[] {
    const from = path.join(__dirname, FileContents.TEMPLATES_FOLDER, 'ff.config.json');
    const files = [path.join(workspace.rootPath, 'templates', 'ff.config.json'), from];
    return files;
  }
  private async readConfigFile(): Promise<Map<string, Object>> {
    const files = this.getFiles();
    const configMap = new Map<string, Object>();
    while (files.length > 0) {
      const filePath: string = files.splice(0, 1)?.toString();
      const fsExists = fs.existsSync(filePath);
      if (fsExists != true) {
        continue;
      }
      const data = await readFileAsync(filePath, 'utf8');
      const config: ConfigExt = JSON.parse(data);

      // prevent parsing issues
      configMap.set(filePath, config);
    }

    return configMap;
  }

  private parseConfig(config): ConfigExt {
    return deepMerge({}, config);
  }

  public async getConfig(): Promise<Map<string, ConfigExt>> {
    const configFile = await this.readConfigFile();
    return new Map([...configFile].map(([key, value]) => [key, this.parseConfig(value)]));
  }

  public watchConfigFiles(callback) {
    const files = this.getFiles();
    files.forEach((file) => {
      const fsExists = fs.existsSync(file);
      if (fsExists == true) {
        fs.watch(file, (eventType, filename) => {
          callback();
        });
      }
    });
  }
}
