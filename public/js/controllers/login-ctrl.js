angular.module('FavoritePlaces').controller('LoginCtrl', function($scope, $location, UsersService) {

	$scope.clickLogin = function() {
		UsersService.login($scope.email, $scope.password).then(function() {
			$location.path('/places');
		}).catch(function(err) {
			$scope.error = err;
		});;
	};
});