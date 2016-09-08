# Auto-updater on OS X
Electron Release Server provides a backend for the [Squirrel.Mac](https://github.com/Squirrel/Squirrel.Mac) auto-updater. Squirrel.Mac is integrated by default in [Electron applications](https://github.com/atom/electron).

### Endpoint

The endpoint for **Squirrel.Mac** is `http://download.myapp.com/update/osx/:currentVersion`. The server is smart enough to also match the platform to `darwin`,`darwin_64`,`macos`, and `mac`.

This url requires different parameters to return a correct version: `version` and `platform`.

### Electron Example

For example with Electron's [`autoUpdater`](https://github.com/electron/electron/blob/master/docs/api/auto-updater.md) module:

```js
var app = require('app');
var os = require('os');
var autoUpdater = require('electron').autoUpdater;

var platform = os.platform() + '_' + os.arch();  // usually returns darwin_64
var version = app.getVersion();

autoUpdater.setFeedURL('http://download.myapp.com/update/'+platform+'/'+version);
```
