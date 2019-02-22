import { IConfig } from './models/config';
import { workspace, window } from 'vscode';
import * as fs from 'fs';
import { config as defaultConfig } from './config/cli-config';
import { promisify } from './promisify';
import deepMerge from './deep-merge';
import jsYaml = require('js-yaml');

const readFileAsync = promisify(fs.readFile);

export class ConfigurationManager {
  private currentRootPath: string = null;
  private readonly CONFIG_FILES = ['pubspec.yaml'];

  private async readConfigFile(): Promise<Object> {
    const files = await workspace.findFiles('{pubspec.yaml}', '', 1);
    this.currentRootPath = workspace.rootPath;
    if (files.length > 0) {
      const [{ fsPath: filePath }] = files;

      const data = await readFileAsync(filePath, 'utf8');

      let config = {};

      // prevent parsing issues
      try {
        config = jsYaml.safeLoad(data);
      } catch (ex) {
        window.showErrorMessage(
          'Invalid schema detected in pubspec.yaml, please correct and try again!',
        );
        throw Error('Invalid schema');
      }

      return config;
    }

    return defaultConfig;
  }

  private parseConfig(config): IConfig {
    if (config.hasOwnProperty('projects')) {
      const newConfig: IConfig = JSON.parse(JSON.stringify(defaultConfig));
      return newConfig;
    }

    return deepMerge({}, defaultConfig, config);
  }

  public async getConfig() {
    const configFile = await this.readConfigFile();
    return this.parseConfig(configFile);
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
