angular.module('app.admin.add-version-asset-modal', [])
  .controller('AddVersionAssetModalController', ['$scope', 'DataService', '$uibModalInstance', 'versionName',
    function($scope, DataService, $uibModalInstance, versionName) {
      $scope.DataService = DataService;

      $scope.versionName = versionName;

      $scope.asset = {
        name: '',
        platform: '',
        file: null
      };

      $scope.addAsset = function() {
        if (!$scope.asset.name) {
          delete $scope.asset.name;
        }

        DataService.createAsset($scope.asset, versionName)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {
            $uibModalInstance.dismiss();
          });
      };

      $scope.updateAssetName = () => {
        $scope.namePlaceholder = $scope.asset.file && $scope.asset.file.name;
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
