/**
   * Maps Controller
   *
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
(function(){
  'use strict';
  angular.module('ecclesia.maps').controller('mapsCtrl', [
    '$rootScope', '$scope', 'mapsService', 'currentAuth', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$routeParams', '$firebaseObject', '$location', '$mdDialog', 'authService', '$filter', '$timeout',
  function ($rootScope, $scope, mapsService, currentAuth, $mdSidenav, $mdBottomSheet, $log, $q, $routeParams, $firebaseObject, $location, $mdDialog, authService, $filter, $timeout) {
    var self = this;
    $scope.$rootScope = $rootScope;
    $scope.headerTitle = '';
    $scope.partialTitle = '';
    $scope.statusSaveOk = true;
    $scope.isMapStarted = false;
    $scope.isPrintMode = $location.path().indexOf('print') >= 0;
    $scope.mapId = $routeParams.mapId;
    $rootScope.showSideNav = !$scope.isPrintMode;
    $scope.menuIsOpen = false;
    authService.currentAuth = currentAuth;
    authService.loadUser().$loaded().then(function() {
      var fullName = authService.getUserInfoMin().name;
      $scope.userCanExport = (fullName == "Shilo Banihit" || fullName == "Callum Frazier" || fullName == "Macgregor Dev");
    });

    if ($scope.isPrintMode) {
      $scope.headerTitle = 'Loading map data...';
    }

    $scope.statuses = mapsService.statuses;

    $scope.saveStatus = function() {
      $scope.statusSaveOk = false;
      mapsService.saveStatus($scope.mapObj.assgn, function(ref) {
        $scope.statusSaveOk = true;
      });
    };

    $scope.startMap = function() {
      $scope.statusSaveOk = false;
      mapsService.startMapAssgn($scope.mapObj.assgn, function(ref) {
        if (ref) {
          $scope.statusSaveOk = true;
          $scope.isMapStarted = true;
        } else {
          // error
          $scope.statusSaveOk = true;
        }
      });
    };

    $scope.loadPartial = function() {
      if (!$scope.userData) {
        $scope.userData = mapsService.userData = authService.loadUser();
      }
      if ($routeParams.mapId) {
        // getting map details
        $scope.userData.$loaded().then(function() {
          mapsService.loadAssignedMap($routeParams.mapId, function(mapObj) {
            mapsService.getFsgList(function(fsgListRef) {
              $scope.fsgListRef = fsgListRef;
              $scope.mapObj = mapObj;
              $scope.isMapStarted = $scope.mapObj.assgn.started != undefined;
              $scope.orderAddresses();
              if ($scope.isPrintMode) {
                $scope.headerTitle =  $scope.mapObj.mapData.terId + " - " + $scope.mapObj.mapData.name;
                $scope.printList = [];
                var printData = null;
                var itemCount = 33;
                for (var m=0; m < $scope.mapObj.addresses.length; m++) {
                  if (printData == null) {
                    printData = {addresses: []};
                    $scope.printList.push(printData);
                  }
                  printData.addresses.push($scope.mapObj.addresses[m]);
                  if (printData.addresses.length == itemCount) {
                    printData = null;
                    itemCount = 33;
                  }
                }
              } else {
                $scope.partialTitle = $scope.mapObj.mapData.terId + " - " + $scope.mapObj.mapData.name;
              }
            });
          });
        }).catch(function(error) {
          $location.path('/auth/logout');
          return;
        });
      } else {
        // loading map list, started maps and all fsgs
        $scope.userData.$loaded().then(function() {
          console.log("Loading map data...");
          mapsService.loadMyMaps(function(mapList) {
            console.log("Loading started map data...");
            mapsService.getStartedMaps(function(startedList) {
              console.log("Loading fsg list data...");
              console.log(startedList);
              mapsService.getFsgList(function(fsgList) {
                $scope.fsgListRef = fsgList;
                $scope.fsgList = [];
                var fsgCtr = 0;
                var orderBy = $filter('orderBy');
                for (var x=0; x<fsgList.length; x++) {
                  mapsService.getFsgMapList(fsgList[x].$value, function(fsgName, fsgMapList) {
                    $scope.fsgList.push({name:fsgName, list:orderBy(fsgMapList,['data.terId'], false)});
                    fsgCtr++;
                    if (fsgCtr == fsgList.length) {
                      $scope.startedMaps = startedList;
                      $scope.allMapsList = orderBy(mapList, ['data.terId'], false);
                      $scope.mapListReady = true;
                    }
                  });
                }
              });
            });
          });
        }).catch(function(error){
          $location.path('/auth/logout');
          return;
        });
      }
    };

    $scope.saveNewAdd = function(newAddFrm) {
      if (newAddFrm.$invalid) {
        return;
      }
      mapsService.saveNewAdd($scope.mapId, $scope.newAddress, function(stat) {
        console.log(stat);
        $mdDialog.hide();
        if (stat) {
          // success, reload the assigned maps...
          $scope.loadPartial();
        }
      });

    };

    $scope.cancelNewAdd = function() {
      $scope.newAddress = null;
      $mdDialog.hide();
    };

    $scope.addNewAddress = function(ev) {
      $scope.newAddress = {};
      $scope.showAddrDialog(ev, "New Address", $scope.newAddress, $scope.saveNewAdd, $scope.cancelNewAdd);
    };

    $scope.editAddress = function(ev, addr) {
      $scope.showAddrDialog(ev, "Edit Address", addr.addData, $scope.saveEditAddr,  $scope.cancelNewAdd, addr);
    };

    $scope.deleteAddress = function(ev, addr) {
      var confirm = $mdDialog.confirm()
      .title('Would you like to delete this address?')
      .textContent("WARNING: This address will be permanently removed from the database. If you want to revisit this address (e.g. Do not call, Phone Witnessing, etc.), please mark it as as such.")
      .ariaLabel('Delete address')
      .targetEvent(ev)
      .ok("I'm sure, please do it!")
      .cancel("Nope, that was scary!");
      $mdDialog.show(confirm).then(function() {
        mapsService.deleteAdd($scope.mapObj, addr, function() {
          $scope.loadPartial();
        }, true);
      }, function() {
      });
    };

    $scope.deleteMap = function(ev) {
      // check if there's an address
      if ($scope.mapObj.addresses.length > 0 || $scope.isMapStarted) {
        var text = 'This map still has address(es), please move or delete address(es) before deleting map.';
        if ($scope.isMapStarted) {
          text = 'This map is started, please complete this map and delete addresses before deleting this map.'
        }
        var alert = $mdDialog.alert({
          title: 'Delete Not Allowed',
          textContent: text,
          ok: 'Okay, I understand that there are no shortcuts to destructive actions like "Delete".'
        });
         $mdDialog.show( alert ).finally(function() {
           alert = undefined;
         });
      } else {
        var confirm = $mdDialog.confirm()
         .title('Would you like to delete this Map?')
        .textContent("WARNING: This map will be permanently removed from the database. THERE WILL BE NO UNDO.")
        .ariaLabel('Delete map')
        .targetEvent(ev)
        .ok("I'm sure, please do it!")
        .cancel("Nope, that was scary!");
        $mdDialog.show(confirm).then(function() {
          mapsService.deleteMap($scope.mapObj, function() {
            // redirect to home
            $scope.goHome();
          });
        }, function() {
        });
      }

    };

    $scope.saveEditAddr = function(addr, addrRef) {
      console.log(addr);
      console.log(addrRef);
      mapsService.saveEditAdd(addrRef.addData, function() {
        $mdDialog.hide();
      });
    };

    $scope.orderAddresses = function() {
      //var orderBy = $filter('orderBy');
      //$scope.mapObj.addresses = orderBy($scope.mapObj.addresses, ['mapAddRef.$priority'], false);
      // returned to the old ordering, as manual ordering is proving too much to handle for the map brothers
      // sort by suburb, street, unit, house in that order
      var orderBy = $filter('orderBy');
      $scope.mapObj.addresses = orderBy($scope.mapObj.addresses, ['addData.burb', 'addData.st', 'addData.hnum', 'addData.unit_temp'], false);
    };

    $scope.bumpAdd = function(goUp, add) {
      mapsService.mapAddBump(goUp, add, $scope.mapObj);
      $scope.orderAddresses();
    };

    $scope.showAddrDialog = function(ev, title, addr, saveHdlr, cancelHdlr, addrRef) {
      $mdDialog.show({
        templateUrl: 'partials/modules/maps/view/diag/addr.tpl',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          parentScope:$scope,
          title: title,
          saveTxt: 'Save New Address',
          addr: addr,
          addrRef: addrRef,
          saveHdlr: saveHdlr,
          cancelHdlr: cancelHdlr
        },
        controller: function($scope, $mdDialog, parentScope, title, saveTxt, addr, addrRef, saveHdlr, cancelHdlr) {
          $scope.title = title;
          $scope.parentScope = parentScope;
          $scope.newAddress = addr;
          $scope.saveHdlr = saveHdlr;
          $scope.saveTxt = saveTxt;
          $scope.addrRef = addrRef;
          $scope.saveNewAdd = function() {
            saveHdlr($scope.newAddFrm, $scope.addrRef);
          };
          $scope.cancelNewAdd = cancelHdlr;
          parentScope.newAddFrm = $scope.newAddFrm;
          if (addr.unit == -9) {
            addr.unit = '';
          }
        }
      });
    };

    $scope.setExpiry = function(ev) {
      $scope.expiryDate = moment($scope.mapObj.assgn.expiry).toDate();
      console.log($scope.expiryDate);
      $mdDialog.show({
        templateUrl: 'partials/modules/maps/view/diag/setExpiry.tpl',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          parentScope:$scope
        },
        controller: function($scope, $mdDialog, parentScope) {
          $scope.parentScope = parentScope;
          $scope.expiryDate = parentScope.expiryDate;
          $scope.saveExpiry = function() {
            parentScope.saveExpiry($scope.setExpiryForm);
          };
          $scope.cancelSetExpiry = parentScope.cancelSetExpiry;
          parentScope.setExpiryForm = $scope.setExpiryForm;
        }
      });
    };

    $scope.cancelSetExpiry = function() {
      $scope.expiryDate = null;
      $mdDialog.hide();
    };

    $scope.saveExpiry = function() {
      mapsService.setMapExpiry($scope.mapObj, $scope.expiryDate, function() {
        $scope.expiryDate = null;
        $mdDialog.hide();
      });

    };

    $scope.resetMap = function(ev) {
      $scope.completionDate = new Date();
      $mdDialog.show({templateUrl: 'partials/modules/maps/view/diag/resetMap.tpl',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          parentScope:$scope
        },
        controller: function($scope, $mdDialog, parentScope) {
          $scope.parentScope = parentScope;
          parentScope.resetForm = $scope.resetForm;
        }
      });
    };

    $scope.completeMap = function() {
      mapsService.stopMapAssgn($scope.mapObj, $scope.completionDate, function() {
        $mdDialog.hide();
        // reload the map object
        $scope.loadPartial();
      });
    };

    $scope.cancelResetMap = function() {
      $mdDialog.hide();
    };

    $scope.goHome = function() {
      $location.path('/maps/home');
    };

    $scope.getMapClass = function(mapItem) {
      var mapData = mapItem.data;
      // check if map is started
      var today = moment();
      if ($scope.startedMaps) {
        for (var i=0; i < $scope.startedMaps.length; i++) {
          if ($scope.startedMaps[i].id == mapItem.id) {
            // check if already expired
            var expiry = moment(mapData.assgn.expiry);
            if (expiry.isAfter(today)) {
              return 'md-warn md-hue-2';
            }
            return 'md-warn md-hue-3';
          }
        }
      }
      // check when map was last completed, return a subtle warning status if completed within the last 2 months
      if (mapData.lastCompleted) {
        var completed = moment(mapData.lastCompleted);
        var twoMonthsAgo = moment().subtract(2, 'month');
        if (completed.isAfter(twoMonthsAgo) ) {
          return 'md-warn md-hue-1';
        } else {
          return 'md-accent md-hue-1';
        }
      }
      // return the primary status if never worked on
      return 'md-primary';
    };

    $scope.openAddrMenu = function($mdOpenMenu, ev) {
      console.log(ev.target.type);
      // TODO: improve disabling of md-menu-list-item proxy handling
      // https://material.angularjs.org/latest/api/directive/mdListItem
      if (ev.target.type == undefined) {
        $mdOpenMenu(ev);
      }
    };

    $scope.moveAdd = function(ev, mapAddress) {
      $scope.mapSearchRes = {found:false, mapAddress: mapAddress};
      $mdDialog.show({templateUrl: 'partials/modules/maps/view/diag/moveMap.tpl',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          parentScope:$scope,
        },
        controller: function($scope, $mdDialog, parentScope) {
          $scope.parentScope = parentScope;
          parentScope.moveAddForm = $scope.moveAddForm;
        }
      });
    };

    $scope.cancelMoveAdd = function() {
      $scope.mapSearchRes = null;
      $mdDialog.hide();
    };

    $scope.searchMapNum = function() {
      $scope.mapSearchRes.searching = true;
      $scope.mapSearchRes.mapName = "";
      $scope.mapSearchRes.found = false;
      mapsService.findMapByNum($scope.mapSearchRes.mapNum, function(searchRes) {
        $scope.mapSearchRes.searching = false;
        if (searchRes.length > 0) {
          $scope.mapSearchRes.found = true;
          $scope.mapSearchRes.target = searchRes[0];
          $scope.mapSearchRes.mapName = searchRes[0].value.name;
        }
      });
    };

    $scope.moveAddToMap = function() {
      if ($scope.mapSearchRes.found == true) {
        mapsService.moveAddToMap($scope.mapSearchRes.mapAddress.addId, $scope.mapSearchRes.target.value, $scope.mapSearchRes.target.key, function() {
        console.log("Map address");
        console.log($scope.mapSearchRes.mapAddress);
          mapsService.deleteAdd($scope.mapObj, $scope.mapSearchRes.mapAddress, function() {
            $scope.mapSearchRes = null;
            $mdDialog.hide();
            $scope.loadPartial();
          }, false);
        });
      } else {
        $log.debug("No map specified to move to.");
      }
    };

    $scope.editMap = function(ev) {
      $scope.editMapData = {fsgListRef: $scope.fsgListRef, mapRef:$scope.mapObj.mapData, saving:false, fromFsgName: $scope.mapObj.mapData.fsg};
      $mdDialog.show({templateUrl: 'partials/modules/maps/view/diag/map.tpl',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          parentScope:$scope,
          title: "Edit Map",
          map: $scope.editMapData
        },
        controller: function($scope, $mdDialog, parentScope, title, map) {
          $scope.parentScope = parentScope;
          parentScope.editMapForm = $scope.editMapForm;
          $scope.map = map;
        }
      });
      $log.debug($scope.editMapData);
    };

    $scope.cancelEditMap = function() {
      $scope.editMapData = null;
      $mdDialog.hide();
    };

    $scope.saveEditMap = function() {
      $scope.editMapData.saving = true;
      // when null, we're adding a new FSG
      if ($scope.editMapData.fromFsgName == null) {
        mapsService.addNewMap($scope.editMapData.mapRef.name, $scope.editMapData.mapRef.fsg, function() {
          $scope.editMapData = null;
          $mdDialog.hide();
          // add to cache
          $scope.loadPartial();
        });
      } else {
        mapsService.moveMapToFsg($scope.mapId, $scope.editMapData.mapRef, $scope.editMapData.fromFsgName, $scope.editMapData.mapRef.fsg, function() {
          $scope.editMapData = null;
          $mdDialog.hide();
        });
      }
    };

    $scope.exportMapToCsv = function(ev, mapObj) {
      var csvArr = [['Address Title', 'House Number', 'Street', 'Suburb', 'State', 'Latitude', 'Longitude']]
      var csvContent = "data:text/csv;charset=utf-8,";
      var addArr = $scope.getAddrArr(mapObj);
      csvArr = csvArr.concat(addArr);
      var csvContent = $scope.arrToCsv(csvArr);

      $scope.downloadHref = encodeURI(csvContent);
      $scope.downloadFile = $scope.mapObj.mapData.terId + '.csv';
      var a = document.getElementById('downloadA');
      $timeout(function() {
        a.click();
      });
    };

    $scope.getAddrArr = function(mapObj) {
      $log.debug(mapObj);
      $log.debug("-------------------------");
      var csvArr = [];
      angular.forEach(mapObj.addresses, function(add) {
        csvArr.push([mapObj.mapData.terId + '|' + mapObj.mapData.name, add.addData.hnum, add.addData.st, add.addData.burb, add.addData.state == null ? 'Queensland' : add.addData.state, add.addData.clat, add.addData.clong]);
      });

      return csvArr;
    };

    $scope.arrToCsv = function(csvArr) {
      var csvContent = "";
       angular.forEach(csvArr, function(csvElem, index){
        var dataStr = '"' + csvElem.join('","') + '"';
        csvContent += index < csvArr.length ? dataStr + "\n" : dataStr;
      });
      return csvContent;
    };


    $scope.exportAllMapsToCsv = function(ev) {
      var csvArrHdr = [['Address Title', 'House Number', 'Street', 'Suburb', 'State', 'Latitude', 'Longitude']]
      var fileHeader = "data:text/csv;charset=utf-8,";
      var mapCtr = 0;
      var mapRequest = 0;
      var mapGroup = 0;
      var csvArr = [].concat(csvArrHdr);
      var procMapFn = function(mapItem) {
        $log.debug("Getting map:" + mapItem.id);
        mapsService.getMapAddr(mapItem.id, function(mapObj) {
          var addArr = $scope.getAddrArr(mapObj);
          csvArr = csvArr.concat(addArr);
          mapCtr++;
          $log.debug("Map ctr: " + mapCtr + " of " + $scope.allMapsList.length);
          if (mapCtr >= $scope.allMapsList.length || (mapCtr % 20 == 0)) {
            var csvContent = $scope.arrToCsv(csvArr);
            $scope.downloadHref = encodeURI(fileHeader+ csvContent);
            $scope.downloadFile = 'AllMaps_' + mapGroup + '.csv';
            mapGroup++;
            var a = document.getElementById('downloadA');
            $timeout(function() {
              $log.debug("Clicking");
              a.click();
              if (mapCtr < $scope.allMapsList.length) {
                csvArr = [].concat(csvArrHdr);
                procMapFn($scope.allMapsList[mapCtr]);
              }
            }, 500);
          } else {
            procMapFn($scope.allMapsList[mapCtr]);
          }
        });
        mapRequest++;
      };
      procMapFn($scope.allMapsList[mapCtr]);
    };

    $scope.addMap = function(ev, fsg) {
      $scope.editMapData = {fsgListRef: $scope.fsgListRef, mapRef:{name:null, fsg:fsg}, saving:false, fromFsgName: null};

      $mdDialog.show({templateUrl: 'partials/modules/maps/view/diag/map.tpl',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          parentScope:$scope,
          title: "New Map",
          map: $scope.editMapData
        },
        controller: function($scope, $mdDialog, parentScope, title, map) {
          $scope.parentScope = parentScope;
          parentScope.editMapForm = $scope.editMapForm;
          $scope.map = map;
        }
      });
    };

    $scope.shareMap = function(ev) {
      $scope.shareMapData = {expiryDate: $scope.mapObj.assgn.shareExpiryDate ? moment($scope.mapObj.assgn.shareExpiryDate).toDate() : moment().add(2, 'weeks').toDate(), pubName: $scope.mapObj.assgn.sharePubName};

      $mdDialog.show({templateUrl: 'partials/modules/maps/view/diag/shareMap.tpl',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          parentScope:$scope
        },
        controller: function($scope, $mdDialog, parentScope) {
          $scope.parentScope = parentScope;
          parentScope.shareMapForm = $scope.shareMapForm;
        }
      });
    };

    $scope.cancelShare = function() {
      $scope.shareMapData = null;
      $mdDialog.hide();
    };

    $scope.saveShare = function() {
      mapsService.shareMap($scope.shareMapData.pubName, $scope.shareMapData.expiryDate, function() {
        $scope.cancelShare();
      });
    };

    $scope.loadPartial();
  }
]);
})();