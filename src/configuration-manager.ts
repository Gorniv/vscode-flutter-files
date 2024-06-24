import { IConfig } from './models/config';
import { workspace, window, Uri } from 'vscode';
import * as fs from 'fs';
import { config as defaultConfig } from './config/cli-config';
import { promisify } from './promisify';
import deepMerge from './deep-merge';
import jsYaml = require('js-yaml');

const readFileAsync = promisify(fs.readFile);

export class ConfigurationManager {
  private readonly CONFIG_FILES = ['pubspec.yaml'];
  private static readonly analysis_options_file = 'analysis_options.yaml';

  private async readConfigFile(): Promise<Map<string, Object>> {
    const files = await workspace.findFiles('{pubspec.yaml}', '');
    const configMap = new Map<string, Object>();
    while (files.length > 0) {
      const [{ fsPath: filePath }] = files.splice(0, 1);

      const data = await readFileAsync(filePath, 'utf8');

      const config: any = {};

      // prevent parsing issues
      try {
        const pubspec = jsYaml.load(data);
        config.appName = pubspec.name;
      } catch (ex) {
        window.showErrorMessage(
          `Invalid schema detected in pubspec.yaml, please correct and try again! error: ${ex}`,
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
  static _singleQuote = undefined;
  public static async quote(): Promise<String> {
    return (await ConfigurationManager._isSingleQuote()) ? "'" : '"';
  }

  public static async _isSingleQuote(): Promise<boolean> {
    if (ConfigurationManager._singleQuote !== undefined) {
      return ConfigurationManager._singleQuote;
    }
    try {
      const files = await workspace.findFiles(`{${this.analysis_options_file}}`, '');
      if (files.length === 0) {
        console.error('analysis_options.yaml not found');
        return true;
      }
      const [{ fsPath: filePath }] = files.splice(0, 1);
      const fileData = fs.readFileSync(filePath, 'utf8');
      const result =
        fileData.includes('prefer_double_quotes: false') ||
        fileData.includes('prefer_single_quotes: true') ||
        (fileData.includes('prefer_single_quotes') && !fileData.includes('prefer_double_quotes'));
      ConfigurationManager._singleQuote = result;
      return result;
    } catch (ex) {
      console.error(ex);
      return true;
    }
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
