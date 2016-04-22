angular.module('app', [
    'app.core',
    'app.admin',
    'app.home',
    'app.releases'
  ])
  .config(['$routeProvider', '$locationProvider', 'NotificationProvider',
    function($routeProvider, $locationProvider, NotificationProvider) {
      $routeProvider.otherwise({
        redirectTo: '/home'
      });

      // Use the HTML5 History API
      $locationProvider.html5Mode(true);

      NotificationProvider.setOptions({
        positionX: 'left',
        positionY: 'bottom'
      });
    }
  ])
  .run(['editableOptions', 'editableThemes',
    function(editableOptions, editableThemes) {
      editableThemes.bs3.inputClass = 'input-sm';
      editableThemes.bs3.buttonsClass = 'btn-sm';
      editableThemes.bs3.controlsTpl = '<div class="editable-controls"></div>';
      editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    }
  ])
  .controller('MainController', ['$scope', 'AuthService',
    function($scope, AuthService) {
      $scope.isAuthenticated = AuthService.isAuthenticated;
    }
  ]);
