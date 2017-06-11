(function(){

  angular
       .module('mainApp.sample')
       .controller('SampleCtrl', [
          '$rootScope', '$scope', '$routeParams', 'sampleService', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$firebaseObject',
          SampleCtrl
       ]);

  /**
   * Sample Controller
   *
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function SampleCtrl( $rootScope, $scope, $routeParams, sampleService, $mdSidenav, $mdBottomSheet, $log, $q, $firebaseObject) {
    var self = this;
  }
})();
