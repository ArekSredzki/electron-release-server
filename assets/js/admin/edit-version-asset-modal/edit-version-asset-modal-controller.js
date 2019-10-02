angular.module('app.admin.edit-version-asset-modal', [])
  .controller('EditVersionAssetModalController', ['$scope', 'DataService', 'Notification', '$uibModalInstance', 'asset',
    function($scope, DataService, Notification, $uibModalInstance, asset) {
      $scope.DataService = DataService;

      $scope.originalName = asset.name;
      $scope.fileType = asset.filetype && asset.filetype[0] === '.'
        ? asset.filetype.replace('.', '')
        : asset.filetype;

      // Clone so not to polute the original
      $scope.asset = _.cloneDeep(asset);

      $scope.acceptEdit = function() {
        if (!$scope.asset.name) {
          $scope.asset.name = $scope.originalName;
        }

        DataService.updateAsset($scope.asset)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.deleteAsset = function() {
        DataService.deleteAsset(asset.id)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
