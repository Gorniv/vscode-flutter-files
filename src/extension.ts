import { ExtensionContext, commands, workspace, Uri } from 'vscode';
import { ConfigurationManager } from './configuration-manager';
import { showFileNameDialog, displayStatusMessage } from './editor';
import { commandsMap } from './commands';
import { toTileCase } from './formatting';
import { AngularCli } from './angular-cli';
import { ResourceType } from './enums/resource-type';
import { IConfig } from './models/config';
import { config as defaultConfig } from './config/cli-config';
import { ConfigExt } from './config-ext';
import { ConfigurationManagerExt } from './configuration-manager-ext';

export async function activate(context: ExtensionContext) {
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  const cmExt = new ConfigurationManagerExt();
  let configMap: Map<string, IConfig>;
  let configExtMap: Map<string, ConfigExt>;

  setImmediate(async () => (configMap = await cm.getConfig()));
  setImmediate(async () => (configExtMap = await cmExt.getConfig()));

  // watch and update on config file changes
  cm.watchConfigFiles(async () => (configMap = await cm.getConfig()));
  cmExt.watchConfigFiles(async () => (configExtMap = await cmExt.getConfig()));

  const showDynamicDialog = async (args: any, fileName: string, resource: ResourceType) => {
    const loc = await showFileNameDialog(args, resource, fileName, configExtMap);

    const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(loc.fullPath));
    let config =
      (workspaceFolder &&
        configMap.has(workspaceFolder.name) &&
        configMap.get(workspaceFolder.name)) ||
      defaultConfig;
    let resourceConfig: IConfig = {
      ...config,
      appPath: (workspaceFolder && workspaceFolder.uri.fsPath) || workspace.rootPath,
    };

    let arr = [...configExtMap];
    let lastIndex = configExtMap.size - 1;
    let confLast = arr[lastIndex][1];
    let defaultConfigExt = confLast.configs[0];
    await angularCli.generateResources(
      resource,
      loc,
      resourceConfig,
      defaultConfigExt,
    );
    displayStatusMessage(toTileCase(resource), loc.fileName);
  };
  for (let [key, value] of commandsMap) {
    const command = commands.registerCommand(key, (args) => {
      return showDynamicDialog(args, value.fileName, value.resource);
    });
    context.subscriptions.push(command);
  }
}
