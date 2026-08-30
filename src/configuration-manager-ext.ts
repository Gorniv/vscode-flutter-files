import { Disposable, RelativePattern, workspace } from 'vscode';
import * as fs from 'fs';
import deepMerge from './deep-merge';
import { ConfigExt } from './config-ext';
import * as path from 'path';
import { FileContents } from './file-contents';

type ConfigChangedCallback = () => void | Promise<void>;

export class ConfigurationManagerExt {
  private getFiles(): string[] {
    const from = path.join(__dirname, FileContents.TEMPLATES_FOLDER, 'ff.config.json');
    const projectFiles =
      workspace.workspaceFolders?.map(({ uri }) =>
        path.join(uri.fsPath, FileContents.TEMPLATES_FOLDER, 'ff.config.json'),
      ) ?? [];
    return [...projectFiles, from];
  }

  private async readConfigFile(): Promise<Map<string, object>> {
    const files = this.getFiles();
    const configMap = new Map<string, object>();
    while (files.length > 0) {
      const filePath = files.shift();
      if (!filePath || !fs.existsSync(filePath)) {
        continue;
      }
      const data = await fs.promises.readFile(filePath, 'utf8');
      const config = JSON.parse(data) as ConfigExt;

      // prevent parsing issues
      configMap.set(filePath, config);
    }

    return configMap;
  }

  private parseConfig(config: object): ConfigExt {
    return deepMerge({} as ConfigExt, config);
  }

  public async getConfig(): Promise<Map<string, ConfigExt>> {
    const configFile = await this.readConfigFile();
    return new Map([...configFile].map(([key, value]) => [key, this.parseConfig(value)]));
  }

  public watchConfigFiles(callback: ConfigChangedCallback): Disposable {
    const watchers =
      workspace.workspaceFolders?.map(({ uri }) =>
        workspace.createFileSystemWatcher(
          new RelativePattern(uri, `${FileContents.TEMPLATES_FOLDER}/ff.config.json`),
        ),
      ) ?? [];
    const subscriptions = watchers.flatMap((watcher) => {
      const notify = () => void callback();
      return [
        watcher,
        watcher.onDidCreate(notify),
        watcher.onDidChange(notify),
        watcher.onDidDelete(notify),
      ];
    });
    return Disposable.from(...subscriptions);
  }
}
