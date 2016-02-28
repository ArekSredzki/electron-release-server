# Electron Release Server FAQ

### What files should I upload?

Electron Release Server uses explicit file compatibility naming in order to avoid unexpected issues, there is no strict policy on file naming.

- Windows: `.exe`, `.nupkg` etc
- Linux: `.deb`, `.tar.gz`, etc
- OS X: `.dmg`, etc

32 bit releases are made available to all clients, but 64 bit files are served to compatible clients if available.

### How should I name my releases?

Electron Release Server requires applications to follow [SemVer](http://semver.org). And even if you're not using Electron Release Server, you should follow it!
