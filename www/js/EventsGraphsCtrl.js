// This controller generates a graph for events
// the main function is generateChart. I call generate chart with required parameters
// from the template file

angular.module('zmApp.controllers').controller('zmApp.EventsGraphsCtrl', function ($ionicPlatform, $scope, ZMDataModel, $ionicSideMenuDelegate, $rootScope, $http) {
    console.log("Inside Graphs controller");
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }

    $scope.navTitle = 'Tab Page';
    $scope.leftButtons = [{
        type: 'button-icon icon ion-navicon',
        tap: function (e) {
            $scope.toggleMenu();
        }
        }];

    $scope.generateChart = function (chartTitle) {

        $scope.chartObject = {};
        $scope.chartObject.data = [
        ['Monitor', 'Events', {
                role: 'style'
        }, {
                role: 'annotation'
        }],
        ['', 0, '', ''] // needed to get rid of the initial error of charts
                        // FIXME: does it really work? I noticed the red warning
                        // coming up on the device
      ];


        $scope.chartObject.type = "BarChart";
        $scope.chartObject.options = {
            title: chartTitle,
            height: $rootScope.devHeight, // FIXME: I need to make this dynamic depending on
            // # of bars
            legend: 'none',
            animation: {
                duration: 700,
                easing: 'out',
                startup: 'false',
            },


        }

        var monitors = [];
        var loginData = ZMDataModel.getLogin();
        console.log("*** Grabbing lists of events and monitors ");
        ZMDataModel.getMonitors(0).then(function (data) {

            monitors = data;

            for (var i = 0; i < monitors.length; i++) {
                (function (j) { // loop closure - http is async, so success returns after i goes out of scope
                    // so we need to bind j to i when http returns so its not out of scope. Gak.
                    // I much prefer the old days of passing context data from request to response

                    var url = loginData.apiurl +
                        "/events/index/MonitorId:" + monitors[j].Monitor.Id + // FIXME: need to add hr/week
                        ".json?page=1";
                    console.log("Monitor event URL:" + url);
                    $http.get(url)
                        .success(function (data) {
                            console.log("**** EVENT COUNT FOR MONITOR " +
                                monitors[j].Monitor.Id + " IS " + data.pagination.count);

                            console.log("Pushing " + monitors[j].Monitor.Name +
                                " AND " + data.pagination.count);

                            $scope.chartObject.data.push([monitors[j].Monitor.Name, data.pagination.count,
                          'opacity: 0.4', data.pagination.count]);

                        })
                        .error(function (data) {
                            // ideally I should be treating it as an error
                            // but what I am really doing now is treating it like no events
                            // works but TBD: make this into a proper error handler
                            console.log("**** EVENT COUNT FOR MONITOR " +
                                monitors[i].Monitor.Id + " IS ERROR ");
                            $scope.chartObject.data.push([monitors[j].Monitor.Name,
                                                      0, 'opacity: 0.4', 0]);

                        });

                })(i); // j

            } //for

        });

    }; // scope function

});
