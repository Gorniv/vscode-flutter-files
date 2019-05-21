# VS Code Flutter Files

[![Awesome Flutter](https://img.shields.io/badge/Awesome-Flutter-blue.svg?longCache=true&style=flat-square)](https://github.com/Solido/awesome-flutter#vscode)
[![Install](https://vsmarketplacebadge.apphb.com/installs-short/gornivv.vscode-flutter-files.svg)](https://marketplace.visualstudio.com/items?itemName=gornivv.vscode-flutter-files)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FGorniv%2Fvscode-flutter-files.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FGorniv%2Fvscode-flutter-files?ref=badge_shield)

This extension allows **quickly scaffold flutter BLoC templates** in VS Code project.

This extension use https://github.com/felangel/bloc for BLoC

![](https://github.com/Gorniv/vscode-flutter-files/raw/master/assets/flutter.gif)

## Custom(dynamic) templates

![](https://github.com/Gorniv/vscode-flutter-files/raw/master/assets/dynamic.gif)

Copy [templates](./templates) directory to your project(root path) and change any of content files (bloc,event,model,page,provider,repository,scree,state)

## Changelog

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

# Disclaimer

**Important:** This extension due to the nature of it's purpose will create
files on your hard drive and if necessary create the respective folder structure.
While it should not override any files during this process, I'm not giving any guarantees
or take any responsibility in case of lost data.

Fork https://github.com/ivalexa/vscode-angular2-files

# License

MIT


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FGorniv%2Fvscode-flutter-files.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FGorniv%2Fvscode-flutter-files?ref=badge_large)