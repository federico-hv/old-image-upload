var app = angular.module("passwordChange",[]);


app.controller("passwordChangeController",['$scope', '$http','$window','$timeout',function passwordChangeController($scope, $http, $window, $timeout) {
	
	$scope.showLoader = false;
	
	$scope.validar = function(evento){
		if($scope.form.pass1 !== $scope.form.pass2)
		{
			$window.alert('Passwords are different. Please type in the same password in both inputs');
			$scope.form.pass1 = '';
			$scope.form.pass2 = '';
			evento.preventDefault();
		}
		else
		{
			if($scope.form.pass1.length === 0)
			{
				$window.alert('Inputs are empty. Please type in a password.');
				evento.preventDefault();
			}
			else
			{

				$scope.showLoader = true;
				$http.post('/passwordChange/changePassword/'+$scope.key+'/',$scope.form)
				.success(function(data){
					$scope.showLoader = false;			
					$timeout(function(){
						$window.alert('Your password has been successfully reset.');
						$window.location.href = 'http://'+mainUrl;
					},300);
				})
				.error(function(){
					$scope.showLoader = false;
					$window.alert('There has been an error. Please try again');
				});
			}
		}
	};
}]);
    
   