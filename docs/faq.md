# Electron Release Server FAQ

### What files should I upload?

Electron Release Server uses explicit file compatibility naming in order to avoid unexpected issues, there is no strict policy on file naming.

- Windows: `.exe`, `.nupkg` etc
- Linux: `.deb`, `.tar.gz`, etc
- OS X: `.dmg`, etc

32 bit releases are made available to all clients, but 64 bit files are served to compatible clients if available.

### How should I name my releases?

Electron Release Server requires applications to follow [SemVer](http://semver.org). And even if you're not using Electron Release Server, you should follow it!

### I'm seeing HTTP errors when the Electron autoUpdater queries for the `RELEASES` file. How should I fix it?

Ensure that you are not including `/RELEASES` in the feed URL that is passed to `setFeedURL()`.

### Why do I see `password authentication failed`?

When you run your server (usually on Windows machine) you may see following error message:
~~~
 error: password authentication failed for user "electron_release_server_user"
~~~

Solution could be to update server configuration file:
~~~
C:\Program Files\PostgreSQL\12\data\pg_hba.conf
~~~

to make all METHODs trusted
~~~
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
~~~
_Note: do not forget to open services.msc and restart the server_


### Error: Server failed to start, port 80 in use
IF you see following error message one of the causes as listed in error message might be an already used port
~~~
error: Server failed to start.
error: (received error: EACCES)
error:
error: Troubleshooting tips:
error:
error:  -> Do you have a slow Grunt task, or lots of assets?
error:
error:  -> Do you have permission to use port 80 on this system?
error:
error:  -> Is something else already running on port 80 ?
error:
error:  -> Are you deploying on a platform that requires an explicit hostname, like OpenShift?
error:     (Try setting the `explicitHost` config to the hostname where the server will be accessible.)
error:     (e.g. `mydomain.com` or `183.24.244.42`)
~~~

You can specify an environment variable PORT for the session (or permanent one)

Windows PowerShell:
~~~
$env:PORT=1337
~~~

CMD:
~~~
set PORT=1337
~~~

Linux Bash:
~~~
export PORT=1337
~~~

See documentation for your console for appropriate syntax
