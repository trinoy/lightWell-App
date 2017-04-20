angular.module('bgw.aboutUsServices', [])

  .factory('AboutUs', function ($http) {

    return {

      getAboutUs : function(){
        var req = {
          method: 'GET',
          url: "http://lightwell-server.herokuapp.com/api/bgw/aboutUs/bgw",
          headers: {'Content-Type': 'application/json'}
        };
        return $http(req);
      }



    };
  });
