import { IConfig } from './models/config';
import { Disposable, RelativePattern, Uri, workspace, window } from 'vscode';
import * as fs from 'fs';
import { config as defaultConfig } from './config/cli-config';
import deepMerge from './deep-merge';
import jsYaml = require('js-yaml');

type ConfigChangedCallback = () => void | Promise<void>;

const hasName = (value: unknown): value is { name: string } => {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  return typeof (value as { name?: unknown }).name === 'string';
};

export class ConfigurationManager {
  private static readonly analysis_options_file = 'analysis_options.yaml';

  private async readConfigFile(): Promise<Map<string, object>> {
    const files = await workspace.findFiles('{pubspec.yaml}', '');
    const configMap = new Map<string, object>();
    while (files.length > 0) {
      const [{ fsPath: filePath }] = files.splice(0, 1);

      const data = await fs.promises.readFile(filePath, 'utf8');

      const config: Partial<IConfig> = {};

      // prevent parsing issues
      try {
        const pubspec = jsYaml.load(data);
        if (!hasName(pubspec)) {
          throw new Error('The package name is missing');
        }
        config.appName = pubspec.name;
      } catch (ex) {
        window.showErrorMessage(
          `Invalid schema detected in pubspec.yaml, please correct and try again! error: ${ex}`,
        );
        throw Error('Invalid schema');
      }
      const key = workspace.getWorkspaceFolder(Uri.file(filePath))?.uri.fsPath;
      if (key) {
        configMap.set(key, config);
      }
    }

    return configMap;
  }

  private parseConfig(config: object): IConfig {
    return deepMerge({} as IConfig, defaultConfig, config);
  }

  public static async quote(projectPath?: string): Promise<string> {
    return (await ConfigurationManager._isSingleQuote(projectPath)) ? "'" : '"';
  }

  public static async _isSingleQuote(projectPath?: string): Promise<boolean> {
    try {
      const workspaceFolder = projectPath
        ? workspace.getWorkspaceFolder(Uri.file(projectPath))
        : undefined;
      const pattern = workspaceFolder
        ? new RelativePattern(workspaceFolder, this.analysis_options_file)
        : `{${this.analysis_options_file}}`;
      const files = await workspace.findFiles(pattern, null, 1);
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

  public watchConfigFiles(callback: ConfigChangedCallback): Disposable {
    const watcher = workspace.createFileSystemWatcher('**/pubspec.yaml');
    const notify = () => void callback();
    return Disposable.from(
      watcher,
      watcher.onDidCreate(notify),
      watcher.onDidChange(notify),
      watcher.onDidDelete(notify),
    );
  }
}
