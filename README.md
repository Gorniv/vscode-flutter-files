# VS Code Flutter Files

[![Awesome Flutter](https://img.shields.io/badge/Awesome-Flutter-blue.svg?longCache=true&style=flat-square)](https://github.com/Solido/awesome-flutter#vscode)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/gornivv.vscode-flutter-files)](https://marketplace.visualstudio.com/items?itemName=gornivv.vscode-flutter-files)

This extension allows **quickly scaffold flutter BLoC templates** in VS Code project.

This extension use:
- <https://github.com/felangel/bloc> for BLoC (base)
- <https://pub.dev/packages/ff_bloc> for (my way from real code)

How it works(Russian lang) - https://vas3k.club/post/10567/

## Please, support me:
- Add me on [linkedin](https://www.linkedin.com/in/gorniv/)
- install my 'Tool for iOS developers: [aso.dev](https://aso.dev?utm_source=ext&utm_medium=f_f)'
- install my 'Music player for Apple Music: [meows.app](https://meows.app?utm_source=ext&utm_medium=f_f)'

![demo](https://github.com/Gorniv/vscode-flutter-files/raw/master/assets/flutter.gif)

## Custom(dynamic) templates

Copy [templates](./templates) directory to your project (by command "[FF] Copy templates to project") and change any of content files (bloc,event,model,page,provider,repository,scree,state)

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## Features

Right click on a file or a folder in your current project.
You can find multiple options been added to the context menu:

| Menu Options        |
| ------------------- |
| New Big Pack Bloc   |
| New Small Pack Bloc |
| New with dynamic config |

| Menu Options   |
| -------------- |
| New Bloc       |
| New Event      |
| New Model      |
| New Page       |
| New Provider   |
| New Repository |
| New Screen     |
| New State      |

| Menu Options |
| ------------ |
| New Index    |

## Disclaimer

**Important:** This extension due to the nature of it's purpose will create
files on your hard drive and if necessary create the respective folder structure.
While it should not override any files during this process, I'm not giving any guarantees
or take any responsibility in case of lost data.

Fork https://github.com/ivalexa/vscode-angular2-files

## License

MIT
