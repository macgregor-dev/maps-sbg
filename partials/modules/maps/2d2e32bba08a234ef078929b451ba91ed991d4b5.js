/**
   * Maps  Admin Controller
   *
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
(function(){
  'use strict';
  angular.module('ecclesia.maps').controller('mapsAdminCtrl', [
    '$rootScope', '$scope', 'mapsService', 'currentAuth', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$routeParams', '$firebaseObject', '$location', '$mdDialog',
  function ($rootScope, $scope, mapsService, currentAuth, $mdSidenav, $mdBottomSheet, $log, $q, $routeParams, $firebaseObject, $location, $mdDialog) {
    var self = this;
    $scope.$rootScope = $rootScope;
    $rootScope.showSideNav = true;
    $scope.partialTitle = '';
    
    
  }
]);
})();