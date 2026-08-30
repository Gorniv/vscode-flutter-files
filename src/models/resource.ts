import { IConfig } from './config';
import { IPath } from './path';

export interface IResource {
  locDirName?: (loc: IPath, config: IConfig) => string;
  locDirPath?: (loc: IPath, config: IConfig) => string;
  files: string[];
  createFolder?: (config: IConfig) => boolean;
  declaration?: string;
}
