import { ResourceType } from './enums/resource-type';
import { ICommand } from './models/command';
import { CommandType } from './enums/command-type';

export const commandsMap = new Map<CommandType, ICommand>([
  [CommandType.Bloc, { fileName: 'you_awesome', resource: ResourceType.Bloc }],
  [CommandType.Event, { fileName: 'you_awesome', resource: ResourceType.Event }],
  [CommandType.State, { fileName: 'you_awesome', resource: ResourceType.State }],
  [CommandType.Model, { fileName: 'you_awesome', resource: ResourceType.Model }],
  [CommandType.Page, { fileName: 'you_awesome', resource: ResourceType.Page }],
  [CommandType.Provider, { fileName: 'you_awesome', resource: ResourceType.Provider }],
  [CommandType.Repository, { fileName: 'you_awesome', resource: ResourceType.Repository }],
  [CommandType.Screen, { fileName: 'you_awesome', resource: ResourceType.Screen }],
  [CommandType.State, { fileName: 'you_awesome', resource: ResourceType.State }],
  [CommandType.Index, { fileName: 'you_awesome', resource: ResourceType.Index }],
]);
