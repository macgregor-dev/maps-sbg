/**
   * Maps Search Controller
   *
   * @constructor
   */
(function(){
  'use strict';
  angular.module('ecclesia.maps').controller('mapsSearchCtrl', [
    '$rootScope', '$scope', 'mapsService', 'currentAuth', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$routeParams', '$firebaseObject', '$location', '$mdDialog',
  function ($rootScope, $scope, mapsService, currentAuth, $mdSidenav, $mdBottomSheet, $log, $q, $routeParams, $firebaseObject, $location, $mdDialog) {
    var self = this;
    $scope.$rootScope = $rootScope;
    $rootScope.showSideNav = true;
    $scope.partialTitle = 'Search';
    $scope.mapSearchTerm = '';
    $scope.searchRes = [];
    $scope.searchRes = null;
    $scope.addSearchRes = null;
    $scope.searching = false;
    
    $scope.findMap = function() {
      $scope.searchRes = null;
      $scope.searching = true;
      var term = $scope.mapSearchTerm ? $scope.mapSearchTerm.toLocaleLowerCase().trim() : "";
      mapsService.findMapByLowerName(term, function(searchRes) {
        $scope.searchRes = searchRes;
        $scope.searching = false;
      });
    };
    
    $scope.findAddress = function() {
      $scope.addSearchRes = null;
      $scope.searching = true;
      var term = $scope.addSearchTerm ? $scope.addSearchTerm.toLocaleLowerCase().trim() : "";
      mapsService.findStreetLower(term, function(searchRes) {
        $scope.addSearchRes = searchRes;
        $scope.searching = false;
      });
    };
  }
]);
})();