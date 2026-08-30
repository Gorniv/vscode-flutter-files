# VS Code Flutter Files

[![Awesome Flutter](https://img.shields.io/badge/Awesome-Flutter-blue.svg?longCache=true&style=flat-square)](https://github.com/Solido/awesome-flutter#vscode)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/gornivv.vscode-flutter-files)](https://marketplace.visualstudio.com/items?itemName=gornivv.vscode-flutter-files)

This extension lets you **quickly scaffold Flutter BLoC templates** in a VS Code project.

This extension uses:

- <https://github.com/felangel/bloc> for BLoC (base)
- <https://pub.dev/packages/ff_bloc> for (my way from real code)

How it works (Russian) - <https://vas3k.club/post/10567/>

Requires VS Code 1.85 or newer.

## Please support me

- Add me on [linkedin](https://www.linkedin.com/in/gorniv/)
- Install my tool for iOS developers: [aso.dev](https://aso.dev?utm_source=ext&utm_medium=f_f)
- Install my music player for Apple Music: [meows.app](https://meows.app?utm_source=ext&utm_medium=f_f)

![demo](https://github.com/Gorniv/vscode-flutter-files/raw/master/assets/flutter.gif)

## Custom(dynamic) templates

Run `[FF] Copy templates to project`, then edit the copied files in your project's `templates` directory (`bloc`, `event`, `model`, `page`, `provider`, `repository`, `screen`, and `state`).

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

## Development

Use Node.js 22 and install dependencies with `npm ci`.

- `npm test` checks formatting, renders every bundled template, runs unit tests with coverage thresholds, type-checks the extension, and creates a production bundle.
- `npm run vsce:package` creates an installable VSIX package.

Fork https://github.com/ivalexa/vscode-angular2-files

## License

MIT
