# Adding Assets
Adding assets/versions couldn't be easier.

Check the video below for a brief video of how to add a version and assets.

[![Electron Release Server Demo](https://j.gifs.com/wpyY1X.gif)](https://youtu.be/lvT7rfB01iA)

Once added, assets and versions will be instantly available on their channels. This is great for quickly distributing new versions to your users when paired with Electron's built-in auto-updater.

## Files to upload
The release server will process and serve files for a given version based on two heuristics.

#### Platform
This is explicitly defined when uploading the asset.

#### File extension
This will tell the service whether the file is meant for updates or initial installation.

### OS X
#### Initial installation
Accepted file extensions:
- `.dmg`

#### Serving updates
Accepted file extensions:
- `.zip`

### Windows
#### Initial installation
Accepted file extensions:
- `.exe`

#### Serving updates
Accepted file extensions:
- `.nupkg`

**Important**: only `-full.nupkg` files are currently supported. If you're confused, just upload the one that [electron-builder](https://github.com/electron-userland/electron-builder) made for you.

> Note that you do not have to upload the `RELEASES` file because one will be generated upon request.

### Linux
#### Initial installation
Accepted file extensions:
- `.deb`

#### Serving updates
The Electron auto-updater does not support Linux and neither does this.
