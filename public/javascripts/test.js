var app = angular.module("test",[]);


app.controller("cont",['$scope', '$http', '$window',function controlador($scope, $http, $window) {
	alert('THIS WORKS WITH ANGULAR JS');
}]);
    