angular.module('app.admin.edit-version-asset-modal', [])
  .controller('EditVersionAssetModalController', ['$scope', 'DataService', 'Notification', '$uibModalInstance', 'asset',
    function($scope, DataService, Notification, $uibModalInstance, asset) {
      $scope.DataService = DataService;

      // Clone so not to polute the original
      $scope.asset = _.cloneDeep(asset);

      $scope.acceptEdit = function() {
        DataService.updateAsset($scope.asset)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.deleteAsset = function() {
        DataService.deleteAsset(asset.name)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
