angular.module('app.admin.add-version-asset-modal', [])
  .controller('AddVersionAssetModalController', ['$scope', 'DataService', '$uibModalInstance', 'version',
    function($scope, DataService, $uibModalInstance, version) {
      $scope.DataService = DataService;

      $scope.versionName = version.name;

      $scope.asset = {
        platform: '',
        file: null
      };

      $scope.addAsset = function() {
        DataService.createAsset($scope.asset, version.id)
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
