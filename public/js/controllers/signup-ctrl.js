angular.module('FavoritePlaces').controller('SignupCtrl', function($scope, UsersService) {

	$scope.clickSignup = function() {
		if ($scope.password !== $scope.password2) {
			$scope.error = "Please make sure your passwords match. :)";
			return;
		}
		UsersService.signup($scope.email, $scope.password).then(function(new_user) {
			console.log("success!", new_user);
		}).catch(function(err) {
			$scope.error = err.message;
		});
	};
});