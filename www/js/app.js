// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('bgw', ['ionic', 'ngCordova', 'bgw.controllers', 'bgw.bleServices', 'leaflet-directive', 'bgw.dataservices', 'bgw.aboutUsServices', 'bgw.guideServices', 'bgw.networkService'])

  .run(function ($ionicPlatform, $ionicPopup, networkService, bleService) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      var checkNetwork = 0;
      networkService.startClock(function () {
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            if (checkNetwork == 0) {
              // $ionicLoading.hide();
              checkNetwork = 1;
              $ionicPopup.confirm({
                title: 'No Internet Connection',
                content: 'Please Enable your Wifi or Cellular Data'
              })
                .then(function (result) {
                  checkNetwork = 0;
                  // if (device.platform == "Android") {
                  //ionic.Platform.exitApp();
                  // }
                });
            }
          }
          else {
            checkNetwork = 0;
          }
        }
      });

      var checkBluetooth = 0;
      bleService.startClock(function () {
        ble.isEnabled(
          function (message) {
            checkBluetooth = 0;
          },
          function (message) {
            if (checkBluetooth == 0) {
              checkBluetooth = 1;
              $ionicPopup.confirm({
                title: 'No Bluetooth Connection',
                content: 'Sorry,The Bluetooth connection appears to be offline. Please reconnect and try again.'
              })
                .then(function (result) {
                  checkBluetooth = 0;
                });
            }
          });
      });
    })
  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.aboutUs', {
        url: '/aboutUs',
        views: {
          'tab-aboutUs': {
            templateUrl: 'templates/tab-aboutUs.html',
            controller: 'aboutUsCtrl',
            controllerAs: "model"
          }
        }
      })

      .state('tab.guide', {
        url: '/guide',
        views: {
          'tab-guide': {
            templateUrl: 'templates/tab-guide.html',
            controller: 'guideCtrl',
            controllerAs: "model"
          }
        }
      })

      .state('tab.readingsList', {
        url: '/readingsList',
        /*cache: false,*/
        views: {
          'tab-readings-list': {
            templateUrl: 'templates/tab-readings-list.html',
            controller: 'WellListController',
            controllerAs: "model"
          }
        }
      })
      .state('tab.readingsDetail', {
        url: '/readingsList/active/:readingId',
        views: {
          'tab-readings-list': {
            templateUrl: 'templates/readings-detail.html',
            controller: 'WellDetailController',
            controllerAs: "model"
          }
        }
      })

      .state('tab.readingsDetailInactive', {
        url: '/readingsList/inActive/:readingId',
        views: {
          'tab-readings-list': {
            templateUrl: 'templates/readings-detail-inactive.html',
            controller: 'WellDetailInactiveController',
            controllerAs: "model"
          }
        }
      })

      .state('tab.readingsError', {
        url: '/readingsList/error',
        views: {
          'tab-readings-list': {
            templateUrl: 'templates/noWifi.html'
            //controller: 'ChatDetailCtrl'
          }
        }
      })

      .state('tab.readingsDetailMap', {
        url: '/readingsMap/:readingId',
        views: {
          'tab-readings-map': {
            templateUrl: 'templates/readings-detail-map.html',
            controller: 'WellDetailController',
            controllerAs: "model"
          }
        }
      })

      .state('tab.readingsDetailMapNotInRange', {
        url: '/readingsMap/Inactive/:readingId',
        views: {
          'tab-readings-map': {
            templateUrl: 'templates/readings-detail-inactive.html',
            controller: 'WellDetailInactiveController',
            controllerAs: "model"
          }
        }
      })

      .state('tab.readingsMap', {
        url: '/readingsMap',
        /*cache: false,*/
        views: {
          'tab-readings-map': {
            templateUrl: 'templates/tab-readings-map-g.html',
            controller: 'MapCtrl1',
            controllerAs: "model"
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/readingsList');

  });
