angular.module('app.admin.edit-version-modal', [])
  .controller('EditVersionModalController', ['$scope', 'DataService', 'Notification', '$uibModalInstance', '$uibModal', 'version', 'moment',
    ($scope, DataService, Notification, $uibModalInstance, $uibModal, version, moment) => {
      $scope.DataService = DataService;

      // Clone so not to polute the original
      $scope.version = _.cloneDeep(version);

      $scope.version.availability = new Date(version.availability);
      $scope.createdAt = new Date(version.createdAt);
      $scope.isAvailable = DataService.checkAvailability(version);

      /**
       * Updates the modal's knowlege of this version's assets from the one
       * maintained by DataService (which should be up to date with the server
       * because of SocketIO's awesomeness.
       */
      var updateVersionAssets = function() {
        var updatedVersion = _.find(DataService.data, {
          name: version.name
        });

        if (!updatedVersion) {
          // The version no longer exists
          return $uibModalInstance.close();
        }

        $scope.version.assets = updatedVersion.assets;
      };

      $scope.openAddAssetModal = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'js/admin/add-version-asset-modal/add-version-asset-modal.html',
          controller: 'AddVersionAssetModalController',
          resolve: {
            version: () => version
          }
        });

        modalInstance.result.then(function() {
          // An asset should have been added, so we will update our modal's
          // knowledge of the version.
          updateVersionAssets();
        }, function() {});
      };

      $scope.openEditAssetModal = function(asset) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'js/admin/edit-version-asset-modal/edit-version-asset-modal.html',
          controller: 'EditVersionAssetModalController',
          resolve: {
            asset: function() {
              return asset;
            }
          }
        });

        modalInstance.result.then(function() {
          // An asset should have been modified or deleted, so we will update
          // our modal's knowledge of the version.
          updateVersionAssets();
        }, function() {});
      };

      $scope.acceptEdit = function() {
        DataService.updateVersion($scope.version, version.name)
          .then(function success(response) {
            $uibModalInstance.close();
          }, () => {
            if (!$scope.version.availability) {
              $scope.version.availability = new Date(version.availability);
            }
          });
      };

      $scope.makeAvailable = () => {
        const updatedVersion = {
          ...$scope.version,
          availability: moment().startOf('second').toDate()
        };

        DataService
          .updateVersion(updatedVersion, version.name)
          .then($uibModalInstance.close, () => {});
      };

      $scope.deleteVersion = function() {
        DataService.deleteVersion(version.name)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
