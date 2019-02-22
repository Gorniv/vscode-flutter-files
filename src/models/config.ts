export interface IProject {
  version: string;
  name: string;
}

export interface IEnvironments {
  source: string;
  dev: string;
  prod: string;
}

export interface IApp {
  root: string;
  outDir?: string;
  assets?: string[];
  index?: string;
  main?: string;
  test?: string;
  tsconfig?: string;
  environments?: IEnvironments;
}

export interface IProperties {
  flat?: boolean;
  [k: string]: any;
}

export interface IDefaults {
  bloc?: IProperties;
  event?: IProperties;
  model?: IProperties;
  page?: IProperties;
  provider?: IProperties;
  repository?: IProperties;
  screen?: IProperties;
  state?: IProperties;
  index?: IProperties;
}

export interface IConfig {
  project?: IProject;
  apps: IApp[];
  defaults: IDefaults;
  appName: string;
}
