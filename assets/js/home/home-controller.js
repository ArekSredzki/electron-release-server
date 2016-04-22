angular.module('app.home', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'js/home/home.html',
        controller: 'HomeController as vm'
      });
  }])
  .controller('HomeController', ['$scope', 'PubSub', 'DataService',
    function($scope, PubSub, DataService) {
    }
  ]);
