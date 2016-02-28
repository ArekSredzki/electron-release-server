# Auto-updater on OS X

Electron Release Server provides a backend for the [Squirrel.Mac](https://github.com/Squirrel/Squirrel.Mac) auto-updater. Squirrel.Mac is integrated by default in [Electron applications](https://github.com/atom/electron).

### Endpoint

The endpoint for **Squirrel.Mac** is `http://download.myapp.com/update/osx/:currentVersion`.

This url requires different parameters to return a correct version: `version` and `platform`.

### Electron Example

For example with Electron's `auto-updater` module:

```js
var app = require('app');
var os = require('os');
var autoUpdater = require('auto-updater');

var platform = os.platform() + '_' + os.arch();
var version = app.getVersion();

autoUpdater.setFeedUrl('http://download.myapp.com/update/'+platform+'/'+version);
```
