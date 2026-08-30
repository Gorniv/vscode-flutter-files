import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IPath } from './models/path';
import { ResourceType } from './enums/resource-type';
import { FileContents } from './file-contents';
import { copyRecursiveSync } from './ioutil';
import { Command, ConfigExt } from './config-ext';
import { parseGenerationPath } from './generation-path';

interface CommandOption extends vscode.QuickPickItem {
  command: Command;
}

interface TemplateOption extends vscode.QuickPickItem {
  directory: string;
  value: string;
}

export const displayStatusMessage = (type: string, name: string, timeout = 2000) =>
  vscode.window.setStatusBarMessage(`${type} ${name} was successfully generated`, timeout);

// Show input prompt for folder name
export const showFileNameDialog = async (
  args: vscode.Uri | undefined,
  type: ResourceType,
  defaultTypeName: string,
  configExt: Map<string, ConfigExt>,
): Promise<IPath | undefined> => {
  let clickedFolderPath: string;
  if (args) {
    clickedFolderPath = args.fsPath;
  } else if (!vscode.window.activeTextEditor) {
    throw new Error(
      'Please open a file first.. or just right-click on a file/folder and use the context menu!',
    );
  } else {
    clickedFolderPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
  }

  const rootPath = fs.lstatSync(clickedFolderPath).isDirectory()
    ? clickedFolderPath
    : path.dirname(clickedFolderPath);
  const workspaceFolder =
    vscode.workspace.getWorkspaceFolder(vscode.Uri.file(rootPath)) ??
    vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    throw new Error('Please open a project first. Thanks! :-)');
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  if (type === ResourceType.Templates) {
    const from = path.join(__dirname, FileContents.TEMPLATES_FOLDER);
    const to = path.join(workspaceRoot, FileContents.TEMPLATES_FOLDER);
    await copyRecursiveSync(from, to);
    await vscode.window.showInformationMessage('Flutter Files templates copied to the project.');
    return undefined;
  }

  let fileName = `${type}`;
  if (type !== ResourceType.Index) {
    const input = await vscode.window.showInputBox({
      prompt: `Type the name of the new ${type}`,
      value: defaultTypeName,
    });
    if (input === undefined) {
      return undefined;
    }
    fileName = input;
  }

  const generationPath = parseGenerationPath(fileName, rootPath);

  const fc = new FileContents();
  const projectDirectories = await fc.loadDirTemplates(workspaceRoot);
  const bundledDirectories = await fc.loadDirTemplates(__dirname);
  const templateOptions: TemplateOption[] = [
    ...projectDirectories.map((value) => ({
      label: `${value} (project)`,
      directory: path.join(workspaceRoot, FileContents.TEMPLATES_FOLDER, value),
      value,
    })),
    ...bundledDirectories.map((value) => ({
      label: value,
      directory: path.join(__dirname, FileContents.TEMPLATES_FOLDER, value),
      value,
    })),
  ];

  let selectedCommand: CommandOption | undefined;
  if (type === ResourceType.Dynamic) {
    const commandOptions: CommandOption[] = [];
    const projectConfigPath = path.join(
      workspaceRoot,
      FileContents.TEMPLATES_FOLDER,
      'ff.config.json',
    );
    const bundledConfigPath = path.join(__dirname, FileContents.TEMPLATES_FOLDER, 'ff.config.json');
    const relevantConfig = configExt.get(projectConfigPath) ?? configExt.get(bundledConfigPath);
    if (!relevantConfig) {
      throw new Error('No commands found in ff.config.json');
    }
    for (const config of relevantConfig.configs) {
      for (const command of config.commands) {
        commandOptions.push({
          label: command.name,
          description: relevantConfig.name,
          command,
        });
      }
    }
    selectedCommand = await vscode.window.showQuickPick(commandOptions, {
      canPickMany: false,
      placeHolder: 'Select type command',
    });
    if (!selectedCommand) {
      return undefined;
    }
  }

  const availableTemplates = selectedCommand
    ? templateOptions.filter(({ value }) =>
        selectedCommand.command.templates.some(
          (template) => template === '*' || value.includes(template),
        ),
      )
    : templateOptions;
  const selectedTemplate =
    type === ResourceType.Index
      ? availableTemplates[0]
      : await vscode.window.showQuickPick(availableTemplates, {
          canPickMany: false,
          placeHolder: 'Select type templates',
        });
  if (!selectedTemplate) {
    return undefined;
  }

  return {
    fullPath: generationPath.fullPath,
    fileName: generationPath.fileName,
    dirName: generationPath.dirName,
    dirPath: rootPath,
    rootPath,
    templateDirectory: selectedTemplate.directory,
    command: selectedCommand?.command,
  };
};
