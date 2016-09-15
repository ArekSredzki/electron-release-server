# Available URLs
## Download endpoints
Electron Release Server provides a variety of urls to access release assets.

#### Latest version for detected platform:
`http://download.myapp.com/download/latest`
#### Latest version for specific platform:
`http://download.myapp.com/download/latest/osx`
#### Specific version for detected platform:
`http://download.myapp.com/download/1.1.0`
#### Specific version for a specific platform:
`http://download.myapp.com/download/1.2.0/osx`
#### Specific file for a version for a specific platform:
> Note that only the file extension is used.

`http://download.myapp.com/download/1.2.0/windows_64/MyApp-0.1.1-full.nupkg`
#### Specific channel:
`http://download.myapp.com/download/channel/beta`
#### Specific channel for specific platform:
`http://download.myapp.com/download/channel/beta/osx`

### Windows
`http://download.myapp.com/download/windows_32`

`http://download.myapp.com/download/windows_64`

### Linux
`http://download.myapp.com/download/linux_32`

`http://download.myapp.com/download/linux_64`

## Update endpoints
These are detailed separately for [OSX](update-osx.md) and [Windows](update-windows.md).

When an update is not available, the update endpoints will return a 204 response. This happens when the version you are requesting is newer than or equal to the last available version on the server, but also when the appropriate file type is not present for Squirrel to be able to update your application (`.zip` for Squirrel.Mac, `.nupkg` for Squirrel.Windows).

## Notes endpoint
`http://download.myapp.com/notes/:version`

## Data endpoints
These are detailed separately [here](api.md).

## About using HTTPS
If you are using HTTPS on your server be sure to configure the base URL (`appUrl`) in `config/local.js` to use it as well since by default the download URLs will come from HTTP even if the update URL has been called from HTTPS.
