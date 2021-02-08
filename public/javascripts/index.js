var app = angular.module("index",[]);

app.controller("indexControl",['$scope','$timeout','$window',function indexControl ($scope,$timeout,$window){

	/** Este controlador debe tener funciones de validación para los campos de login **/

	//Variable para validar el email
    
    $scope.patronEmail = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/;

    //Variables del formulario

    $scope.user = {};

    $scope.showError = 'error-hidden';
    $scope.showLoader = false;

    
    /** Esta función valida los campos del formulario antes de ser enviados **/

    $scope.validar = function(enviar){

        $scope.showLoader = true;

    	if(angular.isUndefined($scope.user.email) || $scope.user.email === null)
    	{
    		enviar.preventDefault();
            $window.alert('Please type in a valid email.');
            $scope.user.email = '';
            $scope.user.password = '';
            $scope.showLoader = false;
    	}
    	else
    	{
    		if(angular.isUndefined($scope.user.password) || $scope.user.password === null)
    		{
    			enviar.preventDefault();
                $window.alert('Please type in your password.');
                $scope.user.email = '';
                $scope.user.password = '';
                $scope.showLoader = false;
    		}
    		else
    		{
    			if($scope.checks>=3)
    			{
    				enviar.preventDefault();
    				$window.alert('More than 3 wrong attempts. Please wait a few minutes and try again.');
                    $scope.user = {};
                    $scope.showError = 'error-hidden';
                    $scope.user.email = '';
                    $scope.user.password = '';
    			}
                $scope.showLoader = false;
    		}
    	}
    	
    };


    $timeout(function(){
    	if($scope.checks>0)
 			$scope.showError = 'errorUno';
 		if($scope.checks>1)
 			$scope.showError = 'errorDos';
 		if($scope.checks>2)
 			$scope.showError = 'errorTres';
    },100);








	/** Debe tener una opción para la descarga de la app  **/

	/** Debe haber un slide y posibles reseñas **/


}]);