angular.module('FavoritePlaces').controller('PlacesCtrl', function($scope, PlacesService, places) {
	
	$scope.places = places;
	$scope.skip_places = 0;
	$scope.limit = 10;

	var load = function() {
		PlacesService.getPlaces($scope.skip_places).then(function(places) {
			$scope.places = places;
		});
	};

	$scope.nextPage = function() {
		$scope.skip_places += $scope.limit;
		load();
	};
	$scope.prevPage = function() {
		$scope.skip_places -= $scope.limit;
		load();
	};

	$scope.clickAdd = function() {
		PlacesService.addPlace($scope.newPlace).then(function(place) {
			$scope.newPlace = {};
			$scope.places.push(place);
		});
	};
});