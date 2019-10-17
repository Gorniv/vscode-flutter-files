import { ExtensionContext, commands, window, workspace, Uri } from 'vscode';
import { ConfigurationManager } from './configuration-manager';
import {
  showFileNameDialog,
  showWarning,
  showOptionsDialog,
  displayStatusMessage,
  configureOptionsValues,
  mapConfigValues,
} from './editor';
import { commandsMap } from './commands';
import { toTileCase } from './formatting';
import { AngularCli } from './angular-cli';
import { ResourceType } from './enums/resource-type';
import { IConfig } from './models/config';
import { OptionType } from './enums/option-type';
import { config as defaultConfig } from './config/cli-config';

export async function activate(context: ExtensionContext) {
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  let configMap: Map<string, IConfig>;

  setImmediate(async () => (configMap = await cm.getConfig()));

  // watch and update on config file changes
  cm.watchConfigFiles(async () => (configMap = await cm.getConfig()));

  const showDynamicDialog = async (args: any, fileName: string, resource: ResourceType) => {
    const loc = await showFileNameDialog(args, resource, fileName);

    const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(loc.fullPath));
    const config =
      (workspaceFolder &&
        configMap.has(workspaceFolder.name) &&
        configMap.get(workspaceFolder.name)) ||
      defaultConfig;
    let resourceConfig: IConfig = {
      ...config,
      appPath: (workspaceFolder && workspaceFolder.uri.fsPath) || workspace.rootPath,
    };

    if (loc.params.includes(OptionType.ShowOptions)) {
      const selectedOptions = await showOptionsDialog(config, loc, resource);
      if (selectedOptions) {
        const optionsValuesMap = await configureOptionsValues(
          config,
          loc,
          resource,
          selectedOptions,
        );
        loc.params = [...new Set([...loc.params, ...optionsValuesMap.keys()])];
        resourceConfig = mapConfigValues(config, resource, optionsValuesMap);
      }
    } else {
      if (loc && loc.paramsMap && loc.paramsMap.size > 0) {
        resourceConfig = mapConfigValues(config, resource, loc.paramsMap);
      }
    }

    await angularCli.generateResources(resource, loc, resourceConfig);
    displayStatusMessage(toTileCase(resource), loc.fileName);
  };

  for (const [key, value] of commandsMap) {
    const command = commands.registerCommand(key, (args) => {
      return showDynamicDialog(args, value.fileName, value.resource);
    });
    context.subscriptions.push(command);
  }
}
