
export interface ConfigExt {
    name:    string;
    configs: ConfigElement[];
}

export interface ConfigElement {
    name:     string;
    commands: Command[];
}

export interface Command {
    name:      string;
    key?:      string;
    templates: string[];
    files:     string[];
}
