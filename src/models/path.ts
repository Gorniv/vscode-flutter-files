import { Command, ConfigElement } from '../config-ext';

export interface IPath {
  fileName: string;
  dirName: string;
  dirPath: string;
  fullPath: string;
  rootPath: string;
  templateDirectory: string;
  command: Command;
}
