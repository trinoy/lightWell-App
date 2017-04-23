angular.module('bgw.controllers', [])

  .controller('WellListController', function (bleService, $ionicPlatform, $scope, $ionicLoading, $state, $ionicPopup, wellService) {


    var vm = this;
    //vm.wellZones = {};
    //vm.devices = bleService.devices;
    vm.devices_all = bleService.devices;


    function removeDuplicates(originalArray, prop) {
      var newArray = [];
      var lookupObject = {};

      for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
      }

      for (i in lookupObject) {
        lookupObject[i].wellName = lookupObject[i].name.split("-")[0];
        lookupObject[i].wellReading = lookupObject[i].name.split("-")[1];
        newArray.push(lookupObject[i]);
      }
      return newArray;
    }

    vm.updateBleStatusInZones = function (bleDevices) {
      var zonesIndex;
      var wellIndex;
      var ble;
      for (zonesIndex in vm.wellZones) {
        if (vm.wellZones[zonesIndex].installed == true) {
          for (wellIndex in vm.wellZones[zonesIndex].wells) {
            //well = vm.wellZones[zonesIndex].wells[wellIndex];
            for (bleIndex in bleDevices) {
              ble = bleDevices[bleIndex];
              if (ble.wellName == vm.wellZones[zonesIndex].wells[wellIndex].wellShortName) {
                vm.wellZones[zonesIndex].wells[wellIndex].inRange = true;
                vm.wellZones[zonesIndex].wells[wellIndex].reading = ble.wellReading;
                break;
              }
            }
          }
          break;
        }
      }
    };


    vm.resetWellClusters1 = function () {
      var zonesIndex;
      var wellIndex;
      for (zonesIndex in vm.wellZones) {
        if (vm.wellZones[zonesIndex].installed == true) {
          for (wellIndex in vm.wellZones[zonesIndex].wells) {
            vm.wellZones[zonesIndex].wells[wellIndex].inRange = false;
            vm.wellZones[zonesIndex].wells[wellIndex].reading = "0.00";
          }
          break;
        }
      }
    };


    vm.splitWells = function (wellZones) {
      vm.wellSplitInfo = {};
      vm.wellSplitInfo.activeNearBy = [];
      vm.wellSplitInfo.active = [];
      vm.wellSplitInfo.inactive = [];
      var zonesIndex;
      var wellIndex;
      var well;
      for (zonesIndex in wellZones) {
        for (wellIndex in wellZones[zonesIndex].wells) {
          well = wellZones[zonesIndex].wells[wellIndex];
          if (well.installed == true && well.inRange == true) {
            vm.wellSplitInfo.activeNearBy.push(well);
          }
          else if (well.installed == true && well.inRange == false) {
            vm.wellSplitInfo.active.push(well);
          }
          else if (well.installed == false) {
            vm.wellSplitInfo.inactive.push(well);
          }
        }
      }
    };


    vm.show = function () {
      $ionicLoading.show({
        template: '<p>Let`s Find a Well...</p><ion-spinner></ion-spinner>'
      });
    };

    vm.hide = function () {
      $ionicLoading.hide();
    };

    vm.success = function () {
      vm.hide($ionicLoading);
      if (vm.devices_all.length < 1) {
        vm.splitWells(vm.wellZones);
        $ionicPopup.alert({
          title: "Oops, it seems there are no active wells nearby.",
          content: "Please move closer to an active well location and swipe down to refresh the list."
        }).then(function (result) {
          if (!result) {
            //ionic.Platform.exitApp();
          }
        });
      }
      else {
        var devices = removeDuplicates(vm.devices_all, "id");
        vm.updateBleStatusInZones(devices);
        vm.splitWells(vm.wellZones);
      }

    };

    vm.failure = function (error) {
      vm.splitWells(vm.wellZones);
      vm.hide($ionicLoading);
    };

    vm.show($ionicLoading);
    $ionicPlatform.ready(function () {
      wellService.getWellMetaData()
        .then(function () {
            vm.wellZones = wellService.devicesMetaData;
            vm.splitWells(vm.wellZones);
            return bleService.scan();
          }
        )
        .then(function () {
          vm.success();
        })
        .catch(function (error) {
          vm.failure();
        });
    });

    vm.onRefresh = function () {
      vm.devices = [];
      vm.resetWellClusters1();
      //vm.wellSplitInfo = {};
      //vm.wellSplitInfo.activeNearBy = [];
      //vm.wellSplitInfo.active = [];
      //vm.wellSplitInfo.inactive = [];
      if (vm.devices_all != undefined) {
        vm.devices_all.length = 0;
      }
      else {
        vm.devices_all = bleService.devices;
      }

      bleService.scan().then(
        vm.success, vm.failure
      ).finally(
        function () {
          vm.hide($ionicLoading);
          $scope.$broadcast('scroll.refreshComplete');
        }
      )
    }

  })


  .controller('WellDetailController', function ($scope, $stateParams, wellService, $ionicPopup) {
    var vm = this;
    vm.wid = $stateParams.readingId;
    vm.wellName = vm.wid.split("-")[0];
    vm.wellReading = vm.wid.split("-")[1];
    vm.date = dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT");
    vm.uploadData = function () {
      var wellReading = {"value": vm.wellReading};
      wellService.uploadData(vm.wellName, wellReading)
        .success(function (well) {
          console.log("upload success" + well);
          $ionicPopup.alert({
            title: "Reading Uploaded Successfully.",
            content: "Thank You. Please check other active wells nearby."
          }).then(function (result) {
          });
        })
        .error(function (error) {
          console.log(error);
          alert("Something went wrong. Please try after sometime.");
        });
    }
  })

  .controller('WellDetailInactiveController', function ($scope, $stateParams, wellService) {
    var vm = this;
    vm.wellName = $stateParams.readingId;
    //vm.well = {};
    vm.getLastData = function () {
      wellService.getWellLastReadingByName(vm.wellName)
        .success(function (well) {
          if (well.wellReadings.length == 0) {
            well.wellReadings = [];
            well.wellReadings.push({value: "0.00"});
            vm.well = well;
          }
          else {
            vm.well = well;
          }
        })
        .error(function (error) {
          console.log(error);
          alert("Something went wrong. Please try after sometime.");
        });
    }();
  })

  .controller('aboutUsCtrl', function ($ionicPlatform, $scope, AboutUs, $cordovaInAppBrowser) {
    var vm = this;

    vm.options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'yes'
    };

    AboutUs.getAboutUs()
      .success(function (aboutUs) {
        console.log("fetch success");
        //$scope.plotMap(wellZones);
        vm.aboutUs = aboutUs;
        //alert("Data Uploaded Successfully");
      })
      .error(function (error) {
        console.log(error);
        // alert("Something went wrong. Please try after sometime");
      });

    vm.goToBGW = function () {
      $cordovaInAppBrowser.open('http://www.bostongroundwater.org/well-map-page.html', '_blank', vm.options)
        .then(function (event) {
          // success
        })
        .catch(function (event) {
          // error
        });
    }

    vm.goToLightWell = function () {
      $cordovaInAppBrowser.open('http://www.bostonlightwell.com/', '_blank', vm.options)
        .then(function (event) {
          // success
        })
        .catch(function (event) {
          // error
        });
    }

  })

  .controller('guideCtrl', function ($ionicPlatform, $scope, Guide) {

    var vm = this;
    /*Guide.getGuides()
      .success(function (guides) {
        console.log("fetch success");
        //$scope.plotMap(wellZones);
        vm.guide = guides;
        //alert("Data Uploaded Successfully");
      })
      .error(function (error) {
        console.log(error);
        // alert("Something went wrong. Please try after sometime");
      });*/

  })

  .controller('MapCtrl1', function ($scope, $state, bleService, wellService, $ionicLoading, $ionicPopup) {

    var vm = this;
    vm.wellZones = {};
    vm.devices_all = bleService.devices;

    vm.show = function () {
      $ionicLoading.show({
        template: '<p>Loading the map with Wells Near by</p><ion-spinner></ion-spinner>'
      });
    };

    vm.hide = function () {
      $ionicLoading.hide();
    };

    function removeDuplicates(originalArray, prop) {
      var newArray = [];
      var lookupObject = {};

      for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
      }

      for (i in lookupObject) {
        lookupObject[i].wellName = lookupObject[i].name.split("-")[0];
        lookupObject[i].wellReading = lookupObject[i].name.split("-")[1];
        newArray.push(lookupObject[i]);
      }
      return newArray;
    }

    vm.updateBleStatusInZones = function (bleDevices) {
      var zonesIndex;
      var wellIndex;
      var ble;
      var bleIndex;
      for (zonesIndex in vm.wellZones) {
        if (vm.wellZones[zonesIndex].installed == true) {
          for (wellIndex in vm.wellZones[zonesIndex].wells) {
            //well = vm.wellZones[zonesIndex].wells[wellIndex];
            for (bleIndex in bleDevices) {
              ble = bleDevices[bleIndex];
              if (ble.wellName == vm.wellZones[zonesIndex].wells[wellIndex].wellShortName) {
                vm.wellZones[zonesIndex].wells[wellIndex].inRange = true;
                vm.wellZones[zonesIndex].wells[wellIndex].reading = ble.wellReading;
                break;
              }
            }
          }
          break;
        }
      }
    };

    vm.resetWellClusters = function () {
      var zonesIndex;
      var wellIndex;
      for (zonesIndex in vm.wellZones) {
        if (vm.wellZones[zonesIndex].installed == true) {
          for (wellIndex in vm.wellZones[zonesIndex].wells) {
            vm.wellZones[zonesIndex].wells[wellIndex].inRange = false;
            vm.wellZones[zonesIndex].wells[wellIndex].reading = "0.00";
          }
          break;
        }
      }
    };


    vm.show($ionicLoading);
    wellService.getWellMetaData()
      .then(function () {
        vm.wellZones = wellService.devicesMetaData;
        return bleService.scan();
        //vm.success();
      })
      .then(function () {
        vm.success();
      })
      .catch(function (error) {
        vm.plotMap(vm.wellZones);
        vm.hide($ionicLoading);
      });

    vm.success = function () {
      vm.hide($ionicLoading);
      if (vm.devices_all.length < 1) {
        // a better solution would be to update a status message rather than an alert
        $ionicPopup.alert({
          title: "Oops, it seems there are no active wells nearby.",
          content: "Please move closer to an active well location and refresh the map."
        }).then(function (result) {
          if (result) {
            //ionic.Platform.exitApp();
            vm.plotMap(vm.wellZones);
          }
        });
      }
      else {
        var devices = removeDuplicates(vm.devices_all, "id");
        vm.updateBleStatusInZones(devices);
        vm.plotMap(vm.wellZones);
      }

    };

    vm.failure = function (error) {
      vm.hide($ionicLoading);
    };


    vm.onRefresh = function () {
      vm.show($ionicLoading);
      vm.devices = [];
      vm.resetWellClusters();
      if (vm.devices_all != undefined) {
        vm.devices_all.length = 0;
      }
      else {
        vm.devices_all = bleService.devices;
      }

      bleService.scan().then(
        vm.success, vm.failure
      ).finally(
        function () {
          vm.hide($ionicLoading);
          $scope.$broadcast('scroll.refreshComplete');
        }
      )
    };


    vm.plotMap = function (wellZones) {
      var firstWell = wellZones[0].wells[0];
      var latLng = new google.maps.LatLng(firstWell.lat, firstWell.lng);

      var mapOptions = {
        zoom: 14,
        center: latLng,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP]//, google.maps.MapTypeId.HYBRID]
        },
        disableDefaultUI: true,
        mapTypeControl: true,
        scaleControl: true,
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };


      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
      $scope.map.setOptions({styles: mapStyle});


      google.maps.event.addListenerOnce($scope.map, 'idle', function () {

        var markers = [];
        var marker;
        var markerClusters = [];
        var wellPaths = [];
        var markerCluster;
        var i;
        var wellPath;
        var j;
        var wellPlanCoordinates = [];
        var wellPathColor;
        var well;
        var wellCoordinate;
        var url;
        var gridSizeCluster;
        var maxZoomCluster;

        for (i = 0; i < wellZones.length; i++) {

          markers = [];
          //markerClusters = [];
          wellPlanCoordinates = [];

          for (j = 0; j < wellZones[i].wells.length; j++) {
            wellCoordinate = {};
            wellCoordinate.lat = wellZones[i].wells[j].lat;
            wellCoordinate.lng = wellZones[i].wells[j].lng;
            wellPlanCoordinates.push(wellCoordinate);
            well = wellZones[i].wells[j];
            //markers = wellClusters[i].wells.map(function (well) {

            if (well.installed == true && well.inRange == true) {
              url = "img/mr.svg";
              //$scope.map.setZoom(16);
              //$scope.map.setCenter(new google.maps.LatLng(wellCoordinate.lat, wellCoordinate.lng));
            }
            else if (well.installed == true && well.inRange == false) {
              url = "img/mnr.svg";
            }
            else {
              url = "img/mi.svg";
            }

            marker = new google.maps.Marker({
              position: {lat: well.lat, lng: well.lng},
              animation: google.maps.Animation.DROP,
              label: {
                text: well.wellShortName,
                color: "#000000",
                fontSize: "15px"
                // fontWeight: "bold"
              },
              icon: {
                url: url,
                size: new google.maps.Size(80, 80),
                origin: new google.maps.Point(0, 0),
                //anchor: new google.maps.Point(0,0),
                scaledSize: new google.maps.Size(80, 80),
                labelOrigin: new google.maps.Point(40, 30)
              }

            });

            if (well.installed == true && well.inRange == true) {
              attachSecretMessageInRange(marker, well);
            }
            else if (well.installed == true && well.inRange == false) {
              attachSecretMessageNotInRange(marker, well);
            }
            else {
              attachSecretMessageInActive(marker);
            }

            markers.push(marker);


            function attachSecretMessageInRange(marker, well) {
              marker.addListener('click', function () {
                $state.go("tab.readingsDetailMap", {'readingId': well.wellShortName.concat("-").concat(well.reading)});
                //$state.go('tab.readings-detail');
                //infowindow.open(marker.get('map'), marker);
              });
            }

            function attachSecretMessageNotInRange(marker, well) {
              marker.addListener('click', function () {
                $state.go("tab.readingsDetailMapNotInRange", {'readingId': well.wellShortName});

              });
            }

            function attachSecretMessageInActive(marker) {
              marker.addListener('click', function () {
                var infowindow = new google.maps.InfoWindow({
                  content: '<h5>Well is not active. Please go to an active zone to find a well in range.</h5>'
                });
                infowindow.open($scope.map, marker);

              });
            }

          }
          if (wellZones[i].installed == true) {
            wellPathColor = '#186cc5';
            gridSizeCluster = 1000;
            maxZoomCluster = 15;
          }
          else {
            wellPathColor = '#afafaf';
            gridSizeCluster = 1000;
            maxZoomCluster = 15;
          }

          wellPath = new google.maps.Polyline({
            path: wellPlanCoordinates,
            geodesic: true,
            strokeColor: wellPathColor,
            strokeOpacity: 1.0,
            strokeWeight: 2
          });

          wellPath.setMap($scope.map);
          wellPath.setVisible(false);
          wellPaths.push(wellPath);

          //  markers.push(marker);
          markerCluster = new MarkerClusterer(
            $scope.map,
            markers,
            {
              //averageCenter: true,
              maxZoom: maxZoomCluster,
              gridSize: gridSizeCluster,
              styles: wellZones[i].clusterStyle,
              zoomOnClick: false
              //imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            }
          );

          if (wellZones[i].installed == false) {
            vm.infomsg1 = wellZones[i].activationInfo;
            markerCluster.addListener('clusterclick', function (cluster) {
              var offset = 0.1 / Math.pow(2, $scope.map.getZoom());
              var infowindow = new google.maps.InfoWindow({
                content: '<h5>' + vm.infomsg1 + '</h5>'

              });
              infowindow.setPosition({
                lat: cluster.center_.lat() * (1 + offset),
                lng: cluster.center_.lng()
              });
              infowindow.open($scope.map);
            });
          }
          else {
            vm.infomsg2 = wellZones[i].activationInfo;
            markerCluster.addListener('clusterclick', function (cluster) {
              var offset = 0.1 / Math.pow(2, $scope.map.getZoom());
              var infowindow = new google.maps.InfoWindow({
                content: '<h5>' + vm.infomsg2 + '</h5>'

              });
              infowindow.setPosition({
                lat: cluster.center_.lat() * (1 + offset),
                lng: cluster.center_.lng()
              });
              infowindow.open($scope.map);
            });
          }


          markerClusters.push(markerCluster);
        }

        google.maps.event.addListener($scope.map, 'bounds_changed', function () {
          //alert($scope.map.getZoom());
          if ($scope.map.getZoom() >= 16) {
            wellPaths.map(function (wellPath) {
              wellPath.setVisible(true);
            });

            //  wellPaths[1].setVisible(true);
          }
          else {
            // wellPaths[0].setVisible(false);
            wellPaths.map(function (wellPath) {
              wellPath.setVisible(false);
            });
          }
        });
      });
    }
  });


