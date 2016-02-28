angular.module('app.release', [
    'angularMoment',
    'ngRoute'
  ])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/release', {
        templateUrl: 'js/release/release.html',
        controller: 'ReleaseController'
      });
  }])
  .controller('ReleaseController', ['$scope', '$log', 'DataService',
    function($scope, $log, DataService) {
      $scope.DataService = DataService;
    }
  ]);
