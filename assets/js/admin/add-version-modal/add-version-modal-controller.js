angular.module('app.admin.add-version-modal', [])
  .controller('AddVersionModalController', ['$scope', '$http', 'DataService', 'Notification', '$uibModalInstance', 'PubSub', 'moment',
    ($scope, $http, DataService, Notification, $uibModalInstance, PubSub, moment) => {
      $scope.availableChannels = DataService.availableChannels;
      $scope.currentDateTime = moment().startOf('second').toDate();

      $scope.version = {
        name: '',
        notes: '',
        channel: {
          name: DataService.availableChannels[0]
        },
        availability: $scope.currentDateTime
      };

      $scope.addVersion = function() {
        DataService.createVersion($scope.version)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        $scope.availableChannels = DataService.availableChannels;

        $scope.version = {
          name: '',
          notes: '',
          channel: {
            name: DataService.availableChannels[0]
          },
          availability: $scope.currentDateTime
        };
      });

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
