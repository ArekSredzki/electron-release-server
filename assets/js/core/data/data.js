angular.module('app.core.data', [
    'app.core.data.service'
  ])
  .run(['DataService',
    function(DataService) {
      DataService.initialize();
    }
  ]);
