angular.module('app.admin.add-version-asset-modal', [])
  .controller('AddVersionAssetModalController', ['$scope', 'DataService', '$uibModalInstance', 'versionName',
    function($scope, DataService, $uibModalInstance, versionName) {
      $scope.DataService = DataService;

      $scope.versionName = versionName;

      $scope.asset = {
        platform: '',
        file: null
      };

      $scope.addAsset = function() {
        DataService.createAsset($scope.asset, versionName)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {
            $uibModalInstance.dismiss();
          });
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
