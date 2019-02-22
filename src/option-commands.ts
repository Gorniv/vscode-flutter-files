import { OptionType } from './enums/option-type';
import { OptionItem } from './models/option-item';

export const optionsCommands = new Map<OptionType, OptionItem>([
  [
    OptionType.Flat,
    {
      commands: ['--flat'],
      type: 'True | False',
      configPath: 'defaults.{resource}.flat',
      description: 'Flag to indicate if a dir is created.',
    },
  ],
  [OptionType.AppName, { commands: ['-a', '-p'], description: 'Package name' }],
  [OptionType.ShowOptions, { commands: ['-o'], description: 'Allow to override options' }],
]);
