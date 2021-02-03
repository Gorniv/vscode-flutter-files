import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IPath } from './models/path';
import { ResourceType } from './enums/resource-type';
import { FileContents } from './file-contents';
import { copyRecursiveSync } from './ioutil';
import { Command, ConfigElement, ConfigExt } from './config-ext';

export const displayStatusMessage = (type: string, name: string, timeout = 2000) =>
  vscode.window.setStatusBarMessage(`${type} ${name} was successfully generated`, timeout);

// Show input prompt for folder name
export const showFileNameDialog = async (
  args: any,
  type: ResourceType,
  defaultTypeName,
  configExt: Map<string, ConfigExt>,
): Promise<IPath> => {
  let clickedFolderPath: string;
  if (args) {
    clickedFolderPath = args.fsPath;
  } else {
    if (!vscode.window.activeTextEditor) {
      throw new Error(
        'Please open a file first.. or just right-click on a file/folder and use the context menu!',
      );
    } else {
      clickedFolderPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
    }
  }

  const rootPath = fs.lstatSync(clickedFolderPath).isDirectory()
    ? clickedFolderPath
    : path.dirname(clickedFolderPath);

  if (vscode.workspace.rootPath === undefined) {
    throw new Error('Please open a project first. Thanks! :-)');
  } else {
    let fileName = `${type}`;
    if (type === ResourceType.Templates) {
      const from = path.join(__dirname, FileContents.TEMPLATES_FOLDER);
      const to = path.join(vscode.workspace.rootPath, FileContents.TEMPLATES_FOLDER);
      await copyRecursiveSync(from, to);
      return;
    }
    if (type !== ResourceType.Index) {
      fileName = await vscode.window.showInputBox({
        prompt: `Type the name of the new ${type}`,
        value: `${defaultTypeName}`,
      });
    }

    if (!fileName) {
      throw new Error("That's not a valid name! (no whitespaces or special characters)");
    } else {
      let dirName = '';
      const fc = new FileContents();
      const dirsRoot = await fc.loadDirTemplates(vscode.workspace.rootPath);
      // if (dirsRoot && dirsRoot.length === 0) {
      //   dirsRoot.push('');
      // }
      const dirs = await fc.loadDirTemplates(__dirname);
      let i = 0;
      let allDir = [
        ...(dirsRoot?.map((c) => {
          i += 1;
          return {
            title: `${i}. ` + c.concat('(project)'),
            project: true,
            value: c,
          };
        }) ?? []),
        ...dirs.map((c) => {
          i += 1;
          return { title: `${i}. ` + c, project: false, value: c };
        }),
      ];

      let index = 0;
      let choosedCommand = null;
      if (type === ResourceType.Dynamic) {
        let commands = [];
        for (const kv of configExt) {
          const element: ConfigExt = kv[1];
          for (const item of element.configs) {
            item.commands.forEach((c) =>
              commands.push({
                title: `${c.name} (${element.name})`,
                kv: kv,
                item: item,
                command: c,
              }),
            );
          }
        }
        let commandsShow = commands.map((c) => {
          index += 1;
          return `${index}. ${c.title}`;
        });
        const command = await vscode.window.showQuickPick(commandsShow, {
          canPickMany: false,
          placeHolder: 'Select type command',
        });
        let indexOfCommand = commandsShow.indexOf(command);
        choosedCommand = commands[indexOfCommand];
        console.log(command);
      }
      let directory;
      let dirsShow: string[];
      if (choosedCommand != null) {
        let choosedCommandValue: Command = choosedCommand.command as Command;
        dirsShow = allDir
          .filter((c) =>
            choosedCommandValue.templates.some((tem) => c.value.includes(tem) || tem == '*'),
          )
          .map((c) => {
            return `${c.title}`;
          });
      } else {
        dirsShow = allDir.map((c) => {
          return `${c.title}`;
        });
      }

      if (type !== ResourceType.Index) {
        directory = await vscode.window.showQuickPick(dirsShow, {
          canPickMany: false,
          placeHolder: 'Select type templates',
        });
      } else {
        directory = dirsShow[0];
      }
      const indexStr = directory.split('.')[0];
      const indexDirectory = parseInt(indexStr, 0);
      let templateDirectory = '';
      if (dirsRoot && indexDirectory <= dirsRoot.length) {
        templateDirectory = path.join(
          vscode.workspace.rootPath,
          FileContents.TEMPLATES_FOLDER,
          dirsRoot[indexDirectory - 1],
        );
      } else {
        templateDirectory = path.join(
          __dirname,
          FileContents.TEMPLATES_FOLDER,
          dirs[indexDirectory - (dirsRoot?.length ?? 0) - 1],
        );
      }

      [fileName] = fileName.split(' ');
      const fullPath = path.join(rootPath, fileName);

      if (fileName.indexOf('\\') !== -1) {
        [dirName, fileName] = fileName.split('\\');
      }
      const dirPath = path.join(rootPath, dirName);
      const result: IPath = {
        fullPath,
        fileName,
        dirName,
        dirPath,
        rootPath,
        templateDirectory,
        command: choosedCommand?.command,
      };
      return result;
    }
  }
};

export const showWarning = async (): Promise<any> => {
  vscode.window.showInformationMessage('Please install latest version of vscode', 'Got It');
};
