# Electron Release Server
[![GitHub stars](https://img.shields.io/github/stars/ArekSredzki/electron-release-server.svg)](https://github.com/ArekSredzki/electron-release-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ArekSredzki/electron-release-server.svg)](https://github.com/ArekSredzki/electron-release-server/network)
[![Join the chat at https://gitter.im/ArekSredzki/electron-release-server](https://badges.gitter.im/ArekSredzki/electron-release-server.svg)](https://gitter.im/ArekSredzki/electron-release-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
>A node web server which serves & manages releases of your [Electron](http://electron.atom.io) App, and is fully compatible with [Squirrel](https://github.com/Squirrel) Auto-updater (which is built into Electron).

[![Electron Release Server Demo](https://j.gifs.com/wpyY1X.gif)](https://youtu.be/lvT7rfB01iA)

_Note: Despite being advertised as a release server for Electron applications, it would work for **any application using Squirrel**._

If you host your project on your Github **and** do not need a UI for your app, then [Nuts](https://github.com/GitbookIO/nuts) is probably what you're looking for. Otherwise, you're in the same boat as I was, and you've found the right place!

## Advisory Notice
**IMPORTANT:** The release of Angular `1.6.0` has broken all `electron-release-server` versions prior to `1.4.2`. Please use the instructions under the `Maintenance` heading below to update your fork! Sorry for the inconvenience.

## Features
- :sparkles: Docker :whale: support (thanks to EvgeneOskin)!
- :sparkles: Awesome release management interface powered by [AngularJS](https://angularjs.org)
    - Authenticates with LDAP, easy to modify to another authentication method if needed
- :sparkles: Store assets on server disk, or Amazon S3 (with minor modifications)
    - Use pretty much any database for persistence, thanks to [Sails](http://sailsjs.org) & [Waterline](http://waterlinejs.org)
- :sparkles: Simple but powerful download urls (**NOTE:** when no assets are uploaded, server returns `404` by default):
    - `/download/latest`
    - `/download/latest/:platform`
    - `/download/:version`
    - `/download/:version/:platform`
    - `/download/:version/:platform/:filename`
    - `/download/channel/:channel`
    - `/download/channel/:channel/:platform`
- :sparkles: Support pre-release channels (`beta`, `alpha`, ...)
- :sparkles: Auto-updates with [Squirrel](https://github.com/Squirrel):
    - Update URLs provided: `/update/:platform/:version[/:channel]`
    - Mac uses `*.dmg` and `*.zip`
    - Windows uses `*.exe` and `*.nupkg`
- :sparkles: Serve the perfect type of assets: `.zip` for Squirrel.Mac, `.nupkg` for Squirrel.Windows, `.dmg` for Mac users, ...
- :sparkles: Release notes endpoint
    - `/notes/:version`

**NOTE:** if you don't provide the appropriate type of file for Squirrel you won't be able to update your app since the update endpoint will not return a JSON. (`.zip` for Squirrel.Mac, `.nupkg` for Squirrel.Windows).

## Deploy it / Start it

[Follow our guide to deploy Electron Release Server](docs/deploy.md).

## Auto-updater / Squirrel

This server provides an endpoint for [Squirrel auto-updater](https://github.com/atom/electron/blob/master/docs/api/auto-updater.md), it supports both [OS X](docs/update-osx.md) and [Windows](docs/update-windows.md).

## Documentation
[Check out the documentation](docs/) for more details.

## Building Releases
I highly recommend using [electron-builder](https://github.com/loopline-systems/electron-builder) for packaging & releasing your applications. Once you have built your app with that, you can upload the artifacts for your users right away!

## Maintenance
You should keep your fork up to date with the electron-release-server master.

Doing so is simple, rebase your repo using the commands below.
```bash
git remote add upstream https://github.com/ArekSredzki/electron-release-server.git
git fetch upstream
git rebase upstream/master
```

## Credit
This project has been built from the Sails.js up by Arek Sredzki, with inspiration from [nuts](https://github.com/GitbookIO/nuts).

## License
[MIT License](LICENSE.md)
