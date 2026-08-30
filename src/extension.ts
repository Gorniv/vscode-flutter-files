import { ExtensionContext, Uri, commands, workspace } from 'vscode';
import { ConfigurationManager } from './configuration-manager';
import { showFileNameDialog, displayStatusMessage } from './editor';
import { commandsMap } from './commands';
import { toTileCase } from './formatting';
import { AngularCli } from './angular-cli';
import { ResourceType } from './enums/resource-type';
import { config as defaultConfig } from './config/cli-config';
import { ConfigurationManagerExt } from './configuration-manager-ext';
import { CommandType } from './enums/command-type';
import * as vscode from 'vscode';

export async function activate(context: ExtensionContext) {
  const angularCli = new AngularCli();
  const cm = new ConfigurationManager();
  const cmExt = new ConfigurationManagerExt();
  let [configMap, configExtMap] = await Promise.all([cm.getConfig(), cmExt.getConfig()]);

  // watch and update on config file changes
  context.subscriptions.push(
    cm.watchConfigFiles(async () => {
      configMap = await cm.getConfig();
    }),
    cmExt.watchConfigFiles(async () => {
      configExtMap = await cmExt.getConfig();
    }),
  );

  const showDynamicDialog = async (
    args: Uri | undefined,
    fileName: string,
    resource: ResourceType,
  ): Promise<void> => {
    try {
      const loc = await showFileNameDialog(args, resource, fileName, configExtMap);
      if (!loc) {
        return;
      }

      const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(loc.fullPath));
      const config = configMap.get(workspaceFolder?.uri.fsPath ?? '') ?? defaultConfig;
      const resourceConfig = {
        ...config,
        appPath: workspaceFolder?.uri.fsPath ?? loc.rootPath,
      };

      const defaultConfigExt = [...configExtMap.values()].at(-1)?.configs[0];
      if (!defaultConfigExt) {
        throw new Error('No commands found in ff.config.json');
      }
      await angularCli.generateResources(resource, loc, resourceConfig, defaultConfigExt);
      displayStatusMessage(toTileCase(resource), loc.fileName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await vscode.window.showErrorMessage(`Flutter Files: ${message}`);
    }
  };

  const command = commands.registerCommand(CommandType.AsoDev, () => {
    return vscode.env.openExternal(vscode.Uri.parse('https://aso.dev'));
  });
  context.subscriptions.push(command);
  for (const [key, value] of commandsMap) {
    const command = commands.registerCommand(key, (args: Uri | undefined) => {
      return showDynamicDialog(args, value.fileName, value.resource);
    });
    context.subscriptions.push(command);
  }
}
