import { IConfig } from './models/config';
import { workspace, window, Uri } from 'vscode';
import * as fs from 'fs';
import * as glob from 'glob';
import { config as defaultConfig } from './config/cli-config';
import { promisify } from './promisify';
import deepMerge from './deep-merge';
import jsYaml = require('js-yaml');

const readFileAsync = promisify(fs.readFile);

export class ConfigurationManager {
  private readonly CONFIG_FILES = ['pubspec.yaml'];

  private async readConfigFile(): Promise<Map<string, Object>> {
    const files = await workspace.findFiles('{pubspec.yaml}', '');
    const configMap = new Map<string, Object>();
    while (files.length > 0) {
      const [{ fsPath: filePath }] = files.splice(0, 1);

      const data = await readFileAsync(filePath, 'utf8');

      const config: any = {};

      // prevent parsing issues
      try {
        const pubspec = jsYaml.safeLoad(data);
        config.appName = pubspec.name;
      } catch (ex) {
        window.showErrorMessage(
          'Invalid schema detected in pubspec.yaml, please correct and try again!',
        );
        throw Error('Invalid schema');
      }
      configMap.set(workspace.getWorkspaceFolder(Uri.file(filePath)).name, config);
    }

    return configMap;
  }

  private parseConfig(config): IConfig {
    return deepMerge({}, defaultConfig, config);
  }

  public async getConfig(): Promise<Map<string, IConfig>> {
    const configFile = await this.readConfigFile();
    return new Map([...configFile].map(([key, value]) => [key, this.parseConfig(value)]));
  }

  public watchConfigFiles(callback) {
    if (workspace.rootPath) {
      fs.watch(workspace.rootPath, (eventType, filename) => {
        if (this.CONFIG_FILES.includes(filename)) {
          callback();
        }
      });
    }
  }
}
