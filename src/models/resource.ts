import { IResourceFile } from './resource-file';

export interface IResource {
  locDirName?: Function;
  locDirPath?: Function;
  files: string[];
  createFolder?: Function;
  declaration?: string;
}
