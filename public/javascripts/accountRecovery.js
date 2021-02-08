var app = angular.module("accountRecovery",[]);

app.controller("accountRecoveryControl",['$scope','$http','$timeout','$window',function accountRecoveryControl ($scope,$http,$timeout,$window){
	

	$scope.patronEmail = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/;
	$scope.showLoader = false;
	
	$scope.validar = function(evento){
		if(!$scope.patronEmail.test($scope.form.email))
		{
			evento.preventDefault();
			$window.alert('The email\'s format is incorrect please try again.');
		}
		else
		{
			$scope.showLoader = true;
			$http.post('/accountRecovery/resetPassword/',$scope.form)
			.success(function(data){
				$scope.showLoader = false;
					
				$timeout(function(){	
					//Si los datos recibidos indican que el correo se envío con éxito.
					if(data !== null)
					{
						$window.alert('We have sent you an email with the instructions to reset your password.');
						$timeout(function(){
							$window.location.href = 'http://'+mainUrl;
						},300);
					}
					else //Si no se envía con éxito porque el correo no está en la base de datos..
					{
						$window.alert('The email you entered doesn\'t exist in our databse. Please type in a valid one.');
					}
				},300);
				
			})
			.error(function(err){
				$scope.showLoader = false;
				$window.alert('There was an error in the connection or the email doesn\'t exist in our database. Please try again.');
			});
		}
	};
}]);