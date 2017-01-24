angular.module('app.admin.add-version-asset-modal', [])
  .controller('AddVersionAssetModalController', ['DataService', '$uibModalInstance', 'versionName',
    function(DataService, $uibModalInstance, versionName) {
      var self = this;

      self.DataService = DataService;
      self.availablePlatforms = DataService.availablePlatforms;
      self.installerFiletypes = DataService.installerFiletypes;
      self.updateFiletypes = DataService.updateFiletypes;

      self.versionName = versionName;

      self.asset = {
        platform: '',
        file: null
      };

      self.addAsset = function() {
        DataService.createAsset(self.asset, self.versionName)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {
            $uibModalInstance.dismiss();
          });
      };

      self.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
