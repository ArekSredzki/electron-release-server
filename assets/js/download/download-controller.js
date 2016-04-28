angular.module('app.releases', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/releases', {
        templateUrl: 'js/download/download.html',
        controller: 'DownloadController as vm'
      });
  }])
  .controller('DownloadController', [
    '$scope', 'PubSub', 'deviceDetector', 'DataService',
    function(
      $scope, PubSub, deviceDetector, DataService
    ) {
      var self = this;
      self.showAllVersions = false;

      self.platform = deviceDetector.os;
      if (self.platform === 'mac') {
        self.platform = 'osx';
        self.archs = ['64'];
      } else {
        self.archs = ['32', '64'];
      }

      self.availablePlatforms = DataService.availablePlatforms;
      self.filetypes = DataService.filetypes;
      self.availableChannels = DataService.availableChannels;
      self.channel = self.availableChannels[0]; // stable

      self.latestReleases = null;
      self.downloadUrl = null;

      self.getLatestReleases = function() {
        self.latestReleases = DataService.getLatestReleases(
          self.platform,
          self.archs,
          self.channel
        );
        self.versions = DataService.data;
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        // $scope.$apply(function() {
        self.getLatestReleases();
        // });
      });

      // Update knowledge of the latest available versions.
      self.getLatestReleases();

      self.download = function(asset, versionName) {
        if (!asset) {
          return;
        }

        self.downloadUrl = '/download/' + (asset.version || versionName) +
          '/' + asset.name;
      };

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
