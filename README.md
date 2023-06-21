# VS Code Flutter Files

[![Awesome Flutter](https://img.shields.io/badge/Awesome-Flutter-blue.svg?longCache=true&style=flat-square)](https://github.com/Solido/awesome-flutter#vscode)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/gornivv.vscode-flutter-files)](https://marketplace.visualstudio.com/items?itemName=gornivv.vscode-flutter-files)

This extension allows **quickly scaffold flutter BLoC templates** in VS Code project.

This extension use:
- <https://github.com/felangel/bloc> for BLoC (base)
- <https://pub.dev/packages/ff_bloc> for (my way from real code)

How it works(Russian lang) - https://vas3k.club/post/10567/

## Support me:
- Add me on [linkedin](https://www.linkedin.com/in/gorniv/)
- install app for developers: [aso.dev](https://aso.dev?utm_source=ext&utm_medium=f_f)
- install my music player for Apple Music: [meows.app](https://meows.app?utm_source=ext&utm_medium=f_f)

![demo](https://github.com/Gorniv/vscode-flutter-files/raw/master/assets/flutter.gif)

## Custom(dynamic) templates

Copy [templates](./templates) directory to your project (by command "[FF] Copy templates to project") and change any of content files (bloc,event,model,page,provider,repository,scree,state)

## Changelog


## [4.7.0](https://github.com/Gorniv/vscode-flutter-files/compare/v4.6.0...v4.7.0) (2023-06-21)


### Features

* upgrade templates, readme ([7e2c899](https://github.com/Gorniv/vscode-flutter-files/commit/7e2c89959c983a727228111453ef667cb2ad54be))

## [4.6.0](https://github.com/Gorniv/vscode-flutter-files/compare/v4.5.0...v4.6.0) (2022-11-24)


### Features

* use ff_bloc ([1f5eed0](https://github.com/Gorniv/vscode-flutter-files/commit/1f5eed09c782bfa6d50f81abef86adf360243d1d))

## [4.5.0](https://github.com/Gorniv/vscode-flutter-files/compare/v4.4.2...v4.5.0) (2022-11-23)


### Features

* improve error template ([bd51e6a](https://github.com/Gorniv/vscode-flutter-files/commit/bd51e6a7fa30d5588f9c29079872cb2dc7af8369))

### [4.4.2](https://github.com/Gorniv/vscode-flutter-files/compare/v4.4.1...v4.4.2) (2022-10-20)


### Bug Fixes

* 4.4.1 can not gen new big pack in vscode [#40](https://github.com/Gorniv/vscode-flutter-files/issues/40) ([3947f8b](https://github.com/Gorniv/vscode-flutter-files/commit/3947f8b3db7d2ca35f045505dd23b85f9725aae9))

### [4.4.1](https://github.com/Gorniv/vscode-flutter-files/compare/v4.4.0...v4.4.1) (2022-10-18)

## [4.4.0](https://github.com/Gorniv/vscode-flutter-files/compare/v4.3.1...v4.4.0) (2022-10-01)


### Features

* support multi folder in templates.(base) ([484c58d](https://github.com/Gorniv/vscode-flutter-files/commit/484c58d6202731cb8ce2847471168d6d46954d94))

### [4.3.1](https://github.com/Gorniv/vscode-flutter-files/compare/v4.3.0...v4.3.1) (2022-07-01)

## [4.3.0](https://github.com/Gorniv/vscode-flutter-files/compare/v3.1.2...v4.3.0) (2022-07-01)


### Features

* new template for v.8 type ([7715833](https://github.com/Gorniv/vscode-flutter-files/commit/77158332b85a17780b67936278fa815b55c94cf7))
* support null safety ([162582d](https://github.com/Gorniv/vscode-flutter-files/commit/162582d9d5ed4910339cef1c8833dc49e215b903))

### [4.2.1](https://github.com/Gorniv/vscode-flutter-files/compare/v4.2.0...v4.2.1) (2021-11-16)

## [4.2.0](https://github.com/Gorniv/vscode-flutter-files/compare/v4.1.1...v4.2.0) (2021-11-16)


### Features

* new template for v.8 type ([7715833](https://github.com/Gorniv/vscode-flutter-files/commit/77158332b85a17780b67936278fa815b55c94cf7))

### [4.1.1](https://github.com/Gorniv/vscode-flutter-files/compare/v4.1.0...v4.1.1) (2021-07-07)

## [4.1.0](https://github.com/Gorniv/vscode-flutter-files/compare/v3.1.2...v4.1.0) (2021-07-07)


### Features

* support null safety ([162582d](https://github.com/Gorniv/vscode-flutter-files/commit/162582d9d5ed4910339cef1c8833dc49e215b903))

### [3.1.2](https://github.com/Gorniv/vscode-flutter-files/compare/v3.1.1...v3.1.2) (2021-02-04)


### Bug Fixes

* ff.config.json ([7a05444](https://github.com/Gorniv/vscode-flutter-files/commit/7a05444de7f86406c488a8b9b6e94e218616be2e))

### [3.1.1](https://github.com/Gorniv/vscode-flutter-files/compare/v3.1.0...v3.1.1) (2021-02-03)

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
