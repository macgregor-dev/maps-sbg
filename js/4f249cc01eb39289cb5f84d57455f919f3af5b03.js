'use strict';
var resolveAuth = {
  "currentAuth": ["Auth", function(Auth) {
    return Auth.$requireAuth();
  }] 
};
angular.module('mainApp', [
  'ngMaterial', 
  'firebase', 
  'ngRoute',
  'ngMessages',
  'ngSanitize',
  
  ,'ecclesia.maps'
  
  ,'ecclesia.auth'
  
])
.config(['$mdThemingProvider', '$mdIconProvider', function($mdThemingProvider, $mdIconProvider) {
    $mdIconProvider
    
    .icon("menu", "svg/menu.svg", 24 )
    
    .icon("print", "svg/icon_printer-alt-512px-aliceblue.svg", 24 )
    
    .icon("save", "svg/save-512px-aliceblue.svg", 24 )
    
    .icon("newadd", "svg/list-add-below-512px-aliceblue.svg", 24 )
    
    .icon("close", "svg/close-round-512px-aliceblue.svg", 24 )
    
    .icon("play", "svg/play-512px-aliceblue.svg", 24 )
    
    .icon("reset", "svg/reset-512px-aliceblue.svg", 24 )
    
    .icon("stop", "svg/icon_stop_alt-512px-aliceblue.svg", 24 )
    
    .icon("expand-more", "svg/android-expand-more-512px-aliceblue.svg", 24 )
    
    .icon("expand-less", "svg/android-expand-less-512px-aliceblue.svg", 24 )
    
    .icon("back", "svg/arrow_back-512px-aliceblue.svg", 24 )
    
    .icon("home", "svg/home-512px-aliceblue.svg", 24 )
    
    .icon("calendar", "svg/fi-calendar-512px-aliceblue.svg", 24 )
    
    .icon("more:vertical", "svg/android-more-vert-512px-black.svg", 12 )
    
    .icon("arrow:up", "svg/android-arrow-drop-up-512px-black.svg", 12 )
    
    .icon("arrow:down", "svg/android-arrow-drop-down-512px-black.svg", 12 )
    
    .icon("search", "svg/search-512px-aliceblue.svg", 12 )
    
    .icon("edit", "svg/lnr-pencil.svg", 12 )
    
    .icon("export", "svg/export-30px.svg", 12 )
    
    .icon("add", "svg/add.svg", 12 )
    
    .icon("delete", "svg/delete-aliceblue.svg", 12 )
    
    .icon("share", "svg/share-aliceblue.svg", 12 )
    
    $mdThemingProvider.theme('default')
   .primaryPalette('indigo')
   .accentPalette('blue');
}])
.config(['$routeProvider', function($routeProvider) {
  
    
  $routeProvider.when('/maps/home', {templateUrl: 'partials/modules/maps/view/mapsHome.html', controller: 'mapsCtrl' 
    
      , resolve: resolveAuth
    
  });
      
    
  $routeProvider.when('/maps/detail/:mapId', {templateUrl: 'partials/modules/maps/view/mapsDetail.html', controller: 'mapsCtrl' 
    
      , resolve: resolveAuth
    
  });
      
    
  $routeProvider.when('/maps/print/:mapId', {templateUrl: 'partials/modules/maps/view/mapsDetailPrint.html', controller: 'mapsCtrl' 
    
      , resolve: resolveAuth
    
  });
      
    
  $routeProvider.when('/maps/admin', {templateUrl: 'partials/modules/maps/view/mapsAdmin.html', controller: 'mapsAdminCtrl' 
    
      , resolve: resolveAuth
    
  });
      
    
  $routeProvider.when('/maps/search', {templateUrl: 'partials/modules/maps/view/mapsSearch.html', controller: 'mapsSearchCtrl' 
    
      , resolve: resolveAuth
    
  });
      
    
  
    
  $routeProvider.when('/auth/:action', {templateUrl: 'partials/modules/auth/view/login.html', controller: 'authCtrl' 
    
  });
      
    
  $routeProvider.when('/user/:action', {templateUrl: 'partials/modules/auth/view/login.html', controller: 'authCtrl' 
    
      , resolve: resolveAuth
    
  });
      
    
  
  $routeProvider.otherwise({redirectTo: '/auth/login'});
}])
.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = function(date) {
    return moment(date).format('DD-MM-YYYY');
  };
  $mdDateLocaleProvider.parseDate = function(dateString) {
    var m = moment(dateString, 'DD-MM-YYYY', true);
    return m.isValid() ? m.toDate() : new Date(NaN);
  };
}])
.config(['$compileProvider', function($compileProvider) {
   $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|ftp|mailto|data):/);
}])
.run(['$rootScope', '$mdSidenav', '$location', '$routeParams', function($rootScope, $mdSidenav, $location, $routeParams) {
  $rootScope.menuTitle = "";
  $rootScope.menuItems = [];
  $rootScope.modules = {};
  $rootScope.menuSelected = null;
  $rootScope.subMenuSelected = null;
  $rootScope.showSideNav = false;
  $rootScope.headerTitle = "Sunnybank Group - Brisbane, QLD";
  $rootScope.rejectedUrl = '/maps/home';
  
  // Event handlers...
  $rootScope.$on('$routeChangeSuccess', function(next, current) {
    // try to load the modules if we don't have any menu items...
    if ($rootScope.menuItems.length == 0) {
      $rootScope.loadModules();
    }
//    var path = $location.path().substring(1);
//    var moduleName = path.substring(0, path.indexOf('/'));
//    $rootScope.updateMenu(moduleName, $routeParams, $rootScope.modules[moduleName].defaultMenu);
  });
  
  $rootScope.$on('$routeChangeError', function(angularEvent,current,previous,rejection) {
    console.log('Route Change Error');
    console.log(current);
    console.log(previous);
    $location.path('');
  });
  
  // The custom functions...
  $rootScope.loadModules = function() {
    // take note that routeName identifies the module within the app
    
      $rootScope.registerModule({name:'maps', 
                                 menuItems: JSON.parse('[{"name":"home","label":"All Maps","description":"Maps Home","title":"Maps Assigned","visible":true,"link":"#/maps/home"}]'), 
                                 defaultMenu:'home'});
    
      $rootScope.registerModule({name:'auth', 
                                 menuItems: JSON.parse('[{"name":"mapssearch","label":"Search","description":"Search","title":"Search","visible":true,"link":"#/maps/search"},{"name":"changepwd","label":"Change Password","description":"Change Password","title":"Change Password","visible":true,"link":"#/user/update"},{"name":"logout","label":"Logout","description":"Logout","title":"Logout","visible":true,"link":"#/auth/logout"}]'), 
                                 defaultMenu:'changepwd'});
    
  };
  $rootScope.registerModule = function(moduleObj) {
    // take note that routeName identifies the module within the app
    if ($rootScope.hasModule(moduleObj.routeName) == false) {
      $rootScope.modules[moduleObj.name] = moduleObj;
      if (moduleObj.menuItems) {
        for (var i=0; i< moduleObj.menuItems.length; i++) { 
          var menuItem = moduleObj.menuItems[i];
          menuItem.moduleName = moduleObj.name;
          if (menuItem.visible == undefined) {
            menuItem.visible = true;
          }
          if (menuItem.subMenuItems) {
            for (var j=0; j< menuItem.subMenuItems.length; j++) {
              if (menuItem.subMenuItems[j].visible == undefined) {
                menuItem.subMenuItems[j].visible = true;
              }
            }
          }
        }
      }
      $rootScope.menuItems = $rootScope.menuItems.concat(moduleObj.menuItems);
    }
  };
  $rootScope.hasModule = function(name) {
    return $rootScope.modules.hasOwnProperty(name);
  };
  $rootScope.getModule = function(name) {
    return $rootScope.modules[name];
  };
  $rootScope.selectMenu = function(moduleName, menuName) {
    var moduleObj = $rootScope.modules[moduleName];
    var menu;
    for (var i=0; i<moduleObj.menuItems.length; i++) {
      if (moduleObj.menuItems[i].name === menuName) {
        menu = moduleObj.menuItems[i];
        break;
      }
    }
    $rootScope.menuSelected = menu;
    $rootScope.subMenuSelected = null;
    if (menu) {
      $rootScope.partialTitle = menu.title;
    }
    return menu;
  };
  $rootScope.selectSubMenu = function(moduleName, menuName, subMenuName) {
    var menu = $rootScope.selectMenu(moduleName, menuName);
    var submenu;
    if (menu != null) {
      for (var i=0; i<menu.subMenuItems.length; i++) {
        if (menu.subMenuItems[i].name === subMenuName) {
          submenu = menu.subMenuItems[i];
          break;
        }
      }
    }
    $rootScope.subMenuSelected = submenu;
    return submenu;
  };
  $rootScope.toggleMenuOrSubmenu = function(moduleName, menuName, submenu) {
    var moduleObj = $rootScope.getModule(moduleName);
    var menuObj = $rootScope.getItemWithName(moduleObj.menuItems, menuName);
    if (menuObj != null) { 
      if (submenu != null) {
        submenuObj = $rootScope.getItemWithName(menuObj.subMenuItems, submenu);
        if (submenuObj != null) {
          submenuObj.visible = !menuObj.visible;
        }
      } else {
        menuObj.visible = !menuObj.visible; // toggle the container
      }
    }
  };
  $rootScope.toggleSideNav = function() {
    $mdSidenav('left').toggle();
  };
  $rootScope.updateMenu = function(moduleName, $routeParams, defaultMenu) {
    if ($routeParams.submenu != null) {
      $rootScope.selectSubMenu(moduleName, $routeParams.menu, $routeParams.submenu);
    } else if ($routeParams.menu != null) {
      $rootScope.selectMenu(moduleName, $routeParams.menu);
    } else {
      $rootScope.selectMenu(moduleName, defaultMenu);
    }
  };
  $rootScope.getLandingPage = function() {
    return $rootScope.rejectedUrl;
  };
  $rootScope.getItemWithName = function(listObj, name) {
    for (var i=0; i<listObj.length; i++) {
      if (listObj[i].name === name) {
        return listObj[i];
      }
    }
    return null;
  };
   
}])
;