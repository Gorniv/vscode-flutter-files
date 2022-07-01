# VS Code Flutter Files

[![Awesome Flutter](https://img.shields.io/badge/Awesome-Flutter-blue.svg?longCache=true&style=flat-square)](https://github.com/Solido/awesome-flutter#vscode)
[![Install](https://vsmarketplacebadge.apphb.com/installs-short/gornivv.vscode-flutter-files.svg)](https://marketplace.visualstudio.com/items?itemName=gornivv.vscode-flutter-files)

This extension allows **quickly scaffold flutter BLoC templates** in VS Code project.

This extension use <https://github.com/felangel/bloc> for BLoC

How it works(Russian lang) - https://vas3k.club/post/10567/

## Support me - Add me on [linkedin](https://www.linkedin.com/in/gorniv/)

## Support me - install my music player: [meows.app](https://meows.app?utm_source=ext&utm_medium=f_f)

![demo](https://github.com/Gorniv/vscode-flutter-files/raw/master/assets/flutter.gif)

## Custom(dynamic) templates

Copy [templates](./templates) directory to your project (by command "[FF] Copy templates to project") and change any of content files (bloc,event,model,page,provider,repository,scree,state)

## Changelog

## [3.1.0](https://github.com/Gorniv/vscode-flutter-files/compare/v2.2.0...v3.1.0) (2021-02-03)

### Features

- dynamic commands and config ([7142dee](https://github.com/Gorniv/vscode-flutter-files/commit/7142dee64d3fac7ab2e4377d8b394952e20265a4))

## 2.2.0 (2020-08-15)

### Features

- support v.6 bloc ([01d4ce2](https://github.com/Gorniv/vscode-flutter-files/commit/01d4ce2dff1e8746e8348661415ddf5f93caf287))
- support v5 ([965a07c](https://github.com/Gorniv/vscode-flutter-files/commit/965a07cdef5a3393bdc398518c397b7a80b6a33f))

## 2.1.0 (2020-05-01)

### Features

- add new command - copy templates ([096fc10](https://github.com/Gorniv/vscode-flutter-files/commit/096fc1085381dce44c1a8a62ed7dc4ee37a3f479))
- support multi templates ([f1732de](https://github.com/Gorniv/vscode-flutter-files/commit/f1732defb9b3b5969e2dfee6673db39de8fce3c0))

### Bug Fixes

- change linter ([97cb622](https://github.com/Gorniv/vscode-flutter-files/commit/97cb6224cbfcd4aa180d278510046f787163ebb8))

## 1.9.0 (2020-03-09)

### Features

- use Stream for event ([8c17a78](https://github.com/Gorniv/vscode-flutter-files/commit/8c17a784a850f58ae72653eaeb7cf6ff8be20fa5))

## 1.8.0 (2020-03-06)

### Features

- update templates ([891ba4c](https://github.com/Gorniv/vscode-flutter-files/commit/891ba4c47cf9eec7e6b4dd5044e29a421ef31f70))

## 1.7.0 (2019-12-30)

### Features

- update templates

## 1.6.0 (2019-11-27)

### Features

- support flutter_bloc ^2.0.0

## 1.5.4

### Features

- support flutter_bloc 0.22.1

## 1.5.3

### Features

- add workspace support
- update templates

## 1.5.1

### Bug Fixes

- fix Stack Overflow

## 1.5.0

### Features

- support equatable v0.6.0

## 1.4.0

- fix: #10 and update bloc

## 1.3.4

- Update templates: fix StackTrace

## 1.3.3

- Update templates: add StackTrace

## 1.3.2

- File(s) could not be created. TypeError: Cannot read property 'name' of undefined #7

## 1.3.1

- Fix custom templates for pack

## 1.3.0

- Support custom templates

## 1.2.4

- Support windows path. Update templates

## 1.2.3

- Update templates, use @immutable, new version BLoC

### 1.2.2

- Update templates

### 1.2.1

- fix: vscode engines

### 1.2.0

- Update templates: model, repository, state

### 1.0.0

- Init

## Features

Right click on a file or a folder in your current project.
You can find multiple options been added to the context menu:

| Menu Options        |
| ------------------- |
| New Big Pack Bloc   |
| New Small Pack Bloc |

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
